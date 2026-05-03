import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DataService } from '../../core/data/data.service';
import { TrainingModel, TrainingSection } from '../../core/data/models';
import { EnrollmentMode, UserContextService } from '../../core/user/user-context.service';
import { downloadTextFile } from '../../shared/utils/download';
import { AuthFacade } from '../../core/auth/auth.facade';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { AdvancedApiService } from '../../../../core/api/services/advanced-api.service';
import { Course, ProgressResponse, Session, Booking } from '../../../../core/api/models';

export interface SessionSlot {
  session: Session;
  bookingCount: number;
  capacity: number;
  remainingSeats: number;
  dateLabel: string;
  timeLabel: string;
}

function courseToTraining(c: Course): TrainingModel {
  return {
    id: String(c.id),
    name: c.title,
    learningObjectives: c.instructor ? [c.instructor] : [],
    chapters: []
  };
}

const DEMO_TRAININGS: Record<string, TrainingModel> = {
  'demo-1': courseToTraining({ id: 'demo-1', title: 'A2 Foundations', instructor: 'Dr. Sarah Martin' }),
  'demo-2': courseToTraining({ id: 'demo-2', title: 'B1 Business English', instructor: 'Prof. Jean Dubois' }),
  'demo-3': courseToTraining({ id: 'demo-3', title: 'B2 Conversation & Debate', instructor: 'Dr. Alice Chen' }),
  'demo-4': courseToTraining({ id: 'demo-4', title: 'C1 Advanced Writing', instructor: 'Dr. Mark Lee' }),
  'demo-5': courseToTraining({ id: 'demo-5', title: 'IELTS Preparation', instructor: 'Dr. Sarah Martin' }),
  'demo-6': courseToTraining({ id: 'demo-6', title: 'English for Beginners (A1)', instructor: 'Dr. Alice Chen' }),
};

@Component({
  selector: 'app-training-detail-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './training-detail.page.html',
  styleUrl: './training-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly data = inject(DataService);
  private readonly user = inject(UserContextService);
  private readonly fb = inject(FormBuilder);
  private readonly courseApi = inject(CourseApiService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly advancedApi = inject(AdvancedApiService);
  private readonly auth = inject(AuthFacade);

  readonly trainingId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('courseId') ?? p.get('trainingId') ?? '')),
    { initialValue: '' }
  );

  readonly apiCourse = signal<TrainingModel | null>(null);
  readonly courseSessions = signal<Session[]>([]);
  readonly sessionBookings = signal<Booking[]>([]);
  readonly sessionsLoading = signal(false);
  readonly bookingError = signal<string | null>(null);
  readonly bookingSessionId = signal<string | null>(null);
  readonly attendanceProgress = signal<ProgressResponse | null>(null);
  readonly attendanceLoading = signal(false);
  readonly attendanceError = signal<string | null>(null);

  readonly sessionSlots = computed<SessionSlot[]>(() => {
    const sessions = this.courseSessions();
    const bookings = this.sessionBookings();
    const bySession = new Map<string, number>();
    for (const b of bookings) {
      const sid = String(b.sessionId);
      bySession.set(sid, (bySession.get(sid) ?? 0) + 1);
    }
    return sessions.map((session) => {
      const sid = String(session.id);
      const capacity = session.maxParticipants ?? session.capacity ?? 0;
      const bookingCount = bySession.get(sid) ?? 0;
      const remainingSeats = Math.max(0, capacity - bookingCount);
      const dateStr = session.date ?? session.startDate ?? '';
      const timeStr = session.startTime ?? '';
      let dateLabel = '—';
      let timeLabel = '';
      if (dateStr) {
        try {
          dateLabel = new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
          if (timeStr) timeLabel = timeStr;
          else timeLabel = new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        } catch {
          dateLabel = dateStr;
        }
      }
      return { session, bookingCount, capacity, remainingSeats, dateLabel, timeLabel };
    });
  });

  constructor() {
    effect(() => {
      const id = this.trainingId();
      this.apiCourse.set(null);
      this.courseSessions.set([]);
      this.sessionBookings.set([]);
      if (!id) return;
      if (this.data.getTrainingById(id)) return;
      if (id.startsWith('demo-') && DEMO_TRAININGS[id]) {
        this.apiCourse.set(DEMO_TRAININGS[id]);
        return;
      }
      this.courseApi
        .getCourseById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (course: Course) => {
            this.apiCourse.set(courseToTraining(course));
            this.loadAttendanceProgress(course);
            this.loadSessionsAndBookings(id);
          },
          error: () => {
            this.apiCourse.set(null);
            this.attendanceProgress.set(null);
            this.loadCourseFromList(id);
          }
        });
    });
  }

  /** Fallback when backend has no GET /courses/:id — use merged list from getCourses(). */
  private loadCourseFromList(id: string): void {
    this.courseApi
      .getCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          const course = list.find((c) => String(c.id) === String(id));
          if (course) {
            this.apiCourse.set(courseToTraining(course));
            this.loadAttendanceProgress(course);
            this.loadSessionsAndBookings(id);
          }
        }
      });
  }

  private loadSessionsAndBookings(courseId: string): void {
    this.sessionsLoading.set(true);
    forkJoin({
      sessions: this.sessionApi.getSessions({ courseId }).pipe(catchError(() => of([] as Session[]))),
      bookings: this.bookingApi.getBookings().pipe(catchError(() => of([] as Booking[])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ sessions, bookings }) => {
          this.courseSessions.set(Array.isArray(sessions) ? sessions : []);
          this.sessionBookings.set(Array.isArray(bookings) ? bookings : []);
          this.sessionsLoading.set(false);
        },
        error: () => {
          this.courseSessions.set([]);
          this.sessionBookings.set([]);
          this.sessionsLoading.set(false);
        }
      });
  }

  bookSession(slot: SessionSlot): void {
    const studentId = this.auth.studentId() ?? localStorage.getItem('studentId')?.trim() ?? '1';
    const session = slot.session;
    const type = session.type ?? 'Online';
    const bookingDate = session.date ?? session.startDate ?? new Date().toISOString();
    this.bookingError.set(null);
    this.bookingSessionId.set(String(session.id));
    this.bookingApi
      .createBooking({
        type,
        sessionId: session.id,
        studentId: Number(studentId) || 1,
        status: 'CONFIRMED',
        bookingDate: bookingDate.length > 19 ? bookingDate.slice(0, 19) : bookingDate
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.bookingSessionId.set(null);
          this.loadSessionsAndBookings(this.trainingId());
        },
        error: (err) => {
          this.bookingSessionId.set(null);
          this.bookingError.set(err?.message ?? 'Booking failed.');
        }
      });
  }

  isBookingInProgress(slot: SessionSlot): boolean {
    return this.bookingSessionId() === String(slot.session.id);
  }

  readonly training = computed<TrainingModel | undefined>(() => {
    const id = this.trainingId();
    return this.data.getTrainingById(id) ?? this.apiCourse() ?? undefined;
  });
  readonly role = this.user.role;
  readonly enrolled = computed(() => this.user.participation().enrolledTrainingIds.includes(this.trainingId()));
  readonly enrollmentMode = computed(() => {
    const id = this.trainingId();
    if (!id) return null;
    return this.user.getEnrollmentMode(id);
  });

  readonly expandedSectionKey = signal<string | null>(null);
  readonly showCertificate = signal(false);

  readonly progress = computed(() => {
    const t = this.training();
    if (!t) return { completed: 0, total: 0, percent: 0 };
    const total = t.chapters.reduce((acc, ch) => acc + ch.sections.length, 0);
    const completed = t.chapters.reduce(
      (acc, ch) =>
        acc + ch.sections.filter((s) => this.data.isSectionComplete(t.id, ch.id, s.id)).length,
      0
    );
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percent };
  });

  readonly tutorChapterForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]]
  });

  readonly tutorSectionForm = this.fb.group({
    chapterId: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(3)]]
    ,
    objective: ['', [Validators.required, Validators.minLength(5)]],
    hasVideo: [true],
    hasText: [true],
    hasQuiz: [false]
  });

  back(): void {
    void this.router.navigate(['/front/courses']);
  }

  toggleSection(tid: string, chapterId: string, sectionId: string, checked: boolean): void {
    this.data.setSectionComplete(tid, chapterId, sectionId, checked);
  }

  toggleContent(trainingId: string, chapterId: string, sectionId: string): void {
    const key = `${trainingId}:${chapterId}:${sectionId}`;
    this.expandedSectionKey.set(this.expandedSectionKey() === key ? null : key);
  }

  isExpanded(trainingId: string, chapterId: string, sectionId: string): boolean {
    return this.expandedSectionKey() === `${trainingId}:${chapterId}:${sectionId}`;
  }

  enroll(mode: EnrollmentMode): void {
    const id = this.trainingId();
    if (!id) return;
    this.user.enrollTraining(id, mode);
  }

  toggleCertificateView(): void {
    this.showCertificate.update((prev) => !prev);
  }

  pricesTnd(): { online: number; onsite: number } {
    const t = this.training();
    if (!t) return { online: 0, onsite: 0 };
    const raw = `${t.id} ${t.name}`.toLowerCase();
    const level: 'beginner' | 'intermediate' | 'advanced' =
      raw.includes('c1') || raw.includes('c2')
        ? 'advanced'
        : raw.includes('b1') || raw.includes('b2')
          ? 'intermediate'
          : 'beginner';

    const online = level === 'beginner' ? 450 : level === 'intermediate' ? 650 : 850;
    return { online, onsite: online + 150 };
  }

  certificateContent(): string {
    const t = this.training();
    if (!t) return '';
    const { percent } = this.progress();
    const date = new Date().toISOString().slice(0, 10);
    return `Jungle in English\n\nCertificate of Completion\n\nThis certifies that the learner has completed:\n${t.name}\n\nProgress: ${percent}%\n\nIssued on: ${date}\n`;
  }

  downloadCertificate(): void {
    const t = this.training();
    if (!t) return;
    downloadTextFile(`certificate-${t.id}.txt`, this.certificateContent());
  }

  addChapter(): void {
    const t = this.training();
    if (!t) return;
    if (this.tutorChapterForm.invalid) {
      this.tutorChapterForm.markAllAsTouched();
      return;
    }
    this.data.addTrainingChapter(t.id, this.tutorChapterForm.value.title ?? '');
    this.tutorChapterForm.reset();
  }

  addSection(): void {
    const t = this.training();
    if (!t) return;
    if (this.tutorSectionForm.invalid) {
      this.tutorSectionForm.markAllAsTouched();
      return;
    }
    const chapterId = this.tutorSectionForm.value.chapterId ?? '';
    const title = this.tutorSectionForm.value.title ?? '';
    const objective = this.tutorSectionForm.value.objective ?? '';
    const contentTypes: TrainingSection['contentTypes'] = [];
    if (this.tutorSectionForm.value.hasVideo) contentTypes.push('video');
    if (this.tutorSectionForm.value.hasText) contentTypes.push('text');
    if (this.tutorSectionForm.value.hasQuiz) contentTypes.push('quiz');
    this.data.addTrainingSection(t.id, chapterId, title, objective, contentTypes);
    this.tutorSectionForm.patchValue({ title: '', objective: '' });
  }

  private loadAttendanceProgress(course: Course): void {
    const studentId = this.getStudentId();
    if (!studentId) return;
    const courseTypeParam = this.toSessionTypeParam(course.type);
    this.attendanceLoading.set(true);
    this.attendanceError.set(null);
    this.advancedApi
      .getProgress(courseTypeParam, course.id, studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.attendanceProgress.set(res);
          this.attendanceLoading.set(false);
        },
        error: (err) => {
          this.attendanceError.set(err?.message ?? 'Failed to load attendance');
          this.attendanceLoading.set(false);
        }
      });
  }

  private toSessionTypeParam(type: Course['type'] | undefined): string {
    if (!type) return 'ONLINE';
    if (type === 'On-site') return 'ONSITE';
    return 'ONLINE';
  }

  private getStudentId(): string | null {
    try {
      return localStorage.getItem('studentId')?.trim() || null;
    } catch {
      return null;
    }
  }
}
