import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  presentRate: number;
  absentRate: number;
}

export interface WeeklyAttendancePoint {
  label: string;
  present: number;
  absent: number;
}

@Component({
  selector: 'app-attendance-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-chart.component.html',
  styleUrl: './attendance-chart.component.scss'
})
export class AttendanceChartComponent {
  @Input() summary: AttendanceSummary | null = null;
  @Input() weekly: WeeklyAttendancePoint[] = [];
}

