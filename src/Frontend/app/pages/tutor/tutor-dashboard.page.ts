import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { Session, Booking, Course } from '../../../../core/api/models';
import { AdvancedApiService } from '../../../../core/api/services/advanced-api.service';
import { Attendance, AttendanceSessionType } from '../../../../core/api/models/attendance.model';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-tutor-dashboard-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './tutor-dashboard.page.html',
  styleUrl: './tutor-dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorDashboardPage implements OnInit {
  private readonly auth = inject(AuthFacade);
  private readonly sessionApi = inject(SessionApiService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly advancedApi = inject(AdvancedApiService);

  readonly sessions = signal<Session[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly attendanceLoading = signal(false);
  readonly attendanceError = signal<string | null>(null);
  readonly attendanceStats = signal<{
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  } | null>(null);
  readonly attendanceStudentRisk = signal<{
    totalStudents: number;
    highRisk: number;
  } | null>(null);

  readonly tutorId = this.auth.tutorId;

  readonly sessionsThisWeek = computed(() => {
    const list = this.sessions();
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return list.filter((s) => {
      const d = s.date ?? s.startDate ?? '';
      if (!d) return false;
      const t = new Date(d).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
  });

  readonly pendingBookingsCount = computed(() => {
    return this.bookings().filter(
      (b) => (b.status ?? '').toUpperCase() !== 'CONFIRMED' && (b.status ?? '').toUpperCase() !== 'CANCELLED'
    ).length;
  });

  readonly totalStudentsCount = computed(() => {
    const book = this.bookings();
    const ids = new Set(book.map((b) => String(b.studentId ?? (b as Record<string, unknown>)['userId'] ?? '')).filter(Boolean));
    return ids.size;
  });

  readonly nextSessions = computed(() => {
    const list = [...this.sessions()];
    list.sort((a, b) => {
      const da = a.date ?? a.startDate ?? '';
      const db = b.date ?? b.startDate ?? '';
      return da.localeCompare(db);
    });
    return list.slice(0, 5);
  });

  readonly courseMap = computed(() => {
    const map: Record<string, string> = {};
    this.courses().forEach((c) => (map[String(c.id)] = c.title ?? '—'));
    return map;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      sessions: this.sessionApi.getSessions().pipe(catchError(() => of([] as Session[]))),
      bookings: this.bookingApi.getBookings().pipe(catchError(() => of([] as Booking[]))),
      courses: this.courseApi.getCourses().pipe(catchError(() => of([] as Course[])))
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ sessions, bookings, courses }) => {
          const sessionList = Array.isArray(sessions) ? sessions : [];
          this.sessions.set(sessionList);
          this.bookings.set(Array.isArray(bookings) ? bookings : []);
          this.courses.set(Array.isArray(courses) ? courses : []);
          this.loadAttendanceForSessions(sessionList);
        },
        error: (err) => this.error.set(err?.message ?? 'Failed to load dashboard.')
      });
  }

  formatSessionDate(s: Session): string {
    const d = s.date ?? s.startDate ?? '';
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return d;
    }
  }

  /**
   * Load attendance data for the tutor dashboard and compute simple KPIs:
   * total records, status breakdown and number of high‑risk students.
   */
  private loadAttendanceForSessions(sessions: Session[]): void {
    if (!sessions.length) {
      this.attendanceStats.set({ total: 0, present: 0, absent: 0, late: 0, excused: 0 });
      this.attendanceStudentRisk.set({ totalStudents: 0, highRisk: 0 });
      this.attendanceLoading.set(false);
      this.attendanceError.set(null);
      return;
    }
    this.attendanceLoading.set(true);
    this.attendanceError.set(null);

    const requests = sessions.map((s) => {
      const sessionType: AttendanceSessionType =
        (s.type ?? 'Online') === 'On-site' ? 'ONSITE' : 'ONLINE';
      return this.advancedApi.getSessionAttendance(sessionType, Number(s.id));
    });

    forkJoin(requests)
      .pipe(
        catchError((err) => {
          this.attendanceError.set(err?.message ?? 'Failed to load attendance overview.');
          return of([] as Attendance[][]);
        }),
        finalize(() => this.attendanceLoading.set(false))
      )
      .subscribe((all) => {
        const flat: Attendance[] = (all as Attendance[][]).reduce(
          (acc, curr) => acc.concat(curr ?? []),
          [] as Attendance[]
        );
        if (!flat.length) {
          this.attendanceStats.set({ total: 0, present: 0, absent: 0, late: 0, excused: 0 });
          this.attendanceStudentRisk.set({ totalStudents: 0, highRisk: 0 });
          return;
        }

        let present = 0;
        let absent = 0;
        let late = 0;
        let excused = 0;
        const perStudent = new Map<number, { total: number; present: number }>();

        flat.forEach((a) => {
          const status = (a.status ?? '').toUpperCase();
          if (status === 'PRESENT') present++;
          else if (status === 'ABSENT') absent++;
          else if (status === 'LATE') late++;
          else if (status === 'EXCUSED') excused++;

          const key = a.studentId;
          const current = perStudent.get(key) ?? { total: 0, present: 0 };
          current.total += 1;
          if (status === 'PRESENT') current.present += 1;
          perStudent.set(key, current);
        });

        let highRisk = 0;
        perStudent.forEach((value) => {
          const rate = value.total > 0 ? (value.present / value.total) * 100 : 0;
          if (rate < 60) highRisk += 1;
        });

        this.attendanceStats.set({ total: flat.length, present, absent, late, excused });
        this.attendanceStudentRisk.set({ totalStudents: perStudent.size, highRisk });
      });
  }
}
