import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { Session, Course, Booking } from '../../../../core/api/models';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { AuthFacade } from '../../core/auth/auth.facade';

export interface SessionRow {
  session: Session;
  courseTitle: string;
  bookingCount: number;
  capacity: number;
}

@Component({
  selector: 'app-tutor-sessions-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tutor-sessions.page.html',
  styleUrl: './tutor-sessions.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorSessionsPage implements OnInit {
  private readonly sessionApi = inject(SessionApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly auth = inject(AuthFacade);

  readonly sessions = signal<Session[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly courseMap = computed(() => {
    const map: Record<string, string> = {};
    this.courses().forEach((c) => (map[String(c.id)] = c.title ?? '—'));
    return map;
  });

  readonly bookingCountBySession = computed(() => {
    const map = new Map<string, number>();
    for (const b of this.bookings()) {
      const sid = String(b.sessionId);
      map.set(sid, (map.get(sid) ?? 0) + 1);
    }
    return map;
  });

  readonly sessionRows = computed<SessionRow[]>(() => {
    const sess = this.sessions();
    const courseMap = this.courseMap();
    const countMap = this.bookingCountBySession();
    return sess.map((session) => ({
      session,
      courseTitle: courseMap[String(session.courseId)] ?? 'Course',
      bookingCount: countMap.get(String(session.id)) ?? 0,
      capacity: session.maxParticipants ?? session.capacity ?? 0
    }));
  });

  readonly sortedRows = computed(() => {
    const rows = [...this.sessionRows()];
    rows.sort((a, b) => {
      const da = a.session.date ?? a.session.startDate ?? '';
      const db = b.session.date ?? b.session.startDate ?? '';
      return da.localeCompare(db);
    });
    return rows;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      sessions: this.sessionApi.getSessions().pipe(catchError(() => of([] as Session[]))),
      courses: this.courseApi.getCourses().pipe(catchError(() => of([] as Course[]))),
      bookings: this.bookingApi.getBookings().pipe(catchError(() => of([] as Booking[])))
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ sessions, courses, bookings }) => {
          this.sessions.set(Array.isArray(sessions) ? sessions : []);
          this.courses.set(Array.isArray(courses) ? courses : []);
          this.bookings.set(Array.isArray(bookings) ? bookings : []);
        },
        error: (err) => this.error.set(err?.message ?? 'Failed to load sessions.')
      });
  }

  formatDate(s: Session): string {
    const d = s.date ?? s.startDate ?? '';
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return d;
    }
  }

  cancelSession(row: SessionRow): void {
    if (!confirm('Cancel this session? Bookings may be affected.')) return;
    const s = row.session;
    const type = s.type ?? 'Online';
    this.sessionApi.deleteSession(s.id, type).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err?.message ?? 'Failed to cancel session.')
    });
  }
}
