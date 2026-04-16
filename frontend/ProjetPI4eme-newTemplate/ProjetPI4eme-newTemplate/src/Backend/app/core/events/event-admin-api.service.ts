import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AdminEventType = 'ONLINE' | 'ONSITE';

export interface BaseEventDto {
	id: number;
	title: string;
	description?: string | null;
	startDate: string; // ISO date-time
	endDate: string;   // ISO date-time
	status: string;
	type: AdminEventType;
	eventDiscriminator?: string;
}

export interface OnlineEventDto extends BaseEventDto {
	meetingUrl?: string | null;
}

export interface OnsiteEventDto extends BaseEventDto {
	venueName?: string | null;
	venueAddress?: string | null;
	capacity?: number | null;
	venue?: { id: number } | null;
}

export type EventDto = OnlineEventDto | OnsiteEventDto;

export interface CreateOnlineEventRequest {
	title: string;
	description?: string;
	startDate: string;
	endDate: string;
	meetingUrl?: string;
}

export interface CreateOnsiteEventRequest {
	title: string;
	description?: string;
	startDate: string;
	endDate: string;
	venueName: string;
	venueAddress: string;
	capacity?: number | null;
	venueId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class EventAdminApiService {
	private readonly http = inject(HttpClient);

	listEvents(): Observable<EventDto[]> {
		return this.http.get<EventDto[]>('/api/events');
	}

	createOnlineEvent(req: CreateOnlineEventRequest): Observable<OnlineEventDto> {
		return this.http.post<OnlineEventDto>('/api/events/online', req);
	}

	createOnsiteEvent(req: CreateOnsiteEventRequest): Observable<OnsiteEventDto> {
		return this.http.post<OnsiteEventDto>('/api/events/onsite', req);
	}

	updateOnlineEvent(id: number, req: CreateOnlineEventRequest): Observable<OnlineEventDto> {
		return this.http.put<OnlineEventDto>(`/api/events/online/${id}`, req);
	}

	updateOnsiteEvent(id: number, req: CreateOnsiteEventRequest): Observable<OnsiteEventDto> {
		return this.http.put<OnsiteEventDto>(`/api/events/onsite/${id}`, req);
	}

	deleteEvent(id: number): Observable<void> {
		return this.http.delete<void>(`/api/events/${id}`);
	}
}
