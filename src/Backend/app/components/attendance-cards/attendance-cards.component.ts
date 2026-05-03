import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-cards.component.html',
  styleUrl: './attendance-cards.component.scss'
})
export class AttendanceCardsComponent {
  @Input() totalStudents = 0;
  @Input() presentCount = 0;
  @Input() absentCount = 0;
  @Input() attendanceRate = 0;
}

