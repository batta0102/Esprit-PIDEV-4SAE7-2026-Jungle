import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment';
import { Classroom } from '../models';

const BASE = `${environment.apiBaseUrl}/classrooms`;

@Injectable({ providedIn: 'root' })
export class ClassroomApiService {
  private readonly http = inject(HttpClient);

  getClassrooms(): Observable<Classroom[]> {
    return this.http.get<Classroom[] | { content?: Classroom[]; data?: Classroom[] }>(`${BASE}/all`).pipe(
      map((res) => (Array.isArray(res) ? res : res?.content ?? res?.data ?? [])),
      catchError(this.handleError)
    );
  }

  getClassroomById(id: string | number): Observable<Classroom> {
    return this.http.get<Classroom>(`${BASE}/${id}`).pipe(catchError(this.handleError));
  }

  createClassroom(classroom: Partial<Classroom>): Observable<Classroom> {
    return this.http.post<Classroom>(BASE, classroom).pipe(catchError(this.handleError));
  }

  updateClassroom(id: string | number, classroom: Partial<Classroom>): Observable<Classroom> {
    return this.http.put<Classroom>(`${BASE}/${id}`, classroom).pipe(catchError(this.handleError));
  }

  deleteClassroom(id: string | number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.message ?? error.message ?? 'Request failed';
    console.error('[ClassroomApiService]', error.status, error.url, msg);
    return throwError(() => new Error(msg));
  }
}
