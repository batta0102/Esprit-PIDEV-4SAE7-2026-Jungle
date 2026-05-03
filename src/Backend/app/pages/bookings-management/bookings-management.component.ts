import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { CourseApiService } from '../../../../core/api/services/course-api.service';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { Booking, Course, Session } from '../../../../core/api/models';
import { PageStepperComponent } from '../../../../Frontend/app/shared/page-stepper/page-stepper.component';

type SortField = 'date' | 'type' | 'course' | 'status' | 'studentId';
type SortDirection = 'asc' | 'desc';
type UiAlertType = 'success' | 'error' | 'info';
type UiAlert = { type: UiAlertType; message: string };

@Component({
  selector: 'app-bookings-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PageStepperComponent],
  templateUrl: './bookings-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsManagementComponent {
  private readonly bookingApi = inject(BookingApiService);
  private readonly courseApi = inject(CourseApiService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly router = inject(Router);

  bookings = signal<Booking[]>([]);
  courses = signal<Course[]>([]);
  sessions = signal<Session[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deletingMap = signal<Record<string, boolean>>({});
  alert = signal<UiAlert | null>(null);

  searchQuery = signal('');
  filterType = signal<'all' | 'Online' | 'On-site'>('all');
  filterStatus = signal<string | null>(null);
  filterCourseId = signal<string | null>(null);
  sortField = signal<SortField>('date');
  sortDirection = signal<SortDirection>('desc');

  courseMap = computed(() => {
    const map: { [key: string]: string } = {};
    this.courses().forEach((c) => (map[String(c.id)] = c.title ?? '-'));
    return map;
  });

  /** sessionId -> courseId (from session.courseId) */
  sessionToCourseId = computed(() => {
    const map: { [key: string]: string } = {};
    this.sessions().forEach((s) => (map[String(s.id)] = String(s.courseId ?? '')));
    return map;
  });

  stats = computed(() => {
    const list = this.bookings();
    let confirmed = 0;
    let cancelled = 0;
    let pending = 0;
    let online = 0;
    let onsite = 0;
    list.forEach((b) => {
      const status = (b.status ?? '').toUpperCase();
      if (status === 'CONFIRMED') confirmed++;
      else if (status === 'CANCELLED') cancelled++;
      else pending++;
      const type = (b.type ?? 'Online') as string;
      if (type === 'On-site') onsite++;
      else online++;
    });
    return { total: list.length, confirmed, cancelled, pending, online, onsite };
  });

  filteredBookings = computed(() => {
    let list = [...this.bookings()];
    const q = (this.searchQuery() ?? '').trim().toLowerCase();
    const typeFilter = this.filterType();
    const statusFilter = this.filterStatus();
    const courseFilter = this.filterCourseId();
    const courseMap = this.courseMap();
    const sessionToCourse = this.sessionToCourseId();

    if (q) {
      list = list.filter((b) => {
        const sessionStr = String(b.sessionId ?? '').toLowerCase();
        const courseStr = this.courseLabelForBooking(b).toLowerCase();
        const typeStr = (b.type ?? '').toLowerCase();
        const studentStr = String(b.studentId ?? '').toLowerCase();
        const statusStr = (b.status ?? '').toLowerCase();
        const dateStr = this.formatDate(b.bookingDate).toLowerCase();
        return [sessionStr, courseStr, typeStr, studentStr, statusStr, dateStr].some((x) => x.includes(q));
      });
    }
    if (typeFilter !== 'all') {
      const match = typeFilter === 'On-site' ? 'On-site' : 'Online';
      list = list.filter((b) => (b.type ?? 'Online') === match);
    }
    if (statusFilter != null && statusFilter !== '') {
      list = list.filter((b) => (b.status ?? '').toUpperCase() === statusFilter.toUpperCase());
    }
    if (courseFilter != null && courseFilter !== '') {
      list = list.filter((b) => {
        const sid = b.sessionId != null ? String(b.sessionId) : '';
        return sessionToCourse[sid] === courseFilter;
      });
    }

    const field = this.sortField();
    const dir = this.sortDirection();
    const mult = dir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      switch (field) {
        case 'date':
          va = this.getBookingTime(a);
          vb = this.getBookingTime(b);
          return mult * (va - vb);
        case 'type':
          va = (a.type ?? 'Online') === 'Online' ? 0 : 1;
          vb = (b.type ?? 'Online') === 'Online' ? 0 : 1;
          return mult * (va - vb);
        case 'course': {
          const keyA = sessionToCourse[String(a.sessionId)] ?? '';
          const keyB = sessionToCourse[String(b.sessionId)] ?? '';
          va = (courseMap[keyA] ?? '').toLowerCase();
          vb = (courseMap[keyB] ?? '').toLowerCase();
          return mult * String(va).localeCompare(String(vb));
        }
        case 'status':
          va = (a.status ?? '').toUpperCase();
          vb = (b.status ?? '').toUpperCase();
          return mult * String(va).localeCompare(String(vb));
        case 'studentId':
          va = Number(a.studentId ?? 0);
          vb = Number(b.studentId ?? 0);
          return mult * (va - vb);
        default:
          return 0;
      }
    });
    return list;
  });

  /** Client-side pagination for filtered bookings list. */
  readonly pageSize = 2;
  currentPage = signal(1);
  pagedBookings = computed(() => {
    const list = this.filteredBookings();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredBookings().length / this.pageSize)));
  paginationInfo = computed(() => {
    const list = this.filteredBookings();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize + (list.length ? 1 : 0);
    const end = Math.min(page * this.pageSize, list.length);
    return { start, end, total: list.length };
  });

  getBookingTime(b: Booking): number {
    const d = b.bookingDate ?? (b as any).bookedAt;
    if (!d) return 0;
    try {
      return new Date(d).getTime();
    } catch {
      return 0;
    }
  }

  courseLabelForBooking(b: Booking): string {
    const sessionId = b.sessionId != null ? String(b.sessionId) : '';
    const courseId = this.sessionToCourseId()[sessionId];
    return courseId ? (this.courseMap()[courseId] ?? '-') : '-';
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

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.bookingApi.getBookings().subscribe({
      next: (list) => {
        this.bookings.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: (err) => {
        const message =
          err?.message ?? err?.error?.message ?? 'Failed to load bookings. Ensure GestionCours is running on http://localhost:8098 (proxy /api → 8098).'
        ;
        this.error.set(message);
        this.showAlert('error', message, true);
        this.bookings.set([]);
        this.loading.set(false);
      }
    });
    this.courseApi.getCourses().subscribe({ next: (list) => this.courses.set(list ?? []), error: () => {} });
    this.sessionApi.getSessions().subscribe({ next: (list) => this.sessions.set(list ?? []), error: () => {} });
  }

  deleteBooking(b: Booking): void {
    const type = (b.type ?? 'Online') as 'Online' | 'On-site';
    const id = b.id;
    if (id == null) return;
    const idStr = String(id);
    if (this.deletingMap()[idStr]) return;
    if (!confirm('Delete this booking?')) return;

    this.error.set(null);
    this.setDeleting(idStr, true);
    this.bookingApi
      .deleteBooking(id, type)
      .pipe(finalize(() => this.setDeleting(idStr, false)))
      .subscribe({
        next: () => {
          this.bookings.update((list) => list.filter((x) => String(x.id) !== idStr));
          this.showAlert('success', 'Booking deleted successfully.');
        },
        error: (err: { status?: number; message?: string }) => {
          const message = this.resolveDeleteErrorMessage(err, 'booking');
          this.error.set(message);
          this.showAlert('error', message, true);
        }
      });
  }

  isDeleting(booking: Booking): boolean {
    return this.deletingMap()[String(booking.id ?? '')] === true;
  }

  goToCreate(): void {
    this.router.navigate(['/back', 'courses', 'bookings', 'create']);
  }

  formatDate(d: string | undefined): string {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  }

  /** Booking primary key for edit/delete; backend must return id. */
  id(b: Booking): string {
    return String(b.id ?? b.sessionId ?? '');
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
