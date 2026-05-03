import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';

import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { Booking, Course, Session } from '../../../../core/api/models';
import { AuthFacade } from '../../core/auth/auth.facade';
import { PageStepperComponent } from '../../shared/page-stepper/page-stepper.component';

export interface BookingCard {
  booking: Booking;
  courseTitle: string;
  location: 'On-site' | 'Online';
  dateLabel: string;
  statusLabel: 'Confirmed' | 'Pending' | 'Cancelled';
  statusClass: 'confirmed' | 'pending' | 'cancelled';
  icon: 'books' | 'monitor' | 'globe';
}

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [RouterLink, PageStepperComponent],
  templateUrl: './bookings.page.html',
  styleUrl: './bookings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsPage implements OnInit {
  private readonly bookingApi = inject(BookingApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly auth = inject(AuthFacade);

  readonly bookings = signal<Booking[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly sessions = signal<Session[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly cancellingId = signal<string | null>(null);

  readonly studentIdFilter = signal<string | null>(null);

  readonly sessionMap = computed(() => {
    const map = new Map<string, Session>();
    this.sessions().forEach((s) => map.set(String(s.id), s));
    return map;
  });

  readonly courseMap = computed(() => {
    const map: Record<string, string> = {};
    this.courses().forEach((c) => (map[String(c.id)] = c.title ?? '-'));
    return map;
  });

  readonly sessionToCourseId = computed(() => {
    const map: Record<string, string> = {};
    this.sessions().forEach((s) => (map[String(s.id)] = String(s.courseId ?? '')));
    return map;
  });

  readonly bookingCards = computed<BookingCard[]>(() => {
    const list = this.bookings();
    const sessions = this.sessionMap();
    const courseMap = this.courseMap();
    const sessionToCourse = this.sessionToCourseId();
    return list
      .map((b) => {
        const sessionId = String(b.sessionId);
        const session = sessions.get(sessionId);
        const courseId = sessionToCourse[sessionId];
        const courseTitle = courseId ? courseMap[courseId] ?? 'Course' : 'Course';
        const location: 'On-site' | 'Online' = b.type === 'On-site' ? 'On-site' : 'Online';
        const dateStr = session?.date ?? session?.startDate ?? b.bookingDate ?? (b as Record<string, unknown>)['bookedAt'] as string | undefined;
        const dateLabel = this.formatDateShort(dateStr);
        const statusNorm = (b.status ?? '').toUpperCase();
        let statusLabel: 'Confirmed' | 'Pending' | 'Cancelled' = 'Pending';
        let statusClass: 'confirmed' | 'pending' | 'cancelled' = 'pending';
        if (statusNorm === 'CONFIRMED') {
          statusLabel = 'Confirmed';
          statusClass = 'confirmed';
        } else if (statusNorm === 'CANCELLED' || statusNorm === 'CANCELED') {
          statusLabel = 'Cancelled';
          statusClass = 'cancelled';
        } else {
          statusLabel = 'Pending';
          statusClass = 'pending';
        }
        const icon: 'books' | 'monitor' | 'globe' = location === 'Online' ? 'monitor' : 'books';
        return { booking: b, courseTitle, location, dateLabel, statusLabel, statusClass, icon };
      })
      .sort((a, b) => {
        const da = a.booking.bookingDate ?? (a.booking as Record<string, unknown>)['bookedAt'] as string ?? '';
        const db = b.booking.bookingDate ?? (b.booking as Record<string, unknown>)['bookedAt'] as string ?? '';
        return new Date(da).getTime() - new Date(db).getTime();
      });
  });

  ngOnInit(): void {
    const sid = this.auth.studentId() ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('studentId')?.trim() || null : null);
    this.studentIdFilter.set(sid ?? null);
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    const sid = this.studentIdFilter();
    const params = sid ? { studentId: sid } : undefined;

    forkJoin({
      bookings: this.bookingApi.getBookings(params),
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
        error: (err) => {
          this.bookings.set([]);
          this.error.set(err?.message ?? 'Unable to load bookings.');
        }
      });
  }

  formatDateShort(d: string | undefined): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(d);
    }
  }

  courseIdForBooking(b: Booking): string | number | null {
    const sessionId = b.sessionId != null ? String(b.sessionId) : '';
    const courseId = this.sessionToCourseId()[sessionId];
    return courseId ?? null;
  }

  cancelBooking(card: BookingCard): void {
    if (!confirm('Cancel this booking?')) return;
    const b = card.booking;
    const id = b.id ?? b.sessionId;
    if (id == null) return;
    this.cancellingId.set(String(id));
    this.bookingApi.deleteBooking(id, b.type ?? 'Online').subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.loadData();
      },
      error: (err) => {
        this.cancellingId.set(null);
        this.error.set(err?.message ?? 'Failed to cancel booking.');
      }
    });
  }

  isCancelling(card: BookingCard): boolean {
    const id = card.booking.id ?? card.booking.sessionId;
    return id != null && this.cancellingId() === String(id);
  }
}
