import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppModalComponent } from '../ui/modal.component';

import {
  CreateOnlineEventRequest,
  CreateOnsiteEventRequest,
  EventDto
} from '../../core/events/event-admin-api.service';
import { VenueDto } from '../../core/events/venue-admin-api.service';

type EventModalSubmit =
  | { mode: 'create'; type: 'ONLINE'; data: CreateOnlineEventRequest }
  | { mode: 'create'; type: 'ONSITE'; data: CreateOnsiteEventRequest }
  | { mode: 'edit'; id: number; type: 'ONLINE'; data: CreateOnlineEventRequest }
  | { mode: 'edit'; id: number; type: 'ONSITE'; data: CreateOnsiteEventRequest };

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, AppModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="title" (close)="close()">
      <form (ngSubmit)="handleSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-text mb-2">Title *</label>
          <input 
            type="text" 
            [(ngModel)]="form.title" 
            name="title"
            class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Event title"
          />
          <p *ngIf="touched && !form.title" class="mt-1 text-sm text-red-600">Title is required.</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-2">Type *</label>
          <select 
            [(ngModel)]="form.type" 
            name="type"
            class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="ONLINE">ONLINE</option>
            <option value="ONSITE">ONSITE</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-text mb-2">Description</label>
          <textarea
            [(ngModel)]="form.description"
            name="description"
            rows="3"
            class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Optional description"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-text mb-2">Start *</label>
            <input 
              type="datetime-local" 
              [(ngModel)]="form.startDate" 
              name="startDate"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p *ngIf="touched && !form.startDate" class="mt-1 text-sm text-red-600">Start date/time is required.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-text mb-2">End *</label>
            <input 
              type="datetime-local" 
              [(ngModel)]="form.endDate" 
              name="endDate"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p *ngIf="touched && !form.endDate" class="mt-1 text-sm text-red-600">End date/time is required.</p>
          </div>
        </div>

        <ng-container *ngIf="form.type === 'ONLINE'">
          <div>
            <label class="block text-sm font-medium text-text mb-2">Meeting URL</label>
            <input
              type="url"
              [(ngModel)]="form.meetingUrl"
              name="meetingUrl"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
        </ng-container>

        <ng-container *ngIf="form.type === 'ONSITE'">
          <div>
            <label class="block text-sm font-medium text-text mb-2">Venue *</label>
            <select
              [(ngModel)]="form.venueId"
              name="venueId"
              class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option [ngValue]="null">-- Select venue --</option>
              <option *ngFor="let v of venues" [ngValue]="v.id">{{ v.name }} ({{ v.address }})</option>
            </select>
            <p *ngIf="touched && !form.venueId" class="mt-1 text-sm text-red-600">Venue is required for onsite events.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-text mb-2">Capacity</label>
              <input
                type="number"
                [(ngModel)]="form.capacity"
                name="capacity"
                class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                placeholder="Optional"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text mb-2">Use venue address</label>
              <div class="text-sm text-secondary">The address will be taken from the selected venue.</div>
            </div>
          </div>
        </ng-container>

        <div class="mt-6 flex justify-end gap-3">
          <button 
            type="button" 
            (click)="close()"
            class="px-4 py-2 border border-border rounded-lg text-text hover:bg-light transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            {{ submitLabel }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
  styles: []
})
export class CreateEventModalComponent {
  @Input() isOpen = false;
  @Input() event: EventDto | null = null;
  @Input() venues: VenueDto[] = [];

  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<EventModalSubmit>();

  touched = false;

  get title(): string {
    return this.event ? 'Edit Event' : 'New Event';
  }

  get submitLabel(): string {
    return this.event ? 'Update' : 'Create';
  }

  form: {
    title: string;
    description: string;
    type: 'ONLINE' | 'ONSITE';
    startDate: string;
    endDate: string;
    meetingUrl: string;
    venueId: number | null;
    capacity: number | null;
  } = {
    title: '',
    description: '',
    type: 'ONLINE',
    startDate: '',
    endDate: '',
    meetingUrl: '',
    venueId: null,
    capacity: null
  };

  ngOnChanges(): void {
    if (!this.isOpen) return;
    this.touched = false;

    const draft = this.loadDraft();
    if (!this.event && draft) {
      this.form = draft;
      return;
    }

    if (this.event) {
      this.form = {
        title: this.event.title ?? '',
        description: (this.event.description ?? '') as string,
        type: this.event.type,
        startDate: this.toDatetimeLocal(this.event.startDate),
        endDate: this.toDatetimeLocal(this.event.endDate),
        meetingUrl: (this.event as any).meetingUrl ?? '',
        venueId: (this.event as any).venue?.id ?? null,
        capacity: (this.event as any).capacity ?? null
      };
      return;
    }

    this.resetForm();
  }

  close(): void {
    this.onClose.emit();
    this.resetForm();
  }

  handleSubmit(): void {
    this.touched = true;
    this.saveDraft();
    if (!this.validate()) return;

    if (this.form.type === 'ONLINE') {
      const payload: CreateOnlineEventRequest = {
        title: this.form.title,
        description: this.form.description || undefined,
        startDate: this.fromDatetimeLocal(this.form.startDate),
        endDate: this.fromDatetimeLocal(this.form.endDate),
        meetingUrl: this.form.meetingUrl || undefined
      };
      if (this.event) {
        this.onSubmit.emit({ mode: 'edit', id: this.event.id, type: 'ONLINE', data: payload });
      } else {
        this.onSubmit.emit({ mode: 'create', type: 'ONLINE', data: payload });
      }
    } else {
      const venue = this.venues.find(v => v.id === this.form.venueId);
      const payload: CreateOnsiteEventRequest = {
        title: this.form.title,
        description: this.form.description || undefined,
        startDate: this.fromDatetimeLocal(this.form.startDate),
        endDate: this.fromDatetimeLocal(this.form.endDate),
        venueName: venue?.name ?? '',
        venueAddress: venue?.address ?? '',
        capacity: this.form.capacity ?? null,
        venueId: this.form.venueId
      };
      if (this.event) {
        this.onSubmit.emit({ mode: 'edit', id: this.event.id, type: 'ONSITE', data: payload });
      } else {
        this.onSubmit.emit({ mode: 'create', type: 'ONSITE', data: payload });
      }
    }

    this.clearDraft();
    this.resetForm();
    this.onClose.emit();
  }

  private validate(): boolean {
    if (!this.form.title?.trim()) return false;
    if (!this.form.startDate) return false;
    if (!this.form.endDate) return false;
    if (this.form.type === 'ONSITE' && !this.form.venueId) return false;
    return true;
  }

  private resetForm(): void {
    this.form = {
      title: '',
      description: '',
      type: 'ONLINE',
      startDate: '',
      endDate: '',
      meetingUrl: '',
      venueId: null,
      capacity: null
    };
    this.touched = false;
  }

  private toDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private fromDatetimeLocal(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString();
  }

  private draftKey = 'admin-event-draft';

  private saveDraft(): void {
    try {
      if (this.event) return;
      localStorage.setItem(this.draftKey, JSON.stringify(this.form));
    } catch {
      // ignore
    }
  }

  private loadDraft(): any {
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(this.draftKey);
    } catch {
      // ignore
    }
  }
}
