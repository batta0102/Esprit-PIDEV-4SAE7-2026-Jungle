import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { ClassroomApiService } from '../../../../core/api/services/classroom-api.service';
import { SessionCreate, Course, Classroom } from '../../../../core/api/models';
import { toDatetimeLocalFormat, toSelectId } from '../../../../core/utils/form-edit.utils';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './session-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sessionApi = inject(SessionApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly classroomApi = inject(ClassroomApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  sessionId: string | null = null;
  sessionType = signal<'Online' | 'On-site'>('Online');

  courses = signal<Course[]>([]);
  classrooms = signal<Classroom[]>([]);
  onlineCourses = signal<Course[]>([]);
  onsiteCourses = signal<Course[]>([]);

  ngOnInit(): void {
    const urlPattern = /^(|https?:\/\/.+)$/i;
    this.form = this.fb.group({
      type: ['Online', Validators.required],
      courseId: [null as number | null, [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
      capacity: [10, [Validators.required, Validators.min(1)]],
      meetingLink: ['', [Validators.pattern(urlPattern)]],
      classroomId: [null as number | null]
    });

    const id = this.route.snapshot.paramMap.get('id');
    const typeParam = this.route.snapshot.queryParamMap.get('type') as 'Online' | 'On-site' | null;

    const courses$ = this.courseApi.getCourses().pipe(catchError(() => of([] as Course[])));
    const classrooms$ = this.classroomApi.getClassrooms().pipe(catchError(() => of([] as Classroom[])));

    if (id) {
      this.isEditMode.set(true);
      this.sessionId = id;
      this.loading.set(true);
      this.error.set(null);
      const sessionType: 'Online' | 'On-site' = typeParam === 'On-site' ? 'On-site' : 'Online';
      forkJoin({ courses: courses$, classrooms: classrooms$ })
        .pipe(
          switchMap(({ courses, classrooms }) => {
            this.courses.set(courses ?? []);
            this.onlineCourses.set((courses ?? []).filter((c) => (c.type ?? '') === 'Online'));
            this.onsiteCourses.set((courses ?? []).filter((c) => (c.type ?? '') === 'On-site'));
            this.classrooms.set(classrooms ?? []);
            return this.sessionApi.getSessionById(id, sessionType).pipe(
              catchError(() => this.sessionApi.getSessionById(id, sessionType === 'Online' ? 'On-site' : 'Online'))
            );
          })
        )
        .subscribe({
          next: (session) => {
            this.sessionType.set((session.type ?? 'Online') as 'Online' | 'On-site');
            this.patchForm(session);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err?.message ?? 'Session not found');
            this.loading.set(false);
          }
        });
    } else {
      forkJoin({ courses: courses$, classrooms: classrooms$ }).subscribe({
        next: ({ courses, classrooms }) => {
          this.courses.set(courses ?? []);
          this.onlineCourses.set((courses ?? []).filter((c) => (c.type ?? '') === 'Online'));
          this.onsiteCourses.set((courses ?? []).filter((c) => (c.type ?? '') === 'On-site'));
          this.classrooms.set(classrooms ?? []);
        }
      });
      this.form.get('type')?.valueChanges.subscribe((t) => {
        this.sessionType.set(t);
        this.form.patchValue({ courseId: null, classroomId: null });
      });
    }
  }

  private patchForm(session: Record<string, unknown>): void {
    const type = (session['type'] ?? 'Online') as 'Online' | 'On-site';
    const dateStr = toDatetimeLocalFormat(
      session['date'] ?? session['startDate'] ?? session['startTime']
    );
    this.form.patchValue({
      type,
      courseId: toSelectId(session['courseId'] ?? session['course_id']) ?? null,
      date: dateStr,
      capacity: Number(session['capacity'] ?? session['maxParticipants'] ?? 10),
      meetingLink: (session['meetingLink'] ?? session['meeting_link'] ?? '') as string,
      classroomId: toSelectId(session['classroomId'] ?? session['classroom_id']) ?? null
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error.set('Please fix the form errors.');
      return;
    }
    this.error.set(null);
    this.success.set(null);
    this.loading.set(true);

    const v = this.form.value;
    const type = (v.type ?? 'Online') as 'Online' | 'On-site';
    let dateStr = String(v.date ?? '').trim();
    if (dateStr && !/Z|[+-]\d{2}:?\d{2}$/.test(dateStr)) dateStr = dateStr + ':00.000Z';

    const payload: SessionCreate = {
      type,
      courseId: Number(v.courseId),
      date: dateStr,
      capacity: Number(v.capacity)
    };
    if (type === 'Online') {
      payload.meetingLink = (v.meetingLink ?? '').trim() || 'https://meet.example.com/session';
    } else {
      if (v.classroomId == null) {
        this.error.set('Classroom is required for on-site sessions.');
        this.loading.set(false);
        return;
      }
      payload.classroomId = Number(v.classroomId);
    }

    const request =
      this.isEditMode() && this.sessionId
        ? this.sessionApi.updateSession(this.sessionId, type, payload)
        : this.sessionApi.createSession(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(this.isEditMode() ? 'Session updated.' : 'Session created.');
        setTimeout(() => this.router.navigate(['/back/courses/sessions']), 1200);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Request failed');
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/back/courses/sessions']);
  }

  courseOptions(): Course[] {
    return this.sessionType() === 'On-site' ? this.onsiteCourses() : this.onlineCourses();
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field?.errors) return null;
    if (field.errors['required']) return 'This field is required';
    if (field.errors['min']) return `Min value is ${field.errors['min'].min}`;
    if (field.errors['pattern']) return 'Please enter a valid URL (e.g. https://...)';
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
