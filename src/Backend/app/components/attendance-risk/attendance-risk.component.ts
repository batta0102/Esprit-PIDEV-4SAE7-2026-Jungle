import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RiskStudent {
  id: number;
  name: string;
  rate: number;
  total: number;
  missed: number;
}

interface TopAtRisk {
  name: string;
  rate: number;
  level: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-attendance-risk',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-risk.component.html',
  styleUrl: './attendance-risk.component.scss'
})
export class AttendanceRiskComponent {
  @Input() high: RiskStudent[] = [];
  @Input() medium: RiskStudent[] = [];
  @Input() low: RiskStudent[] = [];
  @Input() topAtRisk: TopAtRisk[] = [];

  trackRisk(_index: number, s: RiskStudent): number {
    return s.id;
  }

  trackTop(_index: number, s: TopAtRisk): string {
    return s.name;
  }
}

