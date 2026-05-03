import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, timeout } from 'rxjs/operators';

import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { Course, Session, Booking } from '../../../../core/api/models';

export interface TrainingCard {
  course: Course;
  sessionCount: number;
  nextSession: Session | null;
  nextSessionBookings: number;
  nextSessionCapacity: number;
  meetingLink: string | null;
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

@Component({
  selector: 'app-trainings-page',
  imports: [RouterLink],
  templateUrl: './trainings.page.html',
  styleUrl: './trainings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingsPage implements OnInit {
  private readonly courseApi = inject(CourseApiService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly bookingApi = inject(BookingApiService);

  readonly courses = signal<Course[]>([]);
  readonly sessions = signal<Session[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal('');
  readonly levelFilter = signal<string | null>(null);
  readonly typeFilter = signal<'All' | 'Online' | 'On-site'>('All');
  readonly sortBy = signal<'date' | 'title' | 'level'>('date');
  readonly levels = LEVELS;

  readonly cards = computed<TrainingCard[]>(() => {
    const list = this.courses();
    const sess = this.sessions();
    const book = this.bookings();
    const byCourse = new Map<string, Session[]>();
    for (const s of sess) {
      const cid = String(s.courseId);
      if (!byCourse.has(cid)) byCourse.set(cid, []);
      byCourse.get(cid)!.push(s);
    }
    const bySession = new Map<string, number>();
    for (const b of book) {
      const sid = String(b.sessionId);
      bySession.set(sid, (bySession.get(sid) ?? 0) + 1);
    }
    return list.map((course) => {
      const cid = String(course.id);
      const courseSessions = (byCourse.get(cid) ?? []).slice();
      courseSessions.sort((a, b) => {
        const da = a.date ?? a.startDate ?? '';
        const db = b.date ?? b.startDate ?? '';
        return da.localeCompare(db);
      });
      const nextSession = courseSessions.length > 0 ? courseSessions[0] : null;
      const capacity = nextSession ? (nextSession.maxParticipants ?? nextSession.capacity ?? 0) : 0;
      const nextBookings = nextSession ? bySession.get(String(nextSession.id)) ?? 0 : 0;
      const meetingLink = nextSession?.meetingLink ?? null;
      return {
        course,
        sessionCount: courseSessions.length || (course.sessions ?? 0),
        nextSession,
        nextSessionBookings: nextBookings,
        nextSessionCapacity: capacity,
        meetingLink: meetingLink ?? null
      };
    });
  });

  readonly filteredCards = computed(() => {
    let list = this.cards();
    const q = (this.searchQuery() ?? '').trim().toLowerCase();
    const level = this.levelFilter();
    const type = this.typeFilter();
    if (q) {
      list = list.filter(
        (c) =>
          (c.course.title ?? '').toLowerCase().includes(q) ||
          (c.course.description ?? '').toLowerCase().includes(q) ||
          (c.course.level ?? '').toLowerCase().includes(q)
      );
    }
    if (level != null && level !== '') {
      list = list.filter((c) => (c.course.level ?? '') === level);
    }
    if (type !== 'All') {
      list = list.filter((c) => (c.course.type ?? 'Online') === type);
    }
    const sort = this.sortBy();
    list = [...list].sort((a, b) => {
      if (sort === 'title') {
        return (a.course.title ?? '').localeCompare(b.course.title ?? '');
      }
      if (sort === 'level') {
        return (a.course.level ?? '').localeCompare(b.course.level ?? '');
      }
      const da = a.nextSession?.date ?? a.nextSession?.startDate ?? '';
      const db = b.nextSession?.date ?? b.nextSession?.startDate ?? '';
      return da.localeCompare(db);
    });
    return list;
  });

  setType(type: 'All' | 'Online' | 'On-site'): void {
    this.typeFilter.set(type);
  }

  setSortBy(sort: 'date' | 'title' | 'level'): void {
    this.sortBy.set(sort);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      courses: this.courseApi.getCourses().pipe(
        timeout(15000),
        map((raw) => this.normalizeCourseList(raw)),
        catchError((err) => {
          this.error.set(err?.message ?? 'Unable to load courses.');
          return of([]);
        })
      ),
      sessions: this.sessionApi.getSessions().pipe(
        catchError(() => of([]))
      ),
      bookings: this.bookingApi.getBookings().pipe(
        catchError(() => of([]))
      )
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ courses, sessions, bookings }) => {
        this.courses.set(courses);
        this.sessions.set(Array.isArray(sessions) ? sessions : []);
        this.bookings.set(Array.isArray(bookings) ? bookings : []);
      });
  }

  setLevel(level: string | null): void {
    this.levelFilter.set(level);
  }

  formatNextSessionDate(card: TrainingCard): string {
    const s = card.nextSession;
    if (!s) return '—';
    const dateStr = s.date ?? s.startDate ?? '';
    const timeStr = s.startTime ?? '';
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      if (timeStr) {
        return `${datePart}, ${timeStr}`;
      }
      return datePart;
    } catch {
      return dateStr;
    }
  }

  isFullyBooked(card: TrainingCard): boolean {
    if (card.nextSessionCapacity <= 0) return false;
    return card.nextSessionBookings >= card.nextSessionCapacity;
  }

  seatsLeft(card: TrainingCard): number {
    return Math.max(0, card.nextSessionCapacity - card.nextSessionBookings);
  }

  private normalizeCourseList(raw: unknown): Course[] {
    if (Array.isArray(raw)) return raw as Course[];
    if (raw && typeof raw === 'object') {
      const o = raw as Record<string, unknown>;
      if (Array.isArray(o['content'])) return o['content'] as Course[];
      if (Array.isArray(o['data'])) return o['data'] as Course[];
    }
    return [];
  }
}
