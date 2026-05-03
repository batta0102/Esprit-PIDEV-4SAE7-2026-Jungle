import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment';
import { Session, SessionCreate } from '../models';

const BASE = `${environment.apiBaseUrl}`;

interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

function toList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === 'object' && res !== null) {
    const o = res as Record<string, unknown>;
    if (Array.isArray(o['data'])) return o['data'] as T[];
    if (Array.isArray(o['content'])) return o['content'] as T[];
  }
  return [];
}

function normalizeSessionId(raw: Record<string, unknown>, type: 'Online' | 'On-site'): string | number {
  const id = raw['id'] ?? raw['sessionId'] ?? raw['session_id'];
  if (id != null) return id as string | number;
  if (type === 'On-site') {
    const sid = raw['onsiteSessionId'] ?? raw['onsite_session_id'];
    return sid != null ? (sid as string | number) : (raw['id'] as string | number) ?? 0;
  }
  const sid = raw['onlineSessionId'] ?? raw['online_session_id'];
  return sid != null ? (sid as string | number) : (raw['id'] as string | number) ?? 0;
}

@Injectable({ providedIn: 'root' })
export class SessionApiService {
  private readonly http = inject(HttpClient);

  getSessions(params?: { courseId?: string | number }): Observable<Session[]> {
    return forkJoin({
      online: this.getOnlineSessionsOnly(),
      onsite: this.getOnsiteSessionsOnly()
    }).pipe(
      map(({ online, onsite }) => {
        const list = [...online, ...onsite];
        list.forEach((s) => {
          if (s.date == null && (s.startDate || s.startTime)) s.date = (s.startDate ?? s.startTime) as string;
        });
        if (params?.courseId != null) {
          const cid = String(params.courseId);
          return list.filter((s) => String(s.courseId) === cid);
        }
        return list;
      })
    );
  }

  getOnlineSessionsOnly(): Observable<Session[]> {
    return this.http.get<unknown>(`${BASE}/online-sessions/getAll`).pipe(
      map((r) => {
        const list = toList<Record<string, unknown>>(r);
        return list.map((s) => {
          const id = normalizeSessionId(s, 'Online');
          return { ...s, id, type: 'Online' as const } as Session;
        });
      }),
      catchError(() => of([]))
    );
  }

  getOnsiteSessionsOnly(): Observable<Session[]> {
    return this.http.get<unknown>(`${BASE}/onsite-sessions/all`).pipe(
      map((r) => {
        const list = toList<Record<string, unknown>>(r);
        return list.map((s) => {
          const id = normalizeSessionId(s, 'On-site');
          return { ...s, id, type: 'On-site' as const } as Session;
        });
      }),
      catchError(() => of([]))
    );
  }

  getSessionById(id: string | number, type: 'Online' | 'On-site'): Observable<Session> {
    const idStr = String(id);
    if (type === 'On-site') {
      return this.http
        .get<ApiResponse<Session>>(`${BASE}/onsite-sessions/${idStr}`)
        .pipe(
          map((r) => ({ ...(r.data ?? r), type: 'On-site' as const })),
          catchError(this.handleError)
        );
    }
    return this.http
      .get<ApiResponse<Session>>(`${BASE}/online-sessions/getById/${idStr}`)
      .pipe(
        map((r) => ({ ...(r.data ?? r), type: 'Online' as const })),
        catchError(this.handleError)
      );
  }

  createSession(session: SessionCreate): Observable<Session> {
    const date = session.date?.endsWith('Z') || session.date?.includes('+') ? session.date : session.date + 'Z';
    if (session.type === 'On-site') {
      const payload = {
        date,
        capacity: session.capacity,
        courseId: Number(session.courseId),
        classroomId: Number(session.classroomId)
      };
      return this.http
        .post<ApiResponse<Session>>(`${BASE}/onsite-sessions/add`, payload)
        .pipe(
          map((r) => ({ ...(r.data ?? r), type: 'On-site' as const })),
          catchError(this.handleError)
        );
    }
    const payload = {
      date,
      capacity: session.capacity,
      meetingLink: session.meetingLink ?? 'https://meet.example.com/session',
      courseId: Number(session.courseId)
    };
    return this.http
      .post<ApiResponse<Session>>(`${BASE}/online-sessions/add`, payload)
      .pipe(
        map((r) => ({ ...(r.data ?? r), type: 'Online' as const })),
        catchError(this.handleError)
      );
  }

  updateSession(id: string | number, type: 'Online' | 'On-site', session: Partial<SessionCreate>): Observable<Session> {
    const idStr = String(id);
    const date = session.date ? (session.date.endsWith('Z') || session.date.includes('+') ? session.date : session.date + 'Z') : undefined;
    if (type === 'On-site') {
      const payload = {
        date: date ?? (session as any).date,
        capacity: session.capacity,
        courseId: session.courseId != null ? Number(session.courseId) : undefined,
        classroomId: session.classroomId != null ? Number(session.classroomId) : undefined
      };
      return this.http
        .put<ApiResponse<Session>>(`${BASE}/onsite-sessions/update/${idStr}`, payload)
        .pipe(
          map((r) => ({ ...(r.data ?? r), type: 'On-site' as const })),
          catchError(this.handleError)
        );
    }
    const payload = {
      date: date ?? (session as any).date,
      capacity: session.capacity,
      meetingLink: session.meetingLink,
      courseId: session.courseId != null ? Number(session.courseId) : undefined
    };
    return this.http
      .put<ApiResponse<Session>>(`${BASE}/online-sessions/update/${idStr}`, payload)
      .pipe(
        map((r) => ({ ...(r.data ?? r), type: 'Online' as const })),
        catchError(this.handleError)
      );
  }

  deleteSession(id: string | number, type: 'Online' | 'On-site'): Observable<void> {
    const idStr = String(id);
    const url =
      type === 'On-site'
        ? `${BASE}/onsite-sessions/delete/${idStr}`
        : `${BASE}/online-sessions/delete/${idStr}`;
    return this.http.delete<ApiResponse<void>>(url).pipe(map(() => undefined), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.message ?? error.message ?? 'Request failed';
    console.error('[SessionApiService]', error.status, error.url, msg);
    const enrichedError = Object.assign(new Error(msg), {
      status: error.status,
      originalError: error
    });
    return throwError(() => enrichedError);
  }
}
