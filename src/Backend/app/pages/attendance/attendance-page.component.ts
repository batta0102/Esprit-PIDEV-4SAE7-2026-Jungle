import { Component, OnInit, signal, computed, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { AdvancedApiService } from '../../../../core/api/services/advanced-api.service';
import { Session, Course } from '../../../../core/api/models';
import { AttendanceStatus, AttendanceSessionType } from '../../../../core/api/models/attendance.model';
import { EarlyWarning } from '../../../../core/api/models/attendance.models';
import { MOCK_STUDENTS } from '../../../../core/api/mocks/students.mock';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AttendanceCardsComponent } from '../../components/attendance-cards/attendance-cards.component';
import { AttendanceChartComponent, AttendanceSummary, WeeklyAttendancePoint } from '../../components/attendance-chart/attendance-chart.component';
import { AttendanceRiskComponent } from '../../components/attendance-risk/attendance-risk.component';
import { AttendanceTableComponent } from '../../components/attendance-table/attendance-table.component';
import { PageStepperComponent } from '../../../../Frontend/app/shared/page-stepper/page-stepper.component';

export interface AttendanceRecord {
  sessionId: number;
  studentId: number;
  status: AttendanceStatus;
  note?: string;
  sessionType?: 'Online' | 'On-site';
  sessionLabel?: string;
  courseId?: string | number;
  courseLabel?: string;
  markedAt?: string;
}

type WarningLevel = 'URGENT' | 'CONCERN' | 'WATCH';

interface EarlyWarningView {
  studentId: number;
  studentName: string;
  currentRate: number;
  predictedRateIn2Weeks: number;
  warningLevel: WarningLevel;
}

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AttendanceCardsComponent, AttendanceChartComponent, AttendanceRiskComponent, AttendanceTableComponent, PageStepperComponent],
  templateUrl: './attendance-page.component.html',
  styles: [`
    @media print {
      :host .hide-on-print { display: none !important; }
    }
  `]
})
export class AttendancePageComponent implements OnInit {
  private readonly sessionApi = inject(SessionApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly advancedApi = inject(AdvancedApiService);

  records = signal<AttendanceRecord[]>([]);
  /** All sessions loaded for filters + selection. */
  sessions = signal<Session[]>([]);
  courses = signal<Course[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  loadingAttendance = signal(false);
  attendanceError = signal<string | null>(null);
  isUsingMockData = signal(false);
  isEmptyState = signal(false);
  lastUpdated = signal<Date | null>(null);

  /** Currently selected session for "Load Students". */
  selectedSessionId = signal<number | null>(null);

  searchQuery = signal('');
  filterSessionType = signal<'all' | 'Online' | 'On-site'>('all');
  filterStatus = signal<AttendanceStatus | null>(null);
  filterCourseId = signal<string | null>(null);
  filterRisk = signal<'all' | 'high' | 'medium' | 'low'>('all');

  earlyWarnings = signal<EarlyWarningView[]>([]);
  loadingEarlyWarnings = signal(false);
  earlyWarningsError = signal<string | null>(null);

  /** Pending status changes keyed by sessionId-studentId. */
  pendingStatus = signal<Record<string, AttendanceStatus>>({});
  pendingNote = signal<Record<string, string | undefined>>({});
  bulkSaving = signal(false);
  bulkError = signal<string | null>(null);
  bulkTotal = signal(0);
  bulkSaved = signal(0);

  modalOpen = signal(false);
  modalSubmitting = signal(false);
  modalError = signal<string | null>(null);
  formSessionType = signal<AttendanceSessionType>('ONLINE');
  formSessionId = signal<number | null>(null);
  formStudentId = signal<number | null>(null);
  formStatus = signal<AttendanceStatus>('PRESENT');
  formNote = signal('');

  draftPrompt = signal<{
    key: string;
    rows: { key: string; status?: AttendanceStatus; note?: string }[];
  } | null>(null);

  toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  courseMap = computed(() => {
    const map: Record<string, string> = {};
    this.courses().forEach((c) => (map[String(c.id)] = c.title ?? '-'));
    return map;
  });

  sessionOptions = computed(() => {
    const list = this.sessions();
    const type = this.filterSessionType();
    if (type !== 'all') {
      const match = type === 'On-site' ? 'On-site' : 'Online';
      return list.filter((s) => (s.type ?? 'Online') === match);
    }
    return list;
  });

  formSessionOptions = computed(() => {
    const list = this.sessions();
    const type = this.formSessionType();
    const match = type === 'ONSITE' ? 'On-site' : 'Online';
    return list.filter((s) => (s.type ?? 'Online') === match);
  });

  stats = computed(() => {
    const list = this.records();
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    list.forEach((r) => {
      const s = (r.status ?? '').toUpperCase();
      if (s === 'PRESENT') present++;
      else if (s === 'ABSENT') absent++;
      else if (s === 'LATE') late++;
      else if (s === 'EXCUSED') excused++;
    });
    return { total: list.length, present, absent, late, excused };
  });

  attendanceSummary = computed<AttendanceSummary | null>(() => {
    const s = this.stats();
    if (s.total === 0) return null;
    const total = s.total;
    const presentRate = Math.round((s.present / total) * 100);
    const absentRate = Math.round((s.absent / total) * 100);
    return {
      total,
      present: s.present,
      absent: s.absent,
      presentRate,
      absentRate
    };
  });

  weeklyAttendance = computed<WeeklyAttendancePoint[]>(() => {
    const groups = new Map<string, { label: string; present: number; absent: number }>();
    this.records().forEach((r) => {
      if (!r.markedAt) return;
      const d = new Date(r.markedAt);
      if (Number.isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const week = this.getWeekNumber(d);
      const key = `${year}-${week}`;
      const label = `W${week} ${year}`;
      const existing = groups.get(key) ?? { label, present: 0, absent: 0 };
      const status = (r.status ?? '').toUpperCase();
      if (status === 'PRESENT') existing.present += 1;
      else if (status === 'ABSENT') existing.absent += 1;
      groups.set(key, existing);
    });
    const arr = Array.from(groups.values()).sort((a, b) => {
      const [aWeekLabel, aYearLabel] = a.label.split(' ');
      const [bWeekLabel, bYearLabel] = b.label.split(' ');
      const aWeek = Number(aWeekLabel.replace('W', ''));
      const bWeek = Number(bWeekLabel.replace('W', ''));
      const aYear = Number(aYearLabel);
      const bYear = Number(bYearLabel);
      if (aYear !== bYear) return aYear - bYear;
      return aWeek - bWeek;
    });
    return arr.slice(-6);
  });

  filteredRecords = computed(() => {
    let list = [...this.records()];
    const q = (this.searchQuery() ?? '').trim().toLowerCase();
    const typeFilter = this.filterSessionType();
    const statusFilter = this.filterStatus();
    const courseFilter = this.filterCourseId();
    const riskFilter = this.filterRisk();
    const courseMap = this.courseMap();

    if (q) {
      list = list.filter((r) => {
        const sessionStr = (r.sessionLabel ?? String(r.sessionId)).toLowerCase();
        const courseStr = (r.courseLabel ?? '').toLowerCase();
        const studentStr = String(r.studentId).toLowerCase();
        const studentNameStr = this.getStudentName(r.studentId).toLowerCase();
        const statusStr = (r.status ?? '').toLowerCase();
        const noteStr = (r.note ?? '').toLowerCase();
        return [sessionStr, courseStr, studentStr, studentNameStr, statusStr, noteStr].some((x) => x.includes(q));
      });
    }
    if (typeFilter !== 'all') {
      const match = typeFilter === 'On-site' ? 'On-site' : 'Online';
      list = list.filter((r) => r.sessionType === match);
    }
    if (statusFilter != null) {
      list = list.filter((r) => (r.status ?? '').toUpperCase() === statusFilter.toUpperCase());
    }
    if (courseFilter != null && courseFilter !== '') {
      list = list.filter((r) => String(r.courseId) === courseFilter);
    }
    if (riskFilter !== 'all') {
      list = list.filter((r) => {
        const rate = this.getAttendanceRateForStudent(r.studentId);
        return this.getRiskLevel(rate) === riskFilter;
      });
    }
    return list;
  });

  dirtyMap = computed(() => {
    const status = this.pendingStatus();
    const notes = this.pendingNote();
    const result: Record<string, boolean> = {};
    this.records().forEach((r) => {
      const key = this.recordKey(r);
      if (status[key] !== undefined || notes[key] !== undefined) {
        result[key] = true;
      }
    });
    return result;
  });

  readonly statusOptions: { value: AttendanceStatus; label: string }[] = [
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'LATE', label: 'Late' },
    { value: 'EXCUSED', label: 'Excused' }
  ];

  /** Temporary mock students until user-service is integrated. */
  readonly mockStudents = MOCK_STUDENTS;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      courses: this.courseApi.getCourses().pipe(catchError(() => of([]))),
      sessions: this.sessionApi.getSessions().pipe(
        catchError((err) => {
          this.error.set(err?.message ?? 'Failed to load sessions');
          return of([]);
        })
      )
    }).subscribe({
      next: ({ courses, sessions }) => {
        this.courses.set(Array.isArray(courses) ? courses : []);
        const sessionList = Array.isArray(sessions) ? sessions : [];
        this.sessions.set(sessionList);
        if (!this.selectedSessionId() && sessionList.length > 0) {
          this.selectedSessionId.set(Number(sessionList[0].id));
        }
        this.lastUpdated.set(new Date());
        this.loadAttendanceRecords(sessionList, Array.isArray(courses) ? courses : []);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to load');
        this.records.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadAttendanceRecords(sessions: Session[], courses: Course[]): void {
    this.loadingAttendance.set(true);
    this.attendanceError.set(null);
    this.isUsingMockData.set(false);
    this.isEmptyState.set(false);

    const courseMap: Record<string, string> = {};
    courses.forEach((c) => (courseMap[String(c.id)] = c.title ?? '-'));
    const selectedId = this.selectedSessionId();
    const toFetch: Session[] = selectedId != null
      ? sessions.filter((s) => String(s.id) === String(selectedId))
      : [];

    const selectedCourseId = this.resolveCourseIdForWarnings(toFetch);
    if (selectedCourseId != null) {
      this.loadEarlyWarnings(selectedCourseId);
    } else {
      this.earlyWarnings.set([]);
      this.earlyWarningsError.set(null);
      this.loadingEarlyWarnings.set(false);
    }

    if (toFetch.length === 0) {
      this.records.set([]);
      this.isEmptyState.set(true);
      this.loadingAttendance.set(false);
      this.loading.set(false);
      return;
    }
    const typeParam = (s: Session) => ((s.type ?? 'Online') === 'On-site' ? 'ONSITE' : 'ONLINE');
    const requests = toFetch.map((s) =>
      this.advancedApi.getSessionAttendance(typeParam(s), Number(s.id)).pipe(
        map((att): AttendanceRecord[] =>
          (att ?? []).map((a) => ({
            sessionId: a.sessionId,
            studentId: a.studentId,
            status: a.status,
            note: a.note,
            sessionType: (s.type ?? 'Online') as 'Online' | 'On-site',
            sessionLabel: `Session #${s.id}`,
            courseId: s.courseId,
            courseLabel: courseMap[String(s.courseId)] ?? '-',
            markedAt: (a as unknown as { markedAt?: string }).markedAt
          }))
        )
      )
    );
    forkJoin(requests).subscribe({
      next: (results) => {
        const flat = results.reduce<AttendanceRecord[]>((acc, r) => acc.concat(r), []);
        this.records.set(flat);
        this.isEmptyState.set(flat.length === 0);
        this.isUsingMockData.set(false);
        this.lastUpdated.set(new Date());
        this.loadingAttendance.set(false);
        this.loading.set(false);
        this.pendingStatus.set({});
        this.pendingNote.set({});
        this.checkDraftForCurrentSession();
      },
      error: (err) => {
        this.attendanceError.set(this.getErrorMessage(err));
        this.records.set([]);
        this.isEmptyState.set(false);
        this.isUsingMockData.set(false);
        this.loadingAttendance.set(false);
        this.loading.set(false);
      }
    });
  }

  loadEarlyWarnings(courseId: number): void {
    this.loadingEarlyWarnings.set(true);
    this.earlyWarningsError.set(null);

    this.advancedApi.getEarlyWarnings(courseId).subscribe({
      next: (warnings: EarlyWarning[]) => {
        const mapped = (warnings ?? [])
          .map((warning) => this.toEarlyWarningView(warning))
          .sort((a, b) => this.warningPriority(a.warningLevel) - this.warningPriority(b.warningLevel));
        this.earlyWarnings.set(mapped);
        this.loadingEarlyWarnings.set(false);
      },
      error: (error: unknown) => {
        this.earlyWarnings.set([]);
        this.earlyWarningsError.set(this.getErrorMessage(error));
        this.loadingEarlyWarnings.set(false);
      }
    });
  }

  getErrorMessage(error: unknown): string {
    const err = error as {
      status?: number;
      message?: string;
      originalError?: { status?: number; error?: { message?: string } };
    };
    const status = err?.status ?? err?.originalError?.status;
    const backendMessage = err?.originalError?.error?.message ?? err?.message;

    if (status === 404) return 'Donnees non trouvees';
    if (status === 409) return backendMessage || 'Conflit metier detecte';
    if (status === 500) return 'Erreur serveur, reessayez';
    if (status === 0 || /network|failed to fetch|net::err/i.test(String(backendMessage ?? ''))) {
      return 'Impossible de contacter le serveur';
    }
    return backendMessage || 'Erreur inattendue';
  }

  warningLevelBadgeClass(level: WarningLevel): string {
    if (level === 'URGENT') return 'bg-red-100 text-red-800 border border-red-200';
    if (level === 'CONCERN') return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-blue-100 text-blue-800 border border-blue-200';
  }

  private warningPriority(level: WarningLevel): number {
    if (level === 'URGENT') return 0;
    if (level === 'CONCERN') return 1;
    return 2;
  }

  private resolveCourseIdForWarnings(sessions: Session[]): number | null {
    const first = sessions[0];
    if (!first?.courseId) return null;
    const value = Number(first.courseId);
    return Number.isNaN(value) ? null : value;
  }

  private toEarlyWarningView(warning: EarlyWarning): EarlyWarningView {
    const source = warning as unknown as Record<string, unknown>;
    const studentId = this.toNumberOrDefault(source['studentId'], 0);
    const currentRate = this.toNumberOrDefault(
      source['currentRate'] ?? source['attendanceRate'] ?? source['score'],
      0
    );
    const predictedRateIn2Weeks = this.toNumberOrDefault(
      source['predictedRateIn2Weeks'] ?? source['predictedRate'] ?? source['score'],
      currentRate
    );
    const warningLevel = this.toWarningLevel(
      source['warningLevel'] ?? source['riskLevel']
    );
    const studentNameRaw = source['studentName'];
    const studentName =
      typeof studentNameRaw === 'string' && studentNameRaw.trim() !== ''
        ? studentNameRaw.trim()
        : this.getStudentName(studentId);

    return {
      studentId,
      studentName,
      currentRate,
      predictedRateIn2Weeks,
      warningLevel
    };
  }

  private toWarningLevel(value: unknown): WarningLevel {
    const normalized = String(value ?? '').toUpperCase();
    if (normalized === 'URGENT' || normalized === 'HIGH') return 'URGENT';
    if (normalized === 'CONCERN' || normalized === 'MEDIUM') return 'CONCERN';
    return 'WATCH';
  }

  private toNumberOrDefault(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  openMarkModal(): void {
    this.modalError.set(null);
    this.formSessionId.set(null);
    this.formStudentId.set(null);
    this.formStatus.set('PRESENT');
    this.formNote.set('');
    this.formSessionType.set('ONLINE');
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.modalError.set(null);
  }

  submitMarkAttendance(): void {
    const sessionId = this.formSessionId();
    const studentId = this.formStudentId();
    if (sessionId == null || studentId == null) {
      this.modalError.set('Session and Student ID are required.');
      return;
    }
    this.modalSubmitting.set(true);
    this.modalError.set(null);
    const payload = {
      sessionType: this.formSessionType(),
      sessionId,
      studentId,
      status: this.formStatus(),
      note: this.formNote().trim() || undefined
    };
    this.advancedApi.markAttendance(payload).subscribe({
      next: () => {
        this.modalSubmitting.set(false);
        this.closeModal();
        this.load();
      },
      error: (err) => {
        this.modalError.set(err?.message ?? 'Failed to mark attendance');
        this.modalSubmitting.set(false);
      }
    });
  }

  statusBadgeClass(status: string): string {
    const s = (status ?? '').toUpperCase();
    if (s === 'PRESENT') return 'bg-green-100 text-green-800';
    if (s === 'ABSENT') return 'bg-red-100 text-red-800';
    if (s === 'LATE') return 'bg-orange-100 text-orange-800';
    if (s === 'EXCUSED') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  }

  /** Solid badge (white text) for table. */
  statusBadgeSolidClass(status: string): string {
    const s = (status ?? '').toUpperCase();
    if (s === 'PRESENT') return 'bg-green-600 text-white';
    if (s === 'ABSENT') return 'bg-red-600 text-white';
    if (s === 'LATE') return 'bg-orange-500 text-white';
    if (s === 'EXCUSED') return 'bg-blue-600 text-white';
    return 'bg-gray-600 text-white';
  }

  formatDate(value: string | undefined): string {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString('en-GB');
    } catch {
      return String(value);
    }
  }

  trackByRecord(_index: number, r: AttendanceRecord): string {
    return `${r.sessionId}-${r.studentId}`;
  }

  str(v: unknown): string {
    return String(v);
  }

  num(v: unknown): number {
    return Number(v);
  }

  parseStudentId(value: string | number | null | undefined): number | null {
    if (value === '' || value == null) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  effectiveNote(r: AttendanceRecord): string | undefined {
    const key = this.recordKey(r);
    const pending = this.pendingNote()[key];
    return pending !== undefined ? pending : r.note;
  }

  /** Resolve student name from mock data (temporary until user-service). */
  getStudentName(studentId: number): string {
    const student = this.mockStudents.find((s) => s.id === studentId);
    return student ? student.name : String(studentId);
  }

  /** Initial for avatar circle (first letter of name). */
  getStudentInitial(studentId: number): string {
    const name = this.getStudentName(studentId);
    return name && name !== String(studentId) ? name.charAt(0).toUpperCase() : String(studentId).charAt(0);
  }

  studentProgressList = computed(() => {
    const list = this.records();
    return this.mockStudents.map((stu) => {
      const forStudent = list.filter((r) => r.studentId === stu.id);
      const total = forStudent.length;
      const present = forStudent.filter((r) => (r.status ?? '').toUpperCase() === 'PRESENT').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      const missed = total - present;
      let lastAttendance: string | null = null;
      let lastMissed: string | null = null;
      forStudent.forEach((r) => {
        if (r.markedAt) {
          const ts = new Date(r.markedAt).getTime();
          if (!Number.isNaN(ts)) {
            if (!lastAttendance || ts > new Date(lastAttendance).getTime()) lastAttendance = r.markedAt;
            if ((r.status ?? '').toUpperCase() === 'ABSENT') {
              if (!lastMissed || ts > new Date(lastMissed).getTime()) lastMissed = r.markedAt;
            }
          }
        }
      });
      return {
        id: stu.id,
        name: stu.name,
        rate,
        total,
        missed,
        present,
        eligible: rate >= 75,
        lastAttendance,
        lastMissed
      };
    });
  });

  /** Risk level from attendance rate: < 60 High, 60-80 Medium, >= 80 Low. */
  getRiskLevel(rate: number): 'high' | 'medium' | 'low' {
    if (rate < 60) return 'high';
    if (rate < 80) return 'medium';
    return 'low';
  }

  /** Aggregated alerts list: students below 60% attendance. */
  attendanceAlerts = computed(() => this.studentProgressList().filter((s) => s.rate < 60 && s.total > 0));

  /** Students grouped by risk level for the "Students At Risk" section (includes missed count). */
  studentsByRisk = computed(() => {
    const list = this.studentProgressList();
    const high: { id: number; name: string; rate: number; total: number; missed: number }[] = [];
    const medium: { id: number; name: string; rate: number; total: number; missed: number }[] = [];
    const low: { id: number; name: string; rate: number; total: number; missed: number }[] = [];
    list.forEach((sp) => {
      const level = this.getRiskLevel(sp.rate);
      const item = { id: sp.id, name: sp.name, rate: sp.rate, total: sp.total, missed: sp.missed };
      if (level === 'high') high.push(item);
      else if (level === 'medium') medium.push(item);
      else low.push(item);
    });
    return { high, medium, low };
  });

  /** Overview metrics for dashboard: total students, avg attendance, at-risk count and rate. */
  overviewMetrics = computed(() => {
    const list = this.studentProgressList();
    const totalStudents = list.length;
    if (totalStudents === 0) {
      return { totalStudents: 0, avgAttendance: 0, atRiskCount: 0, atRiskRate: 0 };
    }
    const sumRates = list.reduce((acc, s) => acc + s.rate, 0);
    const avgAttendance = Math.round(sumRates / totalStudents);
    const byRisk = this.studentsByRisk();
    const atRiskCount = byRisk.high.length + byRisk.medium.length;
    const atRiskRate = Math.round((atRiskCount / totalStudents) * 100);
    return { totalStudents, avgAttendance, atRiskCount, atRiskRate };
  });

  /** Counts per risk level for the "Students by Risk Level" bar. */
  riskLevelBreakdown = computed(() => {
    const byRisk = this.studentsByRisk();
    return {
      high: byRisk.high.length,
      medium: byRisk.medium.length,
      low: byRisk.low.length
    };
  });

  /** Top at-risk students (worst attendance first), max 10. */
  topAtRiskStudents = computed(() => {
    const byRisk = this.studentsByRisk();
    const combined = [
      ...byRisk.high.map((s) => ({ name: s.name, rate: s.rate, level: 'high' as const })),
      ...byRisk.medium.map((s) => ({ name: s.name, rate: s.rate, level: 'medium' as const })),
      ...byRisk.low.map((s) => ({ name: s.name, rate: s.rate, level: 'low' as const }))
    ]
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 10);
    return combined;
  });

  /** For Risk Monitoring sidebar: show only first 3 student progress cards by default. */
  showAllStudentProgress = signal(false);
  studentProgressPreview = computed(() => this.studentProgressList().slice(0, 3));
  studentProgressDisplay = computed(() =>
    this.showAllStudentProgress() ? this.studentProgressList() : this.studentProgressPreview()
  );
  studentProgressTotalCount = computed(() => this.studentProgressList().length);

  /** Active section for tab navigation (used for button highlight and scroll). */
  activeSection = signal<'alerts' | 'overview' | 'management' | 'risk'>('overview');
  setActiveSection(section: 'alerts' | 'overview' | 'management' | 'risk'): void {
    this.activeSection.set(section);
    document.getElementById('section-' + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  hasAttendanceAlerts = computed(() => this.attendanceAlerts().length > 0);

  /** Dynamic insight for dashboard (e.g. "3 students need follow-up"). */
  insightMessage = computed(() => {
    const m = this.overviewMetrics();
    const high = this.studentsByRisk().high.length;
    const medium = this.studentsByRisk().medium.length;
    if (m.totalStudents === 0) return 'No student data yet. Load attendance to see insights.';
    if (high > 0 && medium > 0) return high + ' high-risk and ' + medium + ' medium-risk students need follow-up.';
    if (high > 0) return high + ' student(s) need urgent follow-up (attendance below 60%).';
    if (medium > 0) return medium + ' student(s) at medium risk — consider early intervention.';
    if (m.avgAttendance >= 80) return 'All students on track. Average attendance at ' + m.avgAttendance + '%.';
    return 'Monitor attendance to keep everyone on track.';
  });

  /** Keyboard shortcuts: 1–4 jump to sections (when not in input). */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT') return;
    const sections: Array<'alerts' | 'overview' | 'management' | 'risk'> = ['alerts', 'overview', 'management', 'risk'];
    const key = e.key;
    const idx = key === '1' ? 0 : key === '2' ? 1 : key === '3' ? 2 : key === '4' ? 3 : -1;
    if (idx >= 0 && idx < sections.length) {
      e.preventDefault();
      this.setActiveSection(sections[idx]);
    }
  }

  /** Open print dialog for report. */
  printReport(): void {
    window.print();
  }

  /** Formatted last updated for display. */
  lastUpdatedFormatted = computed(() => {
    const d = this.lastUpdated();
    if (!d) return null;
    return d.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  });

  /** CSS classes for risk level: High=red, Medium=orange, Low=green. */
  riskLevelBadgeClass(level: 'high' | 'medium' | 'low'): string {
    if (level === 'high') return 'bg-red-600 text-white';
    if (level === 'medium') return 'bg-orange-500 text-white';
    return 'bg-green-600 text-white';
  }

  /** Card/border highlight for risk level. */
  riskLevelCardClass(level: 'high' | 'medium' | 'low'): string {
    if (level === 'high') return 'border-red-400 bg-red-50';
    if (level === 'medium') return 'border-orange-400 bg-orange-50';
    return 'border-green-400 bg-green-50';
  }

  /** Attendance rate for a student (from progress list). Used for Risk Level column. */
  getAttendanceRateForStudent(studentId: number): number {
    const sp = this.studentProgressList().find((s) => s.id === studentId);
    return sp ? sp.rate : 0;
  }

  /** Risk level label for display. */
  getRiskLevelLabel(level: 'high' | 'medium' | 'low'): string {
    if (level === 'high') return 'High Risk';
    if (level === 'medium') return 'Medium Risk';
    return 'Low Risk';
  }

  /** Pagination: page size and current page. */
  pageSize = 10;
  currentPage = signal(1);
  pagedRecords = computed(() => {
    const list = this.filteredRecords();
    const totalP = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalP);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRecords().length / this.pageSize)));
  paginationInfo = computed(() => {
    const list = this.filteredRecords();
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + (list.length ? 1 : 0);
    const end = Math.min(page * this.pageSize, list.length);
    return { start, end, total: list.length };
  });

  constructor() {
    effect(() => {
      const total = this.totalPages();
      if (this.currentPage() > total) this.currentPage.set(1);
    });
  }

  goToPage(p: number): void {
    const max = this.totalPages();
    if (p >= 1 && p <= max) this.currentPage.set(p);
  }

  formatDateShort(value: string | undefined): string {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleDateString('en-GB');
    } catch {
      return String(value);
    }
  }

  /** Aggregate stats for a student: present/total/missed and last dates. */
  getStudentAttendanceStats(studentId: number): {
    total: number;
    present: number;
    missed: number;
    lastAttendance: string | null;
    lastMissed: string | null;
  } {
    const list = this.records().filter((r) => r.studentId === studentId);
    const total = list.length;
    const present = list.filter((r) => (r.status ?? '').toUpperCase() === 'PRESENT').length;
    const missed = total - present;
    let lastAttendance: string | null = null;
    let lastMissed: string | null = null;
    list.forEach((r) => {
      if (!r.markedAt) return;
      const ts = new Date(r.markedAt).getTime();
      if (Number.isNaN(ts)) return;
      if (!lastAttendance || ts > new Date(lastAttendance).getTime()) lastAttendance = r.markedAt;
      if ((r.status ?? '').toUpperCase() === 'ABSENT') {
        if (!lastMissed || ts > new Date(lastMissed).getTime()) lastMissed = r.markedAt;
      }
    });
    return { total, present, missed, lastAttendance, lastMissed };
  }

  /** Key for maps / tracking. */
  recordKey(r: AttendanceRecord): string {
    return `${r.sessionId}-${r.studentId}`;
  }

  /** Effective status including pending change. */
  effectiveStatus(r: AttendanceRecord): AttendanceStatus {
    const key = this.recordKey(r);
    const pending = this.pendingStatus();
    return (pending[key] ?? r.status) as AttendanceStatus;
  }

  /** Update pending status for a row. */
  changeRowStatus(r: AttendanceRecord, status: AttendanceStatus): void {
    const key = this.recordKey(r);
    const current = this.pendingStatus();
    const next = { ...current };
    const original = r.status;
    if (original === status) {
      delete next[key];
    } else {
      next[key] = status;
    }
    this.pendingStatus.set(next);
    this.saveDraftIfAny();
  }

  changeRowNote(r: AttendanceRecord, note: string): void {
    const key = this.recordKey(r);
    const current = this.pendingNote();
    const next = { ...current };
    const trimmed = note;
    if ((r.note ?? '') === trimmed) {
      delete next[key];
    } else {
      next[key] = trimmed;
    }
    this.pendingNote.set(next);
    this.saveDraftIfAny();
  }

  hasPendingChanges = computed(() => {
    return Object.keys(this.pendingStatus()).length > 0 || Object.keys(this.pendingNote()).length > 0;
  });

  saveAllChanges(): void {
    const pendingStatus = this.pendingStatus();
    const pendingNote = this.pendingNote();
    const keys = Array.from(new Set([...Object.keys(pendingStatus), ...Object.keys(pendingNote)]));
    if (!keys.length || this.bulkSaving()) return;
    const allRecords = this.records();
    const requests = keys
      .map((key) => {
        const [sessionIdStr, studentIdStr] = key.split('-');
        const sessionId = Number(sessionIdStr);
        const studentId = Number(studentIdStr);
        const record = allRecords.find((r) => r.sessionId === sessionId && r.studentId === studentId);
        if (!record) return null;
        const sessionType: AttendanceSessionType =
          (record.sessionType ?? 'Online') === 'On-site' ? 'ONSITE' : 'ONLINE';
        const status = this.effectiveStatus(record);
        const note = this.effectiveNote(record);
        return this.advancedApi.markAttendance({
          sessionType,
          sessionId,
          studentId,
          status,
          note
        });
      })
      .filter((r) => r != null);
    if (!requests.length) {
      return;
    }
    this.bulkTotal.set((requests as unknown[]).length);
    this.bulkSaved.set(0);
    this.bulkSaving.set(true);
    this.bulkError.set(null);
    const wrapped = (requests as any[]).map((obs) =>
      obs.pipe(
        map((res: unknown) => {
          this.bulkSaved.set(this.bulkSaved() + 1);
          return res;
        })
      )
    );
    forkJoin(wrapped).subscribe({
      next: () => {
        const now = new Date().toISOString();
        const byKey = new Set(keys);
        const updated = this.records().map((r) => {
          const key = this.recordKey(r);
          if (!byKey.has(key)) return r;
          const status = this.effectiveStatus(r);
          const note = this.effectiveNote(r);
          return { ...r, status, note, markedAt: now };
        });
        this.records.set(updated);
        this.bulkSaving.set(false);
        this.pendingStatus.set({});
        this.pendingNote.set({});
        this.saveDraftIfAny();
        this.showSuccessToast('Attendance saved successfully.');
      },
      error: (err) => {
        this.bulkSaving.set(false);
        this.bulkError.set(err?.message ?? 'Failed to save attendance changes');
        this.showErrorToast(this.bulkError() as string);
      }
    });
  }

  saveRowChange(record: AttendanceRecord): void {
    const sessionType: AttendanceSessionType =
      (record.sessionType ?? 'Online') === 'On-site' ? 'ONSITE' : 'ONLINE';
    const status = this.effectiveStatus(record);
    const note = this.effectiveNote(record);
    const sessionId = record.sessionId;
    const studentId = record.studentId;
    this.bulkSaving.set(true);
    this.advancedApi
      .markAttendance({
        sessionType,
        sessionId,
        studentId,
        status,
        note
      })
      .subscribe({
        next: () => {
          const now = new Date().toISOString();
          const key = this.recordKey(record);
          const updated = this.records().map((r) =>
            this.recordKey(r) === key ? { ...r, status, note, markedAt: now } : r
          );
          this.records.set(updated);
          const statusMap = { ...this.pendingStatus() };
          const noteMap = { ...this.pendingNote() };
          delete statusMap[key];
          delete noteMap[key];
          this.pendingStatus.set(statusMap);
          this.pendingNote.set(noteMap);
          this.bulkSaving.set(false);
          this.saveDraftIfAny();
          this.showSuccessToast('Row attendance saved.');
        },
        error: (err) => {
          this.bulkSaving.set(false);
          const msg = err?.message ?? 'Failed to save attendance row';
          this.showErrorToast(msg);
        }
      });
  }

  undoRow(record: AttendanceRecord): void {
    const key = this.recordKey(record);
    const statusMap = { ...this.pendingStatus() };
    const noteMap = { ...this.pendingNote() };
    delete statusMap[key];
    delete noteMap[key];
    this.pendingStatus.set(statusMap);
    this.pendingNote.set(noteMap);
    this.saveDraftIfAny();
  }

  private draftStorageKey(): string | null {
    const selectedId = this.selectedSessionId();
    if (selectedId == null) return null;
    const session = this.sessions().find((s) => String(s.id) === String(selectedId));
    if (!session) return null;
    const t = (session.type ?? 'Online') === 'On-site' ? 'ONSITE' : 'ONLINE';
    return `attendance_draft_${t}_${selectedId}`;
  }

  private saveDraftIfAny(): void {
    const key = this.draftStorageKey();
    if (!key) return;
    const statusMap = this.pendingStatus();
    const noteMap = this.pendingNote();
    const keys = Array.from(new Set([...Object.keys(statusMap), ...Object.keys(noteMap)]));
    if (!keys.length) {
      localStorage.removeItem(key);
      this.draftPrompt.set(null);
      return;
    }
    const rows = keys.map((k) => ({
      key: k,
      status: statusMap[k],
      note: noteMap[k]
    }));
    localStorage.setItem(key, JSON.stringify(rows));
    this.draftPrompt.set({ key, rows });
  }

  private checkDraftForCurrentSession(): void {
    const key = this.draftStorageKey();
    if (!key) {
      this.draftPrompt.set(null);
      return;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      this.draftPrompt.set(null);
      return;
    }
    try {
      const rows = JSON.parse(raw) as { key: string; status?: AttendanceStatus; note?: string }[];
      if (!Array.isArray(rows) || !rows.length) {
        this.draftPrompt.set(null);
        return;
      }
      this.draftPrompt.set({ key, rows });
    } catch {
      this.draftPrompt.set(null);
    }
  }

  restoreDraft(): void {
    const draft = this.draftPrompt();
    if (!draft) return;
    const statusMap = { ...this.pendingStatus() };
    const noteMap = { ...this.pendingNote() };
    draft.rows.forEach((row) => {
      const rec = this.records().find((r) => this.recordKey(r) === row.key);
      if (!rec) return;
      if (row.status) statusMap[row.key] = row.status;
      if (row.note !== undefined) noteMap[row.key] = row.note;
    });
    this.pendingStatus.set(statusMap);
    this.pendingNote.set(noteMap);
    this.saveDraftIfAny();
  }

  discardDraft(): void {
    const draft = this.draftPrompt();
    const key = draft?.key ?? this.draftStorageKey();
    if (key) localStorage.removeItem(key);
    this.draftPrompt.set(null);
    this.pendingStatus.set({});
    this.pendingNote.set({});
  }

  private showSuccessToast(message: string): void {
    this.toast.set({ type: 'success', message });
    setTimeout(() => {
      if (this.toast()?.message === message) this.toast.set(null);
    }, 2500);
  }

  private showErrorToast(message: string): void {
    this.toast.set({ type: 'error', message });
    setTimeout(() => {
      if (this.toast()?.message === message) this.toast.set(null);
    }, 4000);
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /** Fallback: generate mock attendance records per session using mock students when API returns no data. */
  private generateMockAttendanceRecords(sessions: Session[], courseMap: Record<string, string>): AttendanceRecord[] {
    const nowIso = new Date().toISOString();
    const result: AttendanceRecord[] = [];
    sessions.forEach((s) => {
      const sessionId = Number(s.id);
      const sessionType = (s.type ?? 'Online') === 'On-site' ? 'On-site' : 'Online';
      const courseId = s.courseId;
      const courseLabel = courseMap[String(courseId)] ?? '-';
      this.mockStudents.forEach((stu, index) => {
        const r = Math.random();
        let status: AttendanceStatus = 'PRESENT';
        if (r > 0.8) status = 'ABSENT';
        else if (r > 0.6) status = 'LATE';
        else if (r > 0.5) status = 'EXCUSED';
        const note =
          status === 'ABSENT'
            ? 'Did not attend (mock data).'
            : status === 'LATE'
            ? 'Joined the session late (mock data).'
            : status === 'EXCUSED'
            ? 'Excused absence (mock data).'
            : index % 3 === 0
            ? 'Participated actively (mock data).'
            : undefined;
        result.push({
          sessionId,
          studentId: stu.id,
          status,
          note,
          sessionType,
          sessionLabel: `Session #${sessionId}`,
          courseId,
          courseLabel,
          markedAt: nowIso
        });
      });
    });
    return result;
  }
}
