import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-border p-6 bg-white shadow-sm hover:shadow-md transition-shadow relative h-full flex flex-col justify-between">
      <div class="absolute right-4 top-4">
        <button class="p-1.5 rounded-full hover:bg-light">⋯</button>
      </div>

      <div class="mb-3">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-medium" [ngClass]="levelClass">Level {{ level }}</span>
      </div>

      <div>
        <h3 class="font-serif text-2xl font-semibold text-text mb-1">{{ title }}</h3>
        <p class="text-sm text-secondary mb-2">Tutor #{{ tutorId }}</p>
        <p class="text-sm text-secondary">{{ description || 'No description provided' }}</p>
      </div>

      <div class="mt-4 border-t border-border pt-4 text-sm text-secondary">
        Course level {{ level }}
      </div>
    </div>
  `,
  styles: []
})
export class CourseCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'A1';
  @Input() tutorId = 0;

  get levelClass(): string {
    switch (this.level) {
      case 'A1':
      case 'A2':
        return 'bg-warning/80 text-text';
      case 'B1':
      case 'B2':
        return 'bg-warning text-text';
      case 'C1':
      case 'C2':
        return 'bg-surface text-text-muted border border-border';
      default:
        return 'bg-surface text-text-muted border border-border';
    }
  }
}

