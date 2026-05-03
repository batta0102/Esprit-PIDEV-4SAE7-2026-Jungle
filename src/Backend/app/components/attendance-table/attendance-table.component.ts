import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceStatus } from '../../../../core/api/models/attendance.model';

export interface AttendanceTableRecord {
  sessionId: number;
  studentId: number;
  status: AttendanceStatus;
  note?: string;
  courseLabel?: string;
  sessionLabel?: string;
  markedAt?: string;
}

export interface AttendancePaginationInfo {
  start: number;
  end: number;
  total: number;
}

@Component({
  selector: 'app-attendance-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-table.component.html',
  styleUrl: './attendance-table.component.scss'
})
export class AttendanceTableComponent {
  @Input() records: AttendanceTableRecord[] = [];
  @Input() paginationInfo!: AttendancePaginationInfo;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() hasPendingChanges = false;
  @Input() bulkSaving = false;
  @Input() selectedSessionId: number | null = null;
  @Input() pendingStatus: Record<string, AttendanceStatus> = {};
  @Input() dirtyMap: Record<string, boolean> = {};

  @Input() getStudentName!: (id: number) => string;
  @Input() getStudentInitial!: (id: number) => string;
  @Input() formatDateShort!: (value: string | undefined) => string;
  @Input() effectiveStatus!: (record: AttendanceTableRecord) => AttendanceStatus;
  @Input() recordKey!: (record: AttendanceTableRecord) => string;
  @Input() effectiveNote!: (record: AttendanceTableRecord) => string | undefined;

  @Output() saveAll = new EventEmitter<void>();
  @Output() changePage = new EventEmitter<number>();
  @Output() rowStatusChange = new EventEmitter<{ record: AttendanceTableRecord; status: AttendanceStatus }>();
  @Output() rowNoteChange = new EventEmitter<{ record: AttendanceTableRecord; note: string }>();
  @Output() undoRow = new EventEmitter<AttendanceTableRecord>();
  @Output() saveRow = new EventEmitter<AttendanceTableRecord>();

  statusButtonClass(record: AttendanceTableRecord, status: AttendanceStatus): string {
    const current = this.effectiveStatus(record);
    if (current === status) {
      if (status === 'PRESENT') return 'px-2.5 py-1 rounded-full bg-green-600 text-white';
      if (status === 'ABSENT') return 'px-2.5 py-1 rounded-full bg-red-600 text-white';
      if (status === 'LATE') return 'px-2.5 py-1 rounded-full bg-orange-500 text-white';
      return 'px-2.5 py-1 rounded-full bg-blue-600 text-white';
    }
    return 'px-2.5 py-1 rounded-full text-gray-700 hover:bg-gray-200';
  }

  onChangeStatus(record: AttendanceTableRecord, status: AttendanceStatus): void {
    this.rowStatusChange.emit({ record, status });
  }

  onNoteChange(record: AttendanceTableRecord, value: unknown): void {
    const note = value == null ? '' : String(value);
    this.rowNoteChange.emit({ record, note });
  }

  trackRow(index: number, item: AttendanceTableRecord): string | number {
    return this.recordKey ? this.recordKey(item) : index;
  }

  onGoToPage(page: number): void {
    this.changePage.emit(page);
  }
}

