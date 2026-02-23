import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VenueDto {
	id: number;
	name: string;
	address: string;
	city?: string | null;
	country?: string | null;
	postalCode?: string | null;
	capacity?: number | null;
}

export interface CreateVenueRequest {
	name: string;
	address: string;
	city?: string;
	country?: string;
	postalCode?: string;
	capacity?: number | null;
}

@Injectable({ providedIn: 'root' })
export class VenueAdminApiService {
	private readonly http = inject(HttpClient);

	listVenues(): Observable<VenueDto[]> {
		return this.http.get<VenueDto[]>('/api/venues');
	}

	createVenue(req: CreateVenueRequest): Observable<VenueDto> {
		return this.http.post<VenueDto>('/api/venues', req);
	}

	updateVenue(id: number, req: CreateVenueRequest): Observable<VenueDto> {
		return this.http.put<VenueDto>(`/api/venues/${id}`, req);
	}

	deleteVenue(id: number): Observable<void> {
		return this.http.delete<void>(`/api/venues/${id}`);
	}
}
