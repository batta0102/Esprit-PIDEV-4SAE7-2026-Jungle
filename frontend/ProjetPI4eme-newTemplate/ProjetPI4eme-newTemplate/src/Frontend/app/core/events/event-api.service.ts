import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { EventModel } from '../data/models';

type BackendEventType = 'ONLINE' | 'ONSITE';

type BackendEventDto = {
  id: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  type: BackendEventType;
  meetingUrl?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
};

@Injectable({ providedIn: 'root' })
export class EventApiService {
  private readonly http = inject(HttpClient);

  listEvents(): Observable<EventModel[]> {
    return this.http.get<BackendEventDto[]>('/api/events').pipe(map((rows) => rows.map((e) => this.mapEvent(e))));
  }

  registerForEvent(eventId: number, name: string, email: string): Observable<unknown> {
    return this.http.post(`/api/events/${eventId}/registrations`, { name, email });
  }

  private mapEvent(e: BackendEventDto): EventModel {
    const dateIso = (e.startDate ?? '').slice(0, 10);
    const startTime = (e.startDate ?? '').includes('T') ? (e.startDate.split('T')[1] ?? '').slice(0, 5) : '';
    const endTime = (e.endDate ?? '').includes('T') ? (e.endDate.split('T')[1] ?? '').slice(0, 5) : '';
    const timeLabel = startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime;

    const location = e.type === 'ONLINE' ? 'Online' : (e.venueName || e.venueAddress || 'On-site');

    return {
      id: String(e.id),
      name: e.title,
      date: dateIso,
      time: timeLabel,
      location,
      visibility: 'public',
      priceType: 'free',
      overview: e.description ?? '',
      expectedOutcomes: [],
      schedule: []
    };
  }
}
