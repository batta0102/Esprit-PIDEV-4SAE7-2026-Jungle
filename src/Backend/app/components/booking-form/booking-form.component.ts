import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { BookingApiService } from '../../../../core/api/services/booking-api.service';
import { SessionApiService } from '../../../../core/api/services/session-api.service';
import { BookingCreate, Session } from '../../../../core/api/models';
import { toDatetimeLocalFormat, toSelectId } from '../../../../core/utils/form-edit.utils';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './booking-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bookingApi = inject(BookingApiService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  form!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  bookingId: string | null = null;
  bookingType = signal<'Online' | 'On-site'>('Online');

  sessions = signal<Session[]>([]);
  onlineSessions = signal<Session[]>([]);
  onsiteSessions = signal<Session[]>([]);
  sessionsLoading = signal(true);

  readonly statusOptions = ['CONFIRMED', 'CANCELLED', 'PENDING'];

  ngOnInit(): void {
    this.form = this.fb.group({
      type: ['Online', Validators.required],
      sessionId: [null as number | null, Validators.required],
      studentId: [1 as number],
      status: ['CONFIRMED', Validators.required],
      bookingDate: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    const typeParam = this.route.snapshot.queryParamMap.get('type') as 'Online' | 'On-site' | null;

    // Load session options first, then entity in edit mode; patch so sessionId select has options.
    this.sessionsLoading.set(true);
    const sessions$ = forkJoin({
      online: this.sessionApi.getOnlineSessionsOnly().pipe(catchError(() => of([] as Session[]))),
      onsite: this.sessionApi.getOnsiteSessionsOnly().pipe(catchError(() => of([] as Session[])))
    });

    if (id) {
      this.isEditMode.set(true);
      this.bookingId = id;
      const type = typeParam === 'On-site' ? 'On-site' : 'Online';
      this.bookingType.set(type);
      this.loading.set(true);
      this.error.set(null);
      sessions$
        .pipe(
          switchMap(({ online, onsite }) => {
            this.onlineSessions.set(online ?? []);
            this.onsiteSessions.set(onsite ?? []);
            this.sessions.set([...(online ?? []), ...(onsite ?? [])]);
            this.sessionsLoading.set(false);
            return this.bookingApi.getBookingById(id, type).pipe(
              catchError(() =>
                type === 'Online'
                  ? this.bookingApi.getBookingById(id, 'On-site')
                  : this.bookingApi.getBookingById(id, 'Online')
              )
            );
          })
        )
        .subscribe({
          next: (b) => {
            const bookingType = (b.type ?? typeParam ?? 'Online') as 'Online' | 'On-site';
            this.bookingType.set(bookingType);
            const dateStr = toDatetimeLocalFormat(
              b.bookingDate ?? (b as Record<string, unknown>)['bookedAt']
            );
            this.form.patchValue({
              type: bookingType,
              sessionId: toSelectId(b.sessionId ?? (b as Record<string, unknown>)['session_id']) ?? null,
              studentId: toSelectId(b.studentId ?? (b as Record<string, unknown>)['userId']) ?? null,
              status: (b.status ?? 'CONFIRMED') as string,
              bookingDate: dateStr || toDatetimeLocalFormat(new Date())
            });
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err?.message ?? 'Booking not found');
            this.loading.set(false);
          }
        });
    } else {
      sessions$.subscribe({
        next: ({ online, onsite }) => {
          this.onlineSessions.set(online ?? []);
          this.onsiteSessions.set(onsite ?? []);
          this.sessions.set([...(online ?? []), ...(onsite ?? [])]);
          this.sessionsLoading.set(false);
        },
        error: () => this.sessionsLoading.set(false)
      });
      this.form.patchValue({
        bookingDate: toDatetimeLocalFormat(new Date())
      });
    }

    this.form.get('type')?.valueChanges.subscribe((t) => {
      this.bookingType.set(t as 'Online' | 'On-site');
      this.form.patchValue({ sessionId: null }, { emitEvent: false });
    });
  }

  sessionOptions(): Session[] {
    return this.bookingType() === 'On-site' ? this.onsiteSessions() : this.onlineSessions();
  }

  sessionLabel(s: Session): string {
    const d = s.date ?? s.startDate ?? s.startTime;
    return `Session #${s.id} (Course ${s.courseId})${d ? ' – ' + String(d).slice(0, 10) : ''}`;
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
    const sessionId = Number(v.sessionId);
    if (!sessionId || isNaN(sessionId)) {
      this.error.set('Please select a session.');
      return;
    }

    let dateStr = String(v.bookingDate ?? '').trim();
    // Normalize to yyyy-MM-dd'T'HH:mm:ss for backend (datetime-local gives yyyy-MM-ddThh:mm)
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().slice(0, 19).replace('Z', '');
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) {
        dateStr = dateStr + ':00';
      } else if (dateStr.length > 19) {
        dateStr = dateStr.slice(0, 19).replace('Z', '');
      }
    }

    const studentId = this.isEditMode()
      ? Number(v.studentId)
      : (Number(v.studentId) || 1);
    const payload: BookingCreate = {
      type,
      sessionId,
      studentId,
      status: v.status ?? 'CONFIRMED',
      bookingDate: dateStr
    };

    const request =
      this.isEditMode() && this.bookingId
        ? this.bookingApi.updateBooking(this.bookingId, this.bookingType(), payload)
        : this.bookingApi.createBooking(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(this.isEditMode() ? 'Booking updated.' : 'Booking created.');
        setTimeout(() => this.router.navigate(['/back/courses/bookings']), 1200);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'Request failed';
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/back/courses/bookings']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field?.errors) return null;
    if (field.errors['required']) return 'This field is required';
    if (field.errors['min']) return `Min value is ${field.errors['min'].min}`;
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
