import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdvancedApiService } from '../../../../core/api/services/advanced-api.service';
import {
  Attendance,
  AttendanceMarkResponse,
  AttendanceSessionType,
  MarkAttendanceRequest
} from '../../../../core/api/models/attendance.model';

@Component({
  selector: 'app-session-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './session-attendance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionAttendanceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly advancedApi = inject(AdvancedApiService);

  readonly courseId = signal<string>('');
  readonly courseType = signal<string>('online');
  readonly sessionId = signal<string>('');

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly attendance = signal<Attendance[] | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const courseId = params.get('courseId');
      const courseType = params.get('courseType');
      const sessionId = params.get('sessionId');
      if (!courseId || !sessionId) {
        this.error.set('Missing identifiers for session attendance.');
        return;
      }
      this.courseId.set(courseId);
      this.courseType.set(courseType ?? 'online');
      this.sessionId.set(sessionId);
      this.loadAttendance(this.courseType(), sessionId);
    });
  }

  loadAttendance(sessionType: string, sessionId: string): void {
    this.loading.set(true);
    this.error.set(null);
    const id = Number(sessionId);
    if (Number.isNaN(id)) {
      this.error.set('Invalid session identifier.');
      this.loading.set(false);
      return;
    }
    const typeParam = (sessionType ?? 'online').toLowerCase() === 'onsite' ? 'ONSITE' : 'ONLINE';
    this.advancedApi.getSessionAttendance(typeParam, id).subscribe({
      next: (res) => {
        this.attendance.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to load attendance');
        this.loading.set(false);
      }
    });
  }

  markAttendance(): void {
    const sessionId = this.sessionId();
    if (!sessionId) return;
    this.loading.set(true);
    this.error.set(null);
    const id = Number(sessionId);
    if (Number.isNaN(id)) {
      this.error.set('Invalid session identifier.');
      this.loading.set(false);
      return;
    }
    const sessionType: AttendanceSessionType =
      this.courseType().toLowerCase() === 'onsite' ? 'ONSITE' : 'ONLINE';
    const payload: MarkAttendanceRequest = {
      sessionType,
      sessionId: id,
      studentId: 1,
      status: 'PRESENT'
    };
    this.advancedApi.markAttendance(payload).subscribe({
      next: (row) => {
        this.applyMarkResult(row);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to mark attendance');
        this.loading.set(false);
      }
    });
  }

  /** Fusionne la ligne renvoyée par le backend dans le snapshot liste (GET = tableau). */
  private applyMarkResult(row: AttendanceMarkResponse): void {
    const prev = this.attendance() ?? [];
    const idx = prev.findIndex((a) => a.sessionId === row.sessionId && a.studentId === row.studentId);
    const merged: Attendance = {
      sessionId: row.sessionId,
      studentId: row.studentId,
      status: row.status,
      note: row.note ?? undefined,
      id: row.id,
      sessionType: row.sessionType,
      markedAt: row.markedAt
    };
    const next =
      idx >= 0 ? prev.map((a, i) => (i === idx ? { ...a, ...merged } : a)) : [...prev, merged];
    this.attendance.set(next);
  }

  backToCourseAttendance(): void {
    this.router.navigate([
      '/back/courses',
      this.courseType(),
      this.courseId(),
      'attendance'
    ]);
  }
}

