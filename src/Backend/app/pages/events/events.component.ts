import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { CreateEventModalComponent } from '../../components/create-event-modal/create-event-modal.component';
import { CreateVenueModalComponent, VenueFormData } from '../../components/create-venue-modal/create-venue-modal.component';
import { EventAdminApiService, EventDto } from '../../core/events/event-admin-api.service';
import { VenueAdminApiService, VenueDto } from '../../core/events/venue-admin-api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarComponent,
    EventCardComponent,
    CreateEventModalComponent,
    CreateVenueModalComponent
  ],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  private readonly eventsApi = inject(EventAdminApiService);
  private readonly venuesApi = inject(VenueAdminApiService);

  isEventModalOpen = signal(false);
  isVenueModalOpen = signal(false);

  eventDtos = signal<EventDto[]>([]);
  venues = signal<VenueDto[]>([]);

  venueListQuery = signal('');

  preferredVenueId = signal<number | null>(null);
  prefillStartDate = signal<string | null>(null);
  prefillEndDate = signal<string | null>(null);

  editingEvent = signal<EventDto | null>(null);

  venueModalTitle = signal('New Venue');
  venueModalSubmitLabel = signal('Create');
  editingVenueId = signal<number | null>(null);
  venueInitialData = signal<Partial<VenueFormData> | null>(null);

  readonly filteredVenues = computed(() => {
    const q = this.venueListQuery().trim().toLowerCase();
    const all = this.venues();
    if (!q) return all;
    return all.filter((v) => `${v.name} ${v.address} ${v.city ?? ''} ${v.country ?? ''}`.toLowerCase().includes(q));
  });

  readonly calendarMarkers = computed(() => {
    return this.eventDtos().map((e) => {
      const dateIso = (e.startDate ?? '').slice(0, 10);
      const timeLabel = (e.startDate ?? '').includes('T') ? (e.startDate.split('T')[1] ?? '').slice(0, 5) : undefined;
      const type = (e.type ?? 'ONSITE') as 'ONLINE' | 'ONSITE';

      const locationLabel = type === 'ONLINE'
        ? 'Online'
        : ((e as any).venueName || (e as any).venueAddress || 'On-site');

      return {
        dateIso,
        title: e.title,
        type,
        timeLabel,
        locationLabel
      };
    });
  });

  readonly upcomingCards = computed(() => {
    return this.eventDtos()
      .slice()
      .sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))
      .map((e) => {
        const type = (e.type ?? 'ONSITE') as 'ONLINE' | 'ONSITE';
        const date = this.formatDateDisplay((e.startDate ?? '').slice(0, 10));
        const time = this.formatTimeDisplay((e.startDate ?? '').slice(11, 16));
        const location = type === 'ONLINE' ? 'Online' : ((e as any).venueName ?? (e as any).venueAddress ?? 'On-site');
        return {
          id: e.id,
          dto: e,
          type,
          title: e.title,
          date,
          time,
          location,
          status: e.status,
          buttonText: 'Manage'
        };
      });
  });

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.venuesApi.listVenues().subscribe({
      next: (v) => this.venues.set(v),
      error: () => this.venues.set([])
    });
    this.eventsApi.listEvents().subscribe({
      next: (e) => this.eventDtos.set(e),
      error: () => this.eventDtos.set([])
    });
  }

  openModal(): void {
    this.prefillStartDate.set(null);
    this.prefillEndDate.set(null);
    this.editingEvent.set(null);
    this.isEventModalOpen.set(true);
  }

  closeEventModal(): void {
    this.isEventModalOpen.set(false);
    this.editingEvent.set(null);
  }

  openManageEvent(dto: EventDto): void {
    this.prefillStartDate.set(null);
    this.prefillEndDate.set(null);
    this.editingEvent.set(dto);
    this.isEventModalOpen.set(true);
  }

  handleEventSubmit(submit: any): void {
    if (!submit) return;

    const isUpdate = submit.mode === 'UPDATE' && typeof submit.id === 'number';

    if (submit.type === 'ONLINE') {
      const req = submit.request;
      const call$ = isUpdate
        ? this.eventsApi.updateOnlineEvent(submit.id, req)
        : this.eventsApi.createOnlineEvent(req);

      call$.subscribe({
        next: () => this.refreshAll(),
        complete: () => this.closeEventModal()
      });
      return;
    }

    const req = submit.request;
    const call$ = isUpdate
      ? this.eventsApi.updateOnsiteEvent(submit.id, req)
      : this.eventsApi.createOnsiteEvent(req);

    call$.subscribe({
      next: () => this.refreshAll(),
      complete: () => this.closeEventModal()
    });
  }

  deleteEvent(id: number): void {
    this.eventsApi.deleteEvent(id).subscribe({
      next: () => this.refreshAll(),
      complete: () => this.closeEventModal()
    });
  }

  handleCalendarDateSelected(dateIso: string): void {
    this.prefillStartDate.set(dateIso);
    this.prefillEndDate.set(dateIso);
    this.isEventModalOpen.set(true);
  }

  openCreateVenueModal(): void {
    this.editingVenueId.set(null);
    this.venueModalTitle.set('New Venue');
    this.venueModalSubmitLabel.set('Create');
    this.venueInitialData.set(null);
    this.isVenueModalOpen.set(true);
  }

  openEditVenueModal(venue: VenueDto): void {
    this.editingVenueId.set(venue.id);
    this.venueModalTitle.set('Edit Venue');
    this.venueModalSubmitLabel.set('Save');
    this.venueInitialData.set({
      name: venue.name,
      address: venue.address,
      city: venue.city ?? '',
      country: venue.country ?? '',
      postalCode: venue.postalCode ?? '',
      capacity: venue.capacity ?? null
    });
    this.isVenueModalOpen.set(true);
  }

  closeVenueModal(): void {
    this.isVenueModalOpen.set(false);
  }

  handleVenueSubmit(form: VenueFormData): void {
    const editingId = this.editingVenueId();
    if (editingId) {
      this.venuesApi.updateVenue(editingId, form).subscribe({
        next: (v) => {
          this.preferredVenueId.set(v.id);
          this.refreshAll();
        },
        complete: () => this.closeVenueModal()
      });
      return;
    }

    this.venuesApi.createVenue(form).subscribe({
      next: (v) => {
        this.preferredVenueId.set(v.id);
        this.refreshAll();
      },
      complete: () => this.closeVenueModal()
    });
  }

  deleteVenue(id: number): void {
    this.venuesApi.deleteVenue(id).subscribe({
      next: () => this.refreshAll()
    });
  }

  private formatDateDisplay(dateStr: string): string {
    // Convert yyyy-mm-dd to Month DD format
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  private formatTimeDisplay(timeStr: string): string {
    // Convert HH:mm to HH:mm AM/PM format
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}
