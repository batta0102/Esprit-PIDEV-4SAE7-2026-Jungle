import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { ClassroomApiService } from '../../../../core/api/services/classroom-api.service';
import { Session, Course, Classroom } from '../../../../core/api/models';
import { PageStepperComponent } from '../../../../Frontend/app/shared/page-stepper/page-stepper.component';

type SortField = 'date' | 'type' | 'course' | 'capacity';
type SortDirection = 'asc' | 'desc';
type UiAlertType = 'success' | 'error' | 'info';
type UiAlert = { type: UiAlertType; message: string };

@Component({
  selector: 'app-sessions-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PageStepperComponent],
  templateUrl: './sessions-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionsManagementComponent {
  private readonly sessionApi = inject(SessionApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly classroomApi = inject(ClassroomApiService);
  private readonly router = inject(Router);

  sessions = signal<Session[]>([]);
  courses = signal<Course[]>([]);
  classrooms = signal<Classroom[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deletingMap = signal<Record<string, boolean>>({});
  alert = signal<UiAlert | null>(null);

  searchQuery = signal('');
  filterType = signal<'all' | 'Online' | 'On-site'>('all');
  filterCourseId = signal<string | null>(null);
  sortField = signal<SortField>('date');
  sortDirection = signal<SortDirection>('asc');

  courseMap = computed(() => {
    const map: { [key: string]: string | undefined } = {};
    this.courses().forEach((c) => (map[String(c.id)] = c.title ?? '-'));
    return map;
  });
  classroomMap = computed(() => {
    const map: { [key: string]: string | undefined } = {};
    this.classrooms().forEach((c) => (map[String(c.id)] = c.name ?? '-'));
    return map;
  });

  stats = computed(() => {
    const list = this.sessions();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
    let scheduled = 0;
    let inProgress = 0;
    let completed = 0;
    list.forEach((s) => {
      const t = this.getSessionTime(s);
      if (t == null) return;
      if (t < todayStart) completed++;
      else if (t > todayEnd) scheduled++;
      else inProgress++;
    });
    return { total: list.length, scheduled, inProgress, completed };
  });

  filteredSessions = computed(() => {
    let list = [...this.sessions()];
    const q = (this.searchQuery() ?? '').trim().toLowerCase();
    const typeFilter = this.filterType();
    const courseFilter = this.filterCourseId();
    const courseMap = this.courseMap();
    const classroomMap = this.classroomMap();

    if (q) {
      list = list.filter((s) => {
        const dateStr = this.formatDate(s).toLowerCase();
        const typeStr = (s.type ?? '').toLowerCase();
        const courseStr = (courseMap[String(s.courseId)] ?? '-').toLowerCase();
        const capStr = String(s.capacity ?? s.maxParticipants ?? '').toLowerCase();
        const roomStr = this.classroomLabel(s.classroomId).toLowerCase();
        return [dateStr, typeStr, courseStr, capStr, roomStr].some((x) => x.includes(q));
      });
    }
    if (typeFilter !== 'all') {
      const match = typeFilter === 'On-site' ? 'On-site' : 'Online';
      list = list.filter((s) => (s.type ?? 'Online') === match);
    }
    if (courseFilter != null && courseFilter !== '') {
      list = list.filter((s) => String(s.courseId) === courseFilter);
    }

    const field = this.sortField();
    const dir = this.sortDirection();
    const mult = dir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      switch (field) {
        case 'date':
          va = this.getSessionTime(a) ?? 0;
          vb = this.getSessionTime(b) ?? 0;
          return mult * (va - vb);
        case 'type':
          va = (a.type ?? 'Online') === 'Online' ? 0 : 1;
          vb = (b.type ?? 'Online') === 'Online' ? 0 : 1;
          return mult * (va - vb);
        case 'course':
          va = (courseMap[String(a.courseId)] ?? '').toLowerCase();
          vb = (courseMap[String(b.courseId)] ?? '').toLowerCase();
          return mult * String(va).localeCompare(String(vb));
        case 'capacity':
          va = a.capacity ?? a.maxParticipants ?? 0;
          vb = b.capacity ?? b.maxParticipants ?? 0;
          return mult * (Number(va) - Number(vb));
        default:
          return 0;
      }
    });
    return list;
  });

  /** Client-side pagination for filtered sessions list. */
  readonly pageSize = 2;
  currentPage = signal(1);
  pagedSessions = computed(() => {
    const list = this.filteredSessions();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredSessions().length / this.pageSize)));
  paginationInfo = computed(() => {
    const list = this.filteredSessions();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize + (list.length ? 1 : 0);
    const end = Math.min(page * this.pageSize, list.length);
    return { start, end, total: list.length };
  });

  getSessionTime(s: Session): number | null {
    const d = s.date ?? s.startDate ?? s.startTime;
    if (!d) return null;
    try {
      return new Date(d).getTime();
    } catch {
      return null;
    }
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.sessionApi.getSessions().subscribe({
      next: (list) => {
        this.sessions.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: (err) => {
        const message = err?.message ?? 'Failed to load sessions';
        this.error.set(message);
        this.showAlert('error', message, true);
        this.sessions.set([]);
        this.loading.set(false);
      }
    });
    this.courseApi.getCourses().subscribe({ next: (list) => this.courses.set(Array.isArray(list) ? list : []), error: () => {} });
    this.classroomApi.getClassrooms().subscribe({ next: (list) => this.classrooms.set(Array.isArray(list) ? list : []), error: () => {} });
  }

  deleteSession(session: Session): void {
    const type = (session.type ?? 'Online') as 'Online' | 'On-site';
    const idStr = String(session.id);
    if (this.deletingMap()[idStr]) return;
    if (!confirm('Delete this session?')) return;

    this.error.set(null);
    this.setDeleting(idStr, true);
    this.sessionApi
      .deleteSession(session.id, type)
      .pipe(finalize(() => this.setDeleting(idStr, false)))
      .subscribe({
        next: () => {
          this.sessions.update((list) => list.filter((s) => String(s.id) !== idStr));
          this.showAlert('success', 'Session deleted successfully.');
        },
        error: (err: { status?: number; message?: string }) => {
          const message = this.resolveDeleteErrorMessage(err, 'session');
          this.error.set(message);
          this.showAlert('error', message, true);
        }
      });
  }

  isDeleting(session: Session): boolean {
    return this.deletingMap()[String(session.id)] === true;
  }

  courseLabel(s: Session): string {
    const map = this.courseMap();
    const key = s.courseId != null ? String(s.courseId) : '';
    return (key && map[key]) ? map[key]! : '-';
  }

  classroomLabel(classroomId: string | number | null | undefined): string {
    if (classroomId == null) return '-';
    const map = this.classroomMap();
    return map[String(classroomId)] ?? '-';
  }

  formatDate(s: Session): string {
    const d = s.date ?? s.startDate ?? s.startTime;
    if (!d) return '-';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  }

  id(s: Session): string {
    return String(s.id);
  }

  goToCreate(): void {
    this.router.navigate(['/back', 'courses', 'sessions', 'create']);
  }

  setSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  sortIcon(field: SortField): string {
    if (this.sortField() !== field) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  str(v: unknown): string {
    return String(v);
  }

  goToPage(page: number): void {
    const max = this.totalPages();
    if (page >= 1 && page <= max) {
      this.currentPage.set(page);
    }
  }

  dismissAlert(): void {
    this.alert.set(null);
  }

  private setDeleting(id: string, value: boolean): void {
    this.deletingMap.update((current) => ({ ...current, [id]: value }));
  }

  private showAlert(type: UiAlertType, message: string, sticky = false): void {
    this.alert.set({ type, message });
    if (sticky) return;
    setTimeout(() => {
      if (this.alert()?.message === message) this.alert.set(null);
    }, 3500);
  }

  private resolveDeleteErrorMessage(err: { status?: number; message?: string }, entity: string): string {
    const isConflict = err?.status === 409 || /\b409\b|conflict/i.test(err?.message ?? '');
    if (isConflict) {
      return `Cannot delete this ${entity} because it is linked to existing records.`;
    }
    return err?.message ?? `Failed to delete ${entity}.`;
  }
}
