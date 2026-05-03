import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { AdvancedApiService } from '../../../../core/api/services/advanced-api.service';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { ClassroomApiService } from '../../../../core/api/services/classroom-api.service';
import { Course, ProgressResponse, Session, Booking, Classroom } from '../../../../core/api/models';
import { AppEmptyStateComponent } from '../ui/empty-state.component';
import { UserContextService } from '../../../../Frontend/app/core/user/user-context.service';
import { RealtimeNotificationService } from '../../../../core/api/services/realtime-notification.service';
import { PageStepperComponent } from '../../../../Frontend/app/shared/page-stepper/page-stepper.component';

const STUDENT_ID_KEY = 'studentId';
type UiAlertType = 'success' | 'error' | 'info';
type UiAlert = { type: UiAlertType; message: string };

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AppEmptyStateComponent, PageStepperComponent],
  templateUrl: './course-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseListComponent {
  private readonly courseApi = inject(CourseApiService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly classroomApi = inject(ClassroomApiService);
  private readonly advancedApi = inject(AdvancedApiService);
  private readonly userContext = inject(UserContextService);
  private readonly notificationService = inject(RealtimeNotificationService);

  courses = signal<Course[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deletingMap = signal<Record<string, boolean>>({});
  alert = signal<UiAlert | null>(null);
  /** Progress from GET /advanced/progress (key = courseId). Only when role = student. */
  progressMap = signal<Record<string, ProgressResponse | null>>({});
  /** Per-card loading for progress (key = courseId). */
  progressLoadingMap = signal<Record<string, boolean>>({});

  /** Advanced check modal state */
  advancedCheckOpen = signal(false);
  advancedCheckCourse: Course | null = null;
  advancedCheckConflicts = signal<string[]>([]);
  advancedCheckCapacityWarnings = signal<string[]>([]);

  /** Filter by course type (All / Online / On-site) */
  filterType = signal<'Online' | 'On-site' | null>(null);

  /** Search / filters / sort */
  search = signal('');
  filterLevel = signal<string>('');
  sortBy = signal<'title-asc' | 'title-desc'>('title-asc');

  readonly levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /** Derived stats from classrooms. */
  activeClassrooms = signal(0);

  filteredCourses = computed(() => {
    const type = this.filterType();
    let list = this.courses();

    if (type) {
      list = list.filter((c) => (c.type ?? '') === type);
    }

    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const title = (c.title ?? '').toLowerCase();
        const desc = (c.description ?? '').toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }

    const level = this.filterLevel();
    if (level) {
      list = list.filter((c) => (c.level ?? '') === level);
    }

    const sorted = [...list];
    const sort = this.sortBy();
    if (sort === 'title-asc' || sort === 'title-desc') {
      sorted.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
      if (sort === 'title-desc') {
        sorted.reverse();
      }
    }

    return sorted;
  });

  /** Statistiques dérivées des cours (tous, pas filtrés). */
  readonly stats = computed(() => {
    const list = this.courses();
    const total = list.length;
    const online = list.filter((c) => (c.type ?? '') === 'Online').length;
    const onsite = list.filter((c) => (c.type ?? '') === 'On-site').length;
    const byLevelMap = new Map<string, number>();
    list.forEach((c) => {
      const level = String(c.level ?? '-');
      byLevelMap.set(level, (byLevelMap.get(level) ?? 0) + 1);
    });
    const byLevel = Array.from(byLevelMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const tutorIds = new Set<string>();
    list.forEach((c) => {
      const id = (c as any).tutorId;
      if (id != null) {
        tutorIds.add(String(id));
      }
    });
    return {
      total,
      online,
      onsite,
      byLevel,
      activeClassrooms: this.activeClassrooms(),
      tutors: tutorIds.size
    };
  });

  readonly role = this.userContext.role;

  /** Simple client-side pagination for filtered course list. */
  readonly pageSize = 2;
  currentPage = signal(1);
  pagedCourses = computed(() => {
    const list = this.filteredCourses();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCourses().length / this.pageSize)));
  paginationInfo = computed(() => {
    const list = this.filteredCourses();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize + (list.length ? 1 : 0);
    const end = Math.min(page * this.pageSize, list.length);
    return { start, end, total: list.length };
  });

  setFilterType(type: 'Online' | 'On-site' | null): void {
    this.filterType.set(type);
  }

  goToPage(page: number): void {
    const max = this.totalPages();
    if (page >= 1 && page <= max) {
      this.currentPage.set(page);
    }
  }

  /** Classroom display for course (from API or '-' for Online). */
  courseClassroom(c: Course): string {
    const name = c.classroom ?? (c as Record<string, unknown>)['classroomName'];
    return name != null && String(name).trim() !== '' ? String(name).trim() : '-';
  }

  /** studentId from localStorage or AuthService; same key as backoffice. */
  getStudentId(): string | null {
    try {
      return localStorage.getItem(STUDENT_ID_KEY)?.trim() || null;
    } catch {
      return null;
    }
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadClassroomsCount();
  }

  /** Open Advanced Check report for a given course (no role / user logic). */
  openAdvancedCheck(course: Course): void {
    this.advancedCheckCourse = course;
    this.advancedCheckOpen.set(true);
    this.loadAdvancedCheckData(course);
  }

  closeAdvancedCheck(): void {
    this.advancedCheckOpen.set(false);
    this.advancedCheckCourse = null;
    this.advancedCheckConflicts.set([]);
    this.advancedCheckCapacityWarnings.set([]);
  }

  private loadAdvancedCheckData(course: Course): void {
    const courseId = course.id;
    // Load related data in parallel using existing services.
    this.sessionApi.getSessions().subscribe({
      next: (sessions) => {
        const courseSessions = (sessions ?? []).filter((s) => String(s.courseId) === String(courseId));
        this.computeAdvancedReport(course, courseSessions);
      },
      error: () => {
        this.advancedCheckConflicts.set(['Failed to load sessions for this course.']);
      }
    });

    // Optionally, load bookings and classrooms to enrich capacity checks.
    this.bookingApi.getBookings({ courseId: String(courseId) }).subscribe({
      next: (allBookings) => {
        const forCourse = (allBookings ?? []).filter((b) => String(b.courseId) === String(courseId));
        this.appendCapacityFromBookings(course, forCourse);
      },
      error: () => {
        this.advancedCheckCapacityWarnings.update((list) => [
          ...list,
          'Failed to load bookings for this course.'
        ]);
      }
    });

    this.classroomApi.getClassrooms().subscribe({
      next: (classrooms) => {
        this.appendCapacityFromClassrooms(course, classrooms ?? []);
      },
      error: () => {
        this.advancedCheckCapacityWarnings.update((list) => [
          ...list,
          'Failed to load classrooms.'
        ]);
      }
    });
  }

  private computeAdvancedReport(course: Course, sessions: Session[]): void {
    const conflicts: string[] = [];
    // Simple naive conflict detection: same startDate && same classroomId.
    const byKey: Record<string, Session[]> = {};
    for (const s of sessions) {
      const key = `${s.startDate ?? ''}_${s.classroomId ?? ''}`;
      if (!byKey[key]) byKey[key] = [];
      byKey[key].push(s);
    }
    Object.values(byKey)
      .filter((list) => list.length > 1)
      .forEach((list) => {
        const ids = list.map((s) => s.id).join(', ');
        conflicts.push(`Conflicting sessions for course ${course.title}: [${ids}] share same time/classroom.`);
      });
    this.advancedCheckConflicts.set(conflicts);
  }

  private appendCapacityFromBookings(course: Course, bookings: Booking[]): void {
    const warnings: string[] = [];
    const totalBookings = bookings.length;
    if (course.students != null && totalBookings > course.students) {
      warnings.push(
        `Bookings (${totalBookings}) exceed declared students capacity (${course.students}).`
      );
    }
    if (warnings.length) {
      this.advancedCheckCapacityWarnings.update((prev) => [...prev, ...warnings]);
    }
  }

  private appendCapacityFromClassrooms(course: Course, classrooms: Classroom[]): void {
    // Here we only append a generic note; detailed mapping requires session->classroom join.
    if (!classrooms.length) return;
    this.advancedCheckCapacityWarnings.update((prev) => [
      ...prev,
      `Classrooms are available for capacity checks (${classrooms.length} total).`
    ]);
  }

  loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);
    this.progressMap.set({});
    this.progressLoadingMap.set({});
    this.courseApi.getCourses().subscribe({
      next: (list) => {
        const courseList = Array.isArray(list) ? list : [];
        this.courses.set(courseList);
        this.loading.set(false);
        if (this.role() === 'student') {
          this.loadProgressForCourses(courseList);
        }
      },
      error: (err) => {
        const message = err?.message ?? 'Failed to load courses';
        this.error.set(message);
        this.showAlert('error', message, true);
        this.courses.set([]);
        this.loading.set(false);
      }
    });
  }

  private loadClassroomsCount(): void {
    this.classroomApi.getClassrooms().subscribe({
      next: (list) => this.activeClassrooms.set((list ?? []).length),
      error: () => this.activeClassrooms.set(0)
    });
  }

  private loadProgressForCourses(courseList: Course[]): void {
    const studentId = this.getStudentId();
    if (!studentId) return;
    const idList = courseList.map((c) => this.courseId(c));
    this.progressLoadingMap.set(Object.fromEntries(idList.map((id) => [id, true])));
    const courseTypeParam = (c: Course): string => (c.type === 'On-site' ? 'On-site' : 'Online');
    const requests = courseList.map((c) =>
      this.advancedApi.getProgress(courseTypeParam(c), c.id, studentId)
    );
    forkJoin(requests).subscribe({
      next: (results) => {
        const map: Record<string, ProgressResponse | null> = {};
        courseList.forEach((c, i) => {
          map[this.courseId(c)] = results[i] ?? null;
        });
        this.progressMap.set(map);
        this.progressLoadingMap.set({});
      },
      error: () => {
        this.progressLoadingMap.set({});
      }
    });
  }

  deleteCourse(course: Course): void {
    const type = (course.type === 'On-site' ? 'On-site' : 'Online') as 'Online' | 'On-site';
    const idStr = String(course.id);
    if (this.deletingMap()[idStr]) return;
    if (!confirm('Are you sure you want to delete this course?')) return;

    this.error.set(null);
    this.setDeleting(idStr, true);

    this.courseApi
      .deleteCourse(course.id, type)
      .pipe(finalize(() => this.setDeleting(idStr, false)))
      .subscribe({
      next: () => {
        this.courses.update((list) => list.filter((c) => String(c.id) !== idStr));
        this.showAlert('success', `Course "${course.title}" deleted successfully.`);
        this.notificationService.requestListRefresh();
      },
      error: (err: { status?: number; message?: string }) => {
        const isConflict = err?.status === 409 || /\b409\b|conflict/i.test(err?.message ?? '');
        const message =
          isConflict
            ? 'Cannot delete this course because it is linked to existing sessions or bookings.'
            : err?.message ?? 'Delete failed';
        this.error.set(message);
        this.showAlert('error', message, true);
      }
    });
  }

  isDeleting(course: Course): boolean {
    return this.deletingMap()[String(course.id)] === true;
  }

  private setDeleting(courseId: string, value: boolean): void {
    this.deletingMap.update((current) => ({
      ...current,
      [courseId]: value
    }));
  }

  dismissAlert(): void {
    this.alert.set(null);
  }

  private showAlert(type: UiAlertType, message: string, sticky = false): void {
    this.alert.set({ type, message });
    if (sticky) {
      return;
    }
    setTimeout(() => {
      if (this.alert()?.message === message) {
        this.alert.set(null);
      }
    }, 3500);
  }

  /** Normalize id for routerLink (backend may return number). */
  courseId(c: Course): string {
    return String(c.id);
  }
}
