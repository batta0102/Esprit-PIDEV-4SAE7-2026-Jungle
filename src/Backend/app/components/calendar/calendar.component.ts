import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export interface CalendarMarker {
  dateIso: string; // YYYY-MM-DD
  title: string;
  type: 'ONLINE' | 'ONSITE';
  timeLabel?: string;
  locationLabel?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-serif text-lg font-semibold text-text">{{ monthTitle }}</h3>
        <div class="space-x-2 text-secondary">
          <button type="button" (click)="prevMonth()" aria-label="Previous month">‹</button>
          <button type="button" (click)="nextMonth()" aria-label="Next month">›</button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2 text-center text-sm text-secondary mb-2">
        <div *ngFor="let d of dayNames">{{ d }}</div>
      </div>

      <div class="grid grid-cols-7 gap-2 text-center">
        <div *ngFor="let cell of calendarCells" class="py-2">
          <button
            type="button"
            [disabled]="!cell.current"
            [class]="cellClass(cell)"
            (click)="cell.current && selectDate(cell.date)"
            [title]="markerTitle(cell.date)"
          >
            <span>{{ cell.date.getDate() }}</span>
            <span
              *ngIf="markerFor(cell.date) as m"
              class="mt-1 block mx-auto h-1.5 w-1.5 rounded-full"
              [ngClass]="m.type === 'ONLINE' ? 'bg-accent' : 'bg-primary'"
            ></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CalendarComponent {
  @Input() markers: CalendarMarker[] = [];
  @Output() dateSelected = new EventEmitter<string>();

  dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  month = signal(new Date());

  get monthTitle(): string {
    const d = this.month();
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  get calendarCells() {
    const date = new Date(this.month());
    date.setDate(1);
    const startDay = date.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const cells = [] as { date: Date; current: boolean }[];

    for (let i = 0; i < startDay; i++) {
      const prev = new Date(date);
      prev.setDate(i - startDay + 1);
      cells.push({ date: prev, current: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const curr = new Date(date.getFullYear(), date.getMonth(), d);
      cells.push({ date: curr, current: true });
    }

    while (cells.length % 7 !== 0) {
      const next = new Date(date.getFullYear(), date.getMonth(), daysInMonth + (cells.length - startDay) + 1);
      cells.push({ date: next, current: false });
    }

    return cells;
  }

  selectDate(d: Date): void {
    const iso = d.toISOString().slice(0, 10);
    this.dateSelected.emit(iso);
  }

  markerFor(d: Date): CalendarMarker | undefined {
    const iso = d.toISOString().slice(0, 10);
    return this.markers.find((m) => m.dateIso === iso);
  }

  markerTitle(d: Date): string {
    const m = this.markerFor(d);
    if (!m) return 'Click to create an event on this date';
    const parts = [m.title];
    if (m.timeLabel) parts.push(m.timeLabel);
    if (m.locationLabel) parts.push(m.locationLabel);
    return parts.join(' • ');
  }

  cellClass(cell: { date: Date; current: boolean }) {
    const today = new Date();
    const isToday = cell.date.toDateString() === today.toDateString();
    if (isToday) return 'mx-auto inline-flex h-10 w-10 flex-col items-center justify-center rounded-full bg-primary text-white';
    if (!cell.current) {
      return 'mx-auto inline-flex h-10 w-10 flex-col items-center justify-center text-secondary opacity-50 cursor-not-allowed';
    }
    return 'mx-auto inline-flex h-10 w-10 flex-col items-center justify-center rounded-full hover:bg-background';
  }

  prevMonth() {
    const d = new Date(this.month());
    d.setMonth(d.getMonth() - 1);
    this.month.set(d);
  }

  nextMonth() {
    const d = new Date(this.month());
    d.setMonth(d.getMonth() + 1);
    this.month.set(d);
  }
}
