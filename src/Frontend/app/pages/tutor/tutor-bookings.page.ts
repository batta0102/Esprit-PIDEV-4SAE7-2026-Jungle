import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { Booking, Course, Session } from '../../../../core/api/models';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

export interface TutorBookingCard {
  booking: Booking;
  courseTitle: string;
  sessionDate: string;
  location: 'On-site' | 'Online';
  statusLabel: string;
  statusClass: string;
}

@Component({
  selector: 'app-tutor-bookings-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tutor-bookings.page.html',
  styleUrl: './tutor-bookings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorBookingsPage implements OnInit {
  private readonly bookingApi = inject(BookingApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly sessionApi = inject(SessionApiService);

  readonly bookings = signal<Booking[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly sessions = signal<Session[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly updatingId = signal<string | null>(null);

  readonly courseMap = computed(() => {
    const map: Record<string, string> = {};
    this.courses().forEach((c) => (map[String(c.id)] = c.title ?? '—'));
    return map;
  });

  readonly sessionMap = computed(() => {
    const map = new Map<string, Session>();
    this.sessions().forEach((s) => map.set(String(s.id), s));
    return map;
  });

  readonly sessionToCourseId = computed(() => {
    const map: Record<string, string> = {};
    this.sessions().forEach((s) => (map[String(s.id)] = String(s.courseId ?? '')));
    return map;
  });

  readonly cards = computed<TutorBookingCard[]>(() => {
    const list = this.bookings();
    const sessions = this.sessionMap();
    const courseMap = this.courseMap();
    const sessionToCourse = this.sessionToCourseId();
    return list.map((b) => {
      const sessionId = String(b.sessionId);
      const session = sessions.get(sessionId);
      const courseId = sessionToCourse[sessionId];
      const courseTitle = courseId ? courseMap[courseId] ?? 'Course' : 'Course';
      const dateStr = session?.date ?? session?.startDate ?? b.bookingDate ?? '';
      const sessionDate = this.formatDate(dateStr);
      const location: 'On-site' | 'Online' = b.type === 'On-site' ? 'On-site' : 'Online';
      const statusNorm = (b.status ?? '').toUpperCase();
      let statusLabel = 'Pending';
      let statusClass = 'pending';
      if (statusNorm === 'CONFIRMED') {
        statusLabel = 'Confirmed';
        statusClass = 'confirmed';
      } else if (statusNorm === 'CANCELLED' || statusNorm === 'CANCELED') {
        statusLabel = 'Cancelled';
        statusClass = 'cancelled';
      }
      return { booking: b, courseTitle, sessionDate, location, statusLabel, statusClass };
    });
  });

  readonly pendingCards = computed(() => this.cards().filter((c) => c.statusClass === 'pending'));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      bookings: this.bookingApi.getBookings().pipe(catchError(() => of([] as Booking[]))),
      courses: this.courseApi.getCourses().pipe(catchError(() => of([] as Course[]))),
      sessions: this.sessionApi.getSessions().pipe(catchError(() => of([] as Session[])))
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ bookings, courses, sessions }) => {
          this.bookings.set(Array.isArray(bookings) ? bookings : []);
          this.courses.set(Array.isArray(courses) ? courses : []);
          this.sessions.set(Array.isArray(sessions) ? sessions : []);
        },
        error: (err) => this.error.set(err?.message ?? 'Failed to load bookings.')
      });
  }

  formatDate(d: string | undefined): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return d;
    }
  }

  confirmBooking(card: TutorBookingCard): void {
    const b = card.booking;
    const id = b.id ?? b.sessionId;
    if (id == null) return;
    this.updatingId.set(String(id));
    const payload = {
      status: 'CONFIRMED',
      bookingDate: (b.bookingDate ?? (b as Record<string, unknown>)['bookedAt'] ?? new Date().toISOString()) as string,
      studentId: b.studentId as number,
      sessionId: b.sessionId
    };
    this.bookingApi.updateBooking(id, b.type ?? 'Online', payload).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.load();
      },
      error: (err) => {
        this.updatingId.set(null);
        this.error.set(err?.message ?? 'Failed to confirm.');
      }
    });
  }

  rejectBooking(card: TutorBookingCard): void {
    if (!confirm('Reject this booking?')) return;
    const b = card.booking;
    const id = b.id ?? b.sessionId;
    if (id == null) return;
    this.updatingId.set(String(id));
    const payload = {
      status: 'CANCELLED',
      bookingDate: (b.bookingDate ?? (b as Record<string, unknown>)['bookedAt'] ?? new Date().toISOString()) as string,
      studentId: b.studentId as number,
      sessionId: b.sessionId
    };
    this.bookingApi.updateBooking(id, b.type ?? 'Online', payload).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.load();
      },
      error: (err) => {
        this.updatingId.set(null);
        this.error.set(err?.message ?? 'Failed to reject.');
      }
    });
  }

  isUpdating(card: TutorBookingCard): boolean {
    const id = card.booking.id ?? card.booking.sessionId;
    return id != null && this.updatingId() === String(id);
  }
}
