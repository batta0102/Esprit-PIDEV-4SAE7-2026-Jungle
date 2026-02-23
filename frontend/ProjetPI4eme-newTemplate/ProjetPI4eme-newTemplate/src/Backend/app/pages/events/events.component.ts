import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { CreateEventModalComponent } from '../../components/create-event-modal/create-event-modal.component';
import { CreateVenueModalComponent, VenueFormData } from '../../components/create-venue-modal/create-venue-modal.component';

import {
  CreateOnlineEventRequest,
  CreateOnsiteEventRequest,
  EventAdminApiService,
  EventDto
} from '../../core/events/event-admin-api.service';
import { CreateVenueRequest, VenueAdminApiService, VenueDto } from '../../core/events/venue-admin-api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
  CommonModule,
  CalendarComponent,
  EventCardComponent,
  CreateEventModalComponent,
  CreateVenueModalComponent
  ],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  private readonly eventsApi = inject(EventAdminApiService);
  private readonly venuesApi = inject(VenueAdminApiService);

  isEventModalOpen = signal(false);
  isVenueModalOpen = signal(false);

  loading = signal(false);
  error = signal<string | null>(null);

  events = signal<EventDto[]>([]);
  venues = signal<VenueDto[]>([]);

  selectedDate = signal<string | null>(null); // YYYY-MM-DD

  editingEvent = signal<EventDto | null>(null);
  editingVenue = signal<VenueDto | null>(null);

  editingVenueFormData = computed(() => {
    const v = this.editingVenue();
    if (!v) return null;
    return {
      name: v.name,
      address: v.address,
      city: v.city ?? undefined,
      country: v.country ?? undefined,
      postalCode: v.postalCode ?? undefined,
      capacity: v.capacity ?? null
    };
  });

  markers = computed(() => {
    const map: Record<string, number> = {};
    for (const e of this.events()) {
      const key = (e.startDate ?? '').slice(0, 10);
      if (!key) continue;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  });

  filteredEvents = computed(() => {
    const all = [...this.events()].sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));
    const key = this.selectedDate();
    if (!key) return all;
    return all.filter(e => (e.startDate ?? '').startsWith(key));
  });

  constructor() {
    this.refreshAll();
  }

  refreshAll(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventsApi.listEvents().subscribe({
      next: (events) => this.events.set(events ?? []),
      error: () => this.error.set('Failed to load events.'),
      complete: () => this.loading.set(false)
    });

    this.venuesApi.listVenues().subscribe({
      next: (venues) => this.venues.set(venues ?? []),
      error: () => this.error.set('Failed to load venues.')
    });
  }

  onDateSelected(key: string): void {
    this.selectedDate.set(this.selectedDate() === key ? null : key);
  }

  openCreateEvent(): void {
    this.editingEvent.set(null);
    this.isEventModalOpen.set(true);
  }

  openEditEvent(event: EventDto): void {
    this.editingEvent.set(event);
    this.isEventModalOpen.set(true);
  }

  closeEventModal(): void {
    this.isEventModalOpen.set(false);
    this.editingEvent.set(null);
  }

  handleEventSubmit(payload: any): void {
    this.error.set(null);
    if (!payload) return;

    const done = () => {
      this.closeEventModal();
      this.refreshAll();
    };

    if (payload.mode === 'create' && payload.type === 'ONLINE') {
      this.eventsApi.createOnlineEvent(payload.data as CreateOnlineEventRequest).subscribe({ next: done, error: () => this.error.set('Failed to create online event.') });
      return;
    }
    if (payload.mode === 'create' && payload.type === 'ONSITE') {
      this.eventsApi.createOnsiteEvent(payload.data as CreateOnsiteEventRequest).subscribe({ next: done, error: () => this.error.set('Failed to create onsite event.') });
      return;
    }
    if (payload.mode === 'edit' && payload.type === 'ONLINE') {
      this.eventsApi.updateOnlineEvent(payload.id, payload.data as CreateOnlineEventRequest).subscribe({ next: done, error: () => this.error.set('Failed to update online event.') });
      return;
    }
    if (payload.mode === 'edit' && payload.type === 'ONSITE') {
      this.eventsApi.updateOnsiteEvent(payload.id, payload.data as CreateOnsiteEventRequest).subscribe({ next: done, error: () => this.error.set('Failed to update onsite event.') });
      return;
    }
  }

  deleteEvent(event: EventDto): void {
    if (!confirm(`Delete event "${event.title}"?`)) return;
    this.error.set(null);
    this.eventsApi.deleteEvent(event.id).subscribe({
      next: () => this.refreshAll(),
      error: () => this.error.set('Failed to delete event.')
    });
  }

  openCreateVenue(): void {
    this.editingVenue.set(null);
    this.isVenueModalOpen.set(true);
  }

  openEditVenue(venue: VenueDto): void {
    this.editingVenue.set(venue);
    this.isVenueModalOpen.set(true);
  }

  closeVenueModal(): void {
    this.isVenueModalOpen.set(false);
    this.editingVenue.set(null);
  }

  handleVenueSubmit(data: VenueFormData): void {
    this.error.set(null);
    const req: CreateVenueRequest = {
      name: data.name,
      address: data.address,
      city: data.city || undefined,
      country: data.country || undefined,
      postalCode: data.postalCode || undefined,
      capacity: data.capacity ?? null
    };

    const editing = this.editingVenue();
    if (editing) {
      this.venuesApi.updateVenue(editing.id, req).subscribe({
        next: () => {
          this.closeVenueModal();
          this.refreshAll();
        },
        error: () => this.error.set('Failed to update venue.')
      });
      return;
    }

    this.venuesApi.createVenue(req).subscribe({
      next: () => {
        this.closeVenueModal();
        this.refreshAll();
      },
      error: () => this.error.set('Failed to create venue.')
    });
  }

  deleteVenue(venue: VenueDto): void {
    if (!confirm(`Delete venue "${venue.name}"?`)) return;
    this.error.set(null);
    this.venuesApi.deleteVenue(venue.id).subscribe({
      next: () => this.refreshAll(),
      error: () => this.error.set('Failed to delete venue.')
    });
  }
}
