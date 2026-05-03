import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { ClassroomApiService } from '../../../../core/api/services/classroom-api.service';
import { RealtimeNotificationService } from '../../../../core/api/services/realtime-notification.service';
import { CourseCreate } from '../../../../core/api/models';
import { Classroom } from '../../../../core/api/models';
import { toSelectId } from '../../../../core/utils/form-edit.utils';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly courseApi = inject(CourseApiService);
  private readonly classroomApi = inject(ClassroomApiService);
  private readonly notificationService = inject(RealtimeNotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  courseId: string | null = null;
  courseType: 'Online' | 'On-site' = 'Online';

  tutorOptions = signal<{ id: number; label: string }[]>(
    Array.from({ length: 20 }, (_, i) => ({ id: i + 1, label: `Tutor ${i + 1}` }))
  );
  classrooms = signal<Classroom[]>([]);
  levelOptions: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      level: ['A1', Validators.required],
      type: ['Online', Validators.required],
      tutorId: [1, [Validators.required, Validators.min(1)]],
      classroomName: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    const typeParam = this.route.snapshot.paramMap.get('type');
    const isEdit = !!(id && typeParam);

    if (isEdit) {
      this.isEditMode.set(true);
      this.courseId = id;
      this.courseType = typeParam === 'On-site' ? 'On-site' : 'Online';
      this.loading.set(true);
      this.error.set(null);
    }

    const options$ = this.classroomApi.getClassrooms().pipe(
      catchError(() => of([] as Classroom[]))
    );
    const entity$ = isEdit && id && typeParam
      ? this.courseApi.getCourseById(id, this.courseType).pipe(
          catchError((err) => {
            this.error.set(err?.message ?? 'Failed to load course');
            return of(null);
          })
        )
      : of(null);

    forkJoin({ classrooms: options$, course: entity$ }).subscribe({
      next: ({ classrooms, course }) => {
        this.classrooms.set(classrooms ?? []);
        if (course) {
          const raw = course as Record<string, unknown>;
          const tutorId = toSelectId(raw['tutorId'] ?? raw['tutor_id']);
          const numTutorId = tutorId ?? 1;
          const opts = this.tutorOptions();
          if (numTutorId > 0 && !opts.some((t) => t.id === numTutorId)) {
            this.tutorOptions.set([
              ...opts,
              { id: numTutorId, label: `Tutor ${numTutorId}` }
            ]);
          }
          const classroomList = classrooms ?? [];
          let classroomName = (raw['classroomName'] ?? raw['classroom'] ?? '') as string;
          if (!classroomName && (raw['classroomId'] != null || raw['classroom_id'] != null)) {
            const cid = raw['classroomId'] ?? raw['classroom_id'];
            const room = classroomList.find((c) => String(c.id) === String(cid));
            classroomName = (room?.name ?? '') as string;
          }
          this.form.patchValue({
            title: (course.title ?? '') as string,
            description: (course.description ?? raw['details'] ?? raw['summary'] ?? '') as string,
            level: (course.level ?? 'A1') as string,
            type: (course.type ?? 'Online') as string,
            tutorId: numTutorId,
            classroomName: classroomName || ''
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to load data');
        this.loading.set(false);
      }
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

    const value: CourseCreate = {
      title: this.form.value.title,
      description: this.form.value.description,
      level: this.form.value.level,
      type: this.form.value.type,
      tutorId: this.form.value.tutorId
    };
    if (this.form.value.type === 'On-site' && this.form.value.classroomName) {
      (value as CourseCreate & { classroomName?: string }).classroomName = this.form.value.classroomName;
    }

    const request = this.isEditMode() && this.courseId
      ? this.courseApi.updateCourse(this.courseId, this.courseType, value)
      : this.courseApi.createCourse(value);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(this.isEditMode() ? 'Course updated successfully.' : 'Course created successfully.');
        this.notificationService.requestListRefresh();
        setTimeout(() => this.router.navigate(['/back/courses']), 1200);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Request failed');
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/back/courses']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field?.errors) return null;
    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Min ${field.errors['minlength'].requiredLength} characters`;
    if (field.errors['min']) return `Min value is ${field.errors['min'].min}`;
    if (field.errors['max']) return `Max value is ${field.errors['max'].max}`;
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
