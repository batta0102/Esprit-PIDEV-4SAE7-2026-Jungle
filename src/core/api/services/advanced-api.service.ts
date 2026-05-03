import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProgressResponse } from '../models/progress.model';
import { Attendance, AttendanceMarkResponse, MarkAttendanceRequest } from '../models/attendance.model';
import {
  AnomalyAlert,
  BenchmarkResponse,
  EarlyWarning,
  ExplainabilityReport,
  Intervention,
  RiskConfig
} from '../models/attendance.models';

const BASE = '/api';

@Injectable({ providedIn: 'root' })
export class AdvancedApiService {
  private readonly http = inject(HttpClient);

  getProgress(
    courseType: string,
    courseId: string | number,
    studentId: number | string
  ): Observable<ProgressResponse> {
    const url = `${BASE}/advanced/progress`;
    const params = {
      courseType,
      courseId: String(courseId),
      studentId: String(studentId)
    };
    return this.http.get<ProgressResponse>(url, { params }).pipe(catchError(this.handleError));
  }

  getSessionAttendance(type: string, sessionId: number): Observable<Attendance[]> {
    const url = `${BASE}/advanced/attendance/session`;
    const params = {
      type,
      id: String(sessionId)
    };
    return this.http.get<Attendance[]>(url, { params }).pipe(catchError(this.handleError));
  }

  markAttendance(payload: MarkAttendanceRequest): Observable<AttendanceMarkResponse> {
    const url = `${BASE}/advanced/attendance/mark`;
    return this.http.post<AttendanceMarkResponse>(url, payload).pipe(catchError(this.handleError));
  }

  getRiskConfig(courseId?: string | number, sessionId?: string | number): Observable<RiskConfig> {
    const url = `${BASE}/advanced/risk/config`;
    const params: Record<string, string> = {};
    if (courseId != null) params['courseId'] = String(courseId);
    if (sessionId != null) params['sessionId'] = String(sessionId);
    return this.http.get<RiskConfig>(url, { params }).pipe(catchError(this.handleError));
  }

  updateRiskConfig(payload: RiskConfig): Observable<RiskConfig> {
    const url = `${BASE}/advanced/risk/config`;
    return this.http.put<RiskConfig>(url, payload).pipe(catchError(this.handleError));
  }

  getRiskExplanation(
    studentId: number | string,
    courseId?: string | number,
    sessionId?: string | number
  ): Observable<ExplainabilityReport> {
    const url = `${BASE}/advanced/risk/explanation`;
    const params: Record<string, string> = {
      studentId: String(studentId)
    };
    if (courseId != null) params['courseId'] = String(courseId);
    if (sessionId != null) params['sessionId'] = String(sessionId);
    return this.http.get<ExplainabilityReport>(url, { params }).pipe(catchError(this.handleError));
  }

  getEarlyWarnings(courseId?: string | number): Observable<EarlyWarning[]> {
    const url = `${BASE}/advanced/warnings/early`;
    const params: Record<string, string> = {};
    if (courseId != null) params['courseId'] = String(courseId);
    return this.http.get<EarlyWarning[]>(url, { params }).pipe(catchError(this.handleError));
  }

  getCourseAnomalies(courseId: string | number, sessionId?: string | number): Observable<AnomalyAlert[]> {
    const url = `${BASE}/advanced/anomalies`;
    const params: Record<string, string> = {
      courseId: String(courseId)
    };
    if (sessionId != null) params['sessionId'] = String(sessionId);
    return this.http.get<AnomalyAlert[]>(url, { params }).pipe(catchError(this.handleError));
  }

  createIntervention(payload: Intervention): Observable<Intervention> {
    const url = `${BASE}/advanced/interventions`;
    return this.http.post<Intervention>(url, payload).pipe(catchError(this.handleError));
  }

  getStudentInterventions(studentId: number | string): Observable<Intervention[]> {
    const url = `${BASE}/advanced/interventions/student/${studentId}`;
    return this.http.get<Intervention[]>(url).pipe(catchError(this.handleError));
  }

  updateInterventionStatus(
    interventionId: string,
    status: Intervention['status']
  ): Observable<Intervention> {
    const url = `${BASE}/advanced/interventions/${interventionId}/status`;
    return this.http
      .patch<Intervention>(url, { status })
      .pipe(catchError(this.handleError));
  }

  getBenchmark(courseId: string | number): Observable<BenchmarkResponse> {
    const url = `${BASE}/advanced/benchmark/course/${courseId}`;
    return this.http.get<BenchmarkResponse>(url).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.message ?? error.message ?? 'Request failed';
    console.error('[AdvancedApiService]', error.status, error.url, msg);
    const enrichedError = Object.assign(new Error(msg), {
      status: error.status,
      originalError: error
    });
    return throwError(() => enrichedError);
  }
}
