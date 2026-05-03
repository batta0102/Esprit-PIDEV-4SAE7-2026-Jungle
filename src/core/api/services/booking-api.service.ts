import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment';
import { Booking, BookingCreate } from '../models';
import { SessionApiService } from './session-api.service';

const BASE = `${environment.apiBaseUrl}`;

interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

function toList(res: unknown): Booking[] {
  if (Array.isArray(res)) return res as Booking[];
  if (res && typeof res === 'object' && res !== null) {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj['data'])) {
      return obj['data'] as Booking[];
    }
  }
  return [];
}

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly sessionApi = inject(SessionApiService);

  getBookings(params?: { sessionId?: string | number; studentId?: string | number; courseId?: string | number }): Observable<Booking[]> {
    const onlineUrl = `${BASE}/online-bookings/getAll`;
    const onsiteUrl = `${BASE}/onsite-bookings/all`;
    const list$ = forkJoin({
      online: this.http.get<unknown>(onlineUrl).pipe(
        map((r) => toList(r).map((b) => ({ ...b, type: 'Online' as const })))
      ),
      onsite: this.http.get<unknown>(onsiteUrl).pipe(
        map((r) => toList(r).map((b) => ({ ...b, type: 'On-site' as const })))
      )
    }).pipe(
      map(({ online, onsite }) => {
        let list = [...online, ...onsite];
        list.forEach((b) => {
          if (b.bookingDate == null && (b as any).bookedAt) (b as any).bookingDate = (b as any).bookedAt;
        });
        if (params?.sessionId != null) {
          const sid = String(params.sessionId);
          list = list.filter((b) => String(b.sessionId) === sid);
        }
        if (params?.studentId != null) {
          const uid = String(params.studentId);
          list = list.filter((b) => String(b.studentId ?? (b as any).userId) === uid);
        }
        return list;
      }),
      catchError(this.handleError)
    );
    if (params?.courseId == null) return list$;
    return forkJoin({
      sessions: this.sessionApi.getSessions(),
      bookings: list$
    }).pipe(
      map(({ sessions, bookings }) => {
        const courseSessionIds = new Set(
          (sessions ?? []).filter((s) => String(s.courseId) === String(params!.courseId)).map((s) => String(s.id))
        );
        return bookings
          .filter((b) => courseSessionIds.has(String(b.sessionId)))
          .map((b) => ({ ...b, courseId: params!.courseId }));
      })
    );
  }

  getBookingById(id: string | number, type: 'Online' | 'On-site'): Observable<Booking> {
    const idStr = String(id);
    if (type === 'On-site') {
      return this.http
        .get<ApiResponse<Booking>>(`${BASE}/onsite-bookings/${idStr}`)
        .pipe(
          map((r) => ({ ...(r.data ?? r), type: 'On-site' as const })),
          catchError(this.handleError)
        );
    }
    return this.http
      .get<ApiResponse<Booking>>(`${BASE}/online-bookings/getById/${idStr}`)
      .pipe(
        map((r) => ({ ...(r.data ?? r), type: 'Online' as const })),
        catchError(this.handleError)
      );
  }

  createBooking(payload: BookingCreate): Observable<Booking> {
    const rawDate = payload.bookingDate?.trim() ?? '';
    let dateStr = rawDate;
    if (dateStr.length > 19) dateStr = dateStr.slice(0, 19);
    if (dateStr.endsWith('Z')) dateStr = dateStr.slice(0, -1);
    if (dateStr && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) dateStr = dateStr + ':00';
    if (!dateStr) dateStr = new Date().toISOString().slice(0, 19).replace('Z', '');

    const sessionIdNum = payload.sessionId != null ? Number(payload.sessionId) : NaN;
    const sessionIdValid = typeof sessionIdNum === 'number' && !Number.isNaN(sessionIdNum) && sessionIdNum > 0;
    if (!sessionIdValid) {
      return throwError(() => new Error('Session ID is required and must be a valid positive number (references online_sessions or onsite_sessions).'));
    }

    const body = {
      bookingDate: dateStr,
      status: payload.status || 'CONFIRMED',
      studentId: payload.studentId,
      sessionId: sessionIdNum
    };
    if (payload.type === 'On-site') {
      return this.http
        .post<ApiResponse<Booking>>(`${BASE}/onsite-bookings/add`, body)
        .pipe(
          map((r) => ({ ...(r.data ?? r), type: 'On-site' as const })),
          catchError(this.handleError)
        );
    }
    return this.http
      .post<ApiResponse<Booking>>(`${BASE}/online-bookings/add`, body)
      .pipe(
        map((r) => ({ ...(r.data ?? r), type: 'Online' as const })),
        catchError(this.handleError)
      );
  }

  updateBooking(id: string | number, type: 'Online' | 'On-site', payload: Partial<BookingCreate>): Observable<Booking> {
    const idStr = String(id);
    const rawDate = payload.bookingDate?.trim() ?? '';
    const dateStr = rawDate && !/Z|[+-]\d{2}:?\d{2}$/.test(rawDate) ? rawDate.replace(/:\d{2}$/, ':00') : rawDate || new Date().toISOString().slice(0, 19);
    const body = {
      bookingDate: dateStr,
      status: payload.status ?? 'CONFIRMED',
      studentId: payload.studentId,
      sessionId: payload.sessionId != null ? Number(payload.sessionId) : undefined
    };
    if (type === 'On-site') {
      return this.http
        .put<ApiResponse<Booking>>(`${BASE}/onsite-bookings/update/${idStr}`, body)
        .pipe(
          map((r) => ({ ...(r.data ?? r), type: 'On-site' as const })),
          catchError(this.handleError)
        );
    }
    return this.http
      .put<ApiResponse<Booking>>(`${BASE}/online-bookings/update/${idStr}`, body)
      .pipe(
        map((r) => ({ ...(r.data ?? r), type: 'Online' as const })),
        catchError(this.handleError)
      );
  }

  deleteBooking(id: string | number, type: 'Online' | 'On-site'): Observable<void> {
    const idStr = String(id);
    const url = type === 'On-site' ? `${BASE}/onsite-bookings/delete/${idStr}` : `${BASE}/online-bookings/delete/${idStr}`;
    return this.http.delete<ApiResponse<void>>(url).pipe(map(() => undefined), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.message ?? error.message ?? 'Request failed';
    console.error('[BookingApiService]', error.status, error.url, msg);
    const enrichedError = Object.assign(new Error(msg), {
      status: error.status,
      originalError: error
    });
    return throwError(() => enrichedError);
  }
}
