import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-4">
        <div>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-medium" [ngClass]="typeClass">{{ type }}</span>
          <h3 class="font-serif text-2xl font-semibold text-text mt-2 mb-1">{{ title }}</h3>
        </div>
        <span class="text-sm font-medium" [ngClass]="statusClass">{{ status }}</span>
      </div>

      <div class="space-y-2 text-sm text-secondary mb-4">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-4 w-4" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 text-secondary">
              <path d="M7 3v2M17 3v2M4 8h16M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span>{{ date }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex h-4 w-4" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 text-secondary">
              <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </span>
          <span>{{ time }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex h-4 w-4" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 text-secondary">
              <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </span>
          <span>{{ location }}</span>
        </div>
      </div>

      <button (click)="action.emit()" [ngClass]="buttonClass" class="w-full py-3 rounded-lg font-medium transition-colors">
        {{ buttonText }}
      </button>
    </div>
  `,
  styles: []
})
export class EventCardComponent {
  @Input() type: 'ONLINE' | 'ONSITE' = 'ONSITE';
  @Input() title = '';
  @Input() date = '';
  @Input() time = '';
  @Input() location = '';
  @Input() status = 'ACTIVE';
  @Input() buttonText = 'Register';

  @Output() action = new EventEmitter<void>();

  get typeClass(): string {
    return this.type === 'ONLINE'
      ? 'bg-accent/15 text-accent'
      : 'bg-primary/15 text-primary';
  }

  get statusClass(): string {
    const s = (this.status ?? '').toUpperCase();
    if (s === 'ACTIVE' || s === 'OPEN') return 'text-green-600';
    if (s === 'CANCELED' || s === 'CANCELLED' || s === 'FULL') return 'text-red-600';
    if (s === 'COMPLETED') return 'text-secondary';
    return 'text-secondary';
  }

  get buttonClass(): string {
    if (this.buttonText.includes('Cancel')) {
      return 'border border-primary text-primary hover:bg-light';
    }
    if (this.buttonText === 'Waitlist') {
      return 'bg-light text-text hover:bg-border';
    }
    return 'bg-primary text-white hover:opacity-90';
  }
}
