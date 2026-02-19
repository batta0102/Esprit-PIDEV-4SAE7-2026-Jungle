import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppModalComponent } from '../ui/modal.component';
import { VenueDto } from '../../core/events/venue-admin-api.service';
import { EventDto } from '../../core/events/event-admin-api.service';

export type AdminEventType = 'ONLINE' | 'ONSITE';

export type CreateEventModalSubmit =
  | {
      mode: 'CREATE' | 'UPDATE';
      id?: number;
      type: 'ONLINE';
      request: {
        title: string;
        description?: string;
        startDate: string;
        endDate: string;
        meetingUrl?: string;
      };
    }
  | {
      mode: 'CREATE' | 'UPDATE';
      id?: number;
      type: 'ONSITE';
      request: {
        title: string;
        description?: string;
        startDate: string;
        endDate: string;
        venueName: string;
        venueAddress: string;
        capacity?: number | null;
        venueId?: number | null;
      };
    };

type Draft = {
  type: AdminEventType;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  meetingUrl: string;
  venueQuery: string;
  venueId: number | null;
  venueName: string;
  venueAddress: string;
  capacity: number | null;
};

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="modalTitle"
      [showFooter]="true"
      [panelClass]="'bg-background'"
      [footerClass]="'bg-background'"
      (close)="close()"
    >
      <div class="mb-4">
        <div class="h-2 rounded-full bg-border overflow-hidden">
          <div class="h-full bg-accent" [style.width.%]="completionPercent"></div>
        </div>
        <p class="mt-2 text-sm text-secondary">Completion: {{ completionPercent }}%</p>
      </div>

      <form id="createEventForm" (ngSubmit)="handleSubmit()" class="space-y-4">
        <section class="rounded-lg border border-border p-3 sm:p-4 bg-background">
          <h4 class="font-serif text-lg font-semibold text-text mb-3">Event Type</h4>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer" [class.border-primary]="draft.type==='ONLINE'" [class.opacity-60]="isEditMode">
              <input type="radio" name="eventType" [(ngModel)]="draft.type" value="ONLINE" [disabled]="isEditMode" (ngModelChange)="persistDraft()" />
              <span class="text-sm font-medium">Online</span>
            </label>
            <label class="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer" [class.border-primary]="draft.type==='ONSITE'" [class.opacity-60]="isEditMode">
              <input type="radio" name="eventType" [(ngModel)]="draft.type" value="ONSITE" [disabled]="isEditMode" (ngModelChange)="persistDraft()" />
              <span class="text-sm font-medium">On-site</span>
            </label>
          </div>
        </section>

        <section class="rounded-lg border border-border p-3 sm:p-4 bg-background">
          <h4 class="font-serif text-lg font-semibold text-text mb-3">Event Details</h4>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Title *</label>
            <input
              type="text"
              [(ngModel)]="draft.title"
              name="title"
              (ngModelChange)="persistDraft()"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Event title"
            />
            <p *ngIf="touched && !draft.title" class="mt-1 text-sm text-red-600">Title is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Description</label>
            <textarea
              [(ngModel)]="draft.description"
              name="description"
              (ngModelChange)="persistDraft()"
              rows="3"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optional details"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-2">Start Date *</label>
              <input
                type="date"
                [(ngModel)]="draft.startDate"
                name="startDate"
                (ngModelChange)="persistDraft()"
                class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p *ngIf="touched && !draft.startDate" class="mt-1 text-sm text-red-600">Start date is required.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-2">Start Time *</label>
              <input
                type="time"
                [(ngModel)]="draft.startTime"
                name="startTime"
                (ngModelChange)="persistDraft()"
                class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p *ngIf="touched && !draft.startTime" class="mt-1 text-sm text-red-600">Start time is required.</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text mb-2">End Date *</label>
              <input
                type="date"
                [(ngModel)]="draft.endDate"
                name="endDate"
                (ngModelChange)="persistDraft()"
                class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p *ngIf="touched && !draft.endDate" class="mt-1 text-sm text-red-600">End date is required.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-2">End Time *</label>
              <input
                type="time"
                [(ngModel)]="draft.endTime"
                name="endTime"
                (ngModelChange)="persistDraft()"
                class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p *ngIf="touched && !draft.endTime" class="mt-1 text-sm text-red-600">End time is required.</p>
            </div>
          </div>
        </section>

        <section *ngIf="draft.type==='ONLINE'" class="rounded-lg border border-border p-3 sm:p-4 bg-background">
          <h4 class="font-serif text-lg font-semibold text-text mb-3">Online Details</h4>
          <div>
            <label class="block text-sm font-medium text-text mb-2">Meeting URL</label>
            <input
              type="url"
              [(ngModel)]="draft.meetingUrl"
              name="meetingUrl"
              (ngModelChange)="persistDraft()"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
        </section>

        <section *ngIf="draft.type==='ONSITE'" class="rounded-lg border border-border p-3 sm:p-4 bg-background">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-serif text-lg font-semibold text-text">Venue</h4>
            <button type="button" (click)="onAddVenue.emit()" class="px-3 py-1.5 rounded-lg border border-border text-text hover:bg-background">
              + Add Venue
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-2">Search Venue</label>
            <input
              type="text"
              [(ngModel)]="draft.venueQuery"
              name="venueQuery"
              (ngModelChange)="persistDraft()"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type to search..."
            />
          </div>

          <div class="mt-2 max-h-32 overflow-auto rounded-lg border border-border">
            <button
              *ngFor="let v of filteredVenues"
              type="button"
              class="w-full text-left px-4 py-2 hover:bg-background"
              (click)="selectVenue(v)"
            >
              <div class="font-medium text-text">{{ v.name }}</div>
              <div class="text-sm text-secondary">{{ v.address }}</div>
            </button>
            <div *ngIf="filteredVenues.length===0" class="px-4 py-3 text-sm text-secondary">No venues match.</div>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label class="block text-sm font-medium text-text mb-2">Venue Name *</label>
              <input
                type="text"
                [(ngModel)]="draft.venueName"
                name="venueName"
                (ngModelChange)="persistDraft()"
                class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Venue name"
              />
              <p *ngIf="touched && !draft.venueName" class="mt-1 text-sm text-red-600">Venue name is required.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-2">Capacity</label>
              <input
                type="number"
                [(ngModel)]="draft.capacity"
                name="capacity"
                (ngModelChange)="persistDraft()"
                class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                placeholder="Optional"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-text mb-2">Venue Address *</label>
            <input
              type="text"
              [(ngModel)]="draft.venueAddress"
              name="venueAddress"
              (ngModelChange)="persistDraft()"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Venue address"
            />
            <p *ngIf="touched && !draft.venueAddress" class="mt-1 text-sm text-red-600">Venue address is required.</p>
          </div>
        </section>
      </form>

      <div modal-footer class="flex items-center justify-end gap-3">
        <button
          *ngIf="isEditMode"
          type="button"
          (click)="requestDelete()"
          class="mr-auto px-4 py-2 border border-border rounded-lg text-red-700 hover:bg-background transition-colors"
        >
          Delete
        </button>
        <button
          type="button"
          (click)="close()"
          class="px-4 py-2 border border-border rounded-lg text-text hover:bg-background transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="createEventForm"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium"
        >
          {{ submitLabel }}
        </button>
      </div>
    </app-modal>
  `,
  styles: []
})
export class CreateEventModalComponent {
  @Input() isOpen = false;
  @Input() venues: VenueDto[] = [];
  @Input() preferredVenueId: number | null = null;
  @Input() prefillStartDate: string | null = null; // YYYY-MM-DD
  @Input() prefillEndDate: string | null = null;   // YYYY-MM-DD
  @Input() editingEvent: EventDto | null = null;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<CreateEventModalSubmit>();
  @Output() onAddVenue = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<number>();

  touched = false;

  private readonly draftKey = 'jie.admin.createEvent.draft.v1';

  draft: Draft = this.defaultDraft();

  get isEditMode(): boolean {
    return !!this.editingEvent;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Event' : 'Create New Event';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Save' : 'Create';
  }

  ngOnChanges(): void {
    if (!this.isOpen) return;

    if (this.editingEvent) {
      this.draft = this.draftFromEvent(this.editingEvent);
    } else {
      const restored = this.readDraft();
      this.draft = restored ?? this.defaultDraft();
    }

    if (this.prefillStartDate) this.draft.startDate = this.prefillStartDate;
    if (this.prefillEndDate) this.draft.endDate = this.prefillEndDate;

    if (!this.editingEvent && this.preferredVenueId) {
      const found = this.venues.find((v) => v.id === this.preferredVenueId);
      if (found) this.selectVenue(found);
    }

    this.persistDraft();
    this.touched = false;
  }

  requestDelete(): void {
    const id = this.editingEvent?.id;
    if (!id) return;
    if (!confirm('Delete this event?')) return;
    this.onDelete.emit(id);
  }

  get filteredVenues(): VenueDto[] {
    const q = this.draft.venueQuery.trim().toLowerCase();
    if (!q) return this.venues;
    return this.venues.filter((v) => `${v.name} ${v.address}`.toLowerCase().includes(q));
  }

  get completionPercent(): number {
    const required = [
      !!this.draft.title,
      !!this.draft.startDate,
      !!this.draft.startTime,
      !!this.draft.endDate,
      !!this.draft.endTime,
      this.draft.type === 'ONLINE' ? true : !!this.draft.venueName,
      this.draft.type === 'ONLINE' ? true : !!this.draft.venueAddress
    ];
    const done = required.filter(Boolean).length;
    return Math.round((done / required.length) * 100);
  }

  close(): void {
    this.onClose.emit();
    if (!this.editingEvent) {
      this.resetDraft();
    }
    this.touched = false;
  }

  handleSubmit(): void {
    this.touched = true;
    if (!this.validate()) return;

    const startDateTime = this.toLocalDateTimeIso(this.draft.startDate, this.draft.startTime);
    const endDateTime = this.toLocalDateTimeIso(this.draft.endDate, this.draft.endTime);

    if (this.draft.type === 'ONLINE') {
      this.onSubmit.emit({
        mode: this.editingEvent ? 'UPDATE' : 'CREATE',
        id: this.editingEvent?.id,
        type: 'ONLINE',
        request: {
          title: this.draft.title,
          description: this.draft.description || undefined,
          startDate: startDateTime,
          endDate: endDateTime,
          meetingUrl: this.draft.meetingUrl || undefined
        }
      });
    } else {
      this.onSubmit.emit({
        mode: this.editingEvent ? 'UPDATE' : 'CREATE',
        id: this.editingEvent?.id,
        type: 'ONSITE',
        request: {
          title: this.draft.title,
          description: this.draft.description || undefined,
          startDate: startDateTime,
          endDate: endDateTime,
          venueName: this.draft.venueName,
          venueAddress: this.draft.venueAddress,
          capacity: this.draft.capacity ?? null,
          venueId: this.draft.venueId ?? null
        }
      });
    }

    if (!this.editingEvent) {
      this.resetDraft();
    }
    this.onClose.emit();
  }

  private validate(): boolean {
    if (!this.draft.title) return false;
    if (!this.draft.startDate || !this.draft.startTime) return false;
    if (!this.draft.endDate || !this.draft.endTime) return false;
    if (this.draft.type === 'ONSITE') {
      if (!this.draft.venueName) return false;
      if (!this.draft.venueAddress) return false;
    }
    return true;
  }

  selectVenue(v: VenueDto): void {
    this.draft.venueId = v.id;
    this.draft.venueName = v.name;
    this.draft.venueAddress = v.address;
    this.draft.capacity = v.capacity ?? null;
    this.persistDraft();
  }

  persistDraft(): void {
    if (this.editingEvent) return;
    try {
      localStorage.setItem(this.draftKey, JSON.stringify(this.draft));
    } catch {
      // ignore
    }
  }

  private draftFromEvent(e: EventDto): Draft {
    const type = (e.type ?? 'ONSITE') as AdminEventType;
    const start = e.startDate ?? '';
    const end = e.endDate ?? '';

    const startDate = start.slice(0, 10);
    const startTime = start.includes('T') ? start.slice(11, 16) : '';
    const endDate = end.slice(0, 10);
    const endTime = end.includes('T') ? end.slice(11, 16) : '';

    const onsite = e as any;
    const venueId = (onsite?.venue?.id ?? null) as number | null;

    return {
      type,
      title: e.title ?? '',
      description: (e.description ?? '') as string,
      startDate,
      startTime,
      endDate,
      endTime,
      meetingUrl: type === 'ONLINE' ? ((e as any).meetingUrl ?? '') : '',
      venueQuery: '',
      venueId,
      venueName: type === 'ONSITE' ? (onsite?.venueName ?? '') : '',
      venueAddress: type === 'ONSITE' ? (onsite?.venueAddress ?? '') : '',
      capacity: type === 'ONSITE' ? (onsite?.capacity ?? null) : null
    };
  }

  private readDraft(): Draft | null {
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (!raw) return null;
      return JSON.parse(raw) as Draft;
    } catch {
      return null;
    }
  }

  private resetDraft(): void {
    this.draft = this.defaultDraft();
    this.touched = false;
    try {
      localStorage.removeItem(this.draftKey);
    } catch {
      // ignore
    }
  }

  private defaultDraft(): Draft {
    return {
      type: 'ONSITE',
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      meetingUrl: '',
      venueQuery: '',
      venueId: null,
      venueName: '',
      venueAddress: '',
      capacity: null
    };
  }

  private toLocalDateTimeIso(date: string, time: string): string {
    // Spring expects LocalDateTime (no timezone). We'll send a "YYYY-MM-DDTHH:mm:ss" string.
    const hhmm = time.length === 5 ? `${time}:00` : time;
    return `${date}T${hhmm}`;
  }
}
