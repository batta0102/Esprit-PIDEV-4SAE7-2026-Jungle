import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  DeliveryTrackingResponse,
  UpdateLivreurLocationRequest
} from './delivery-tracking.model';

export interface UserProfileResponse {
  id: number;
  keycloakUserId: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'ETUDIANT' | 'ADMIN' | 'TUTEUR' | 'LIVREUR';
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | null;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryTrackingService {
  private readonly http = inject(HttpClient);
  private readonly gatewayBaseUrl = environment.gatewayUrl || 'http://localhost:8085';

  getCurrentUserProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.gatewayBaseUrl}/api/users/me/profile`);
  }

  getDeliveryTracking(deliveryId: number): Observable<DeliveryTrackingResponse> {
    return this.http.get<DeliveryTrackingResponse>(
      `${this.gatewayBaseUrl}/api/deliveries/${deliveryId}/tracking`
    );
  }

  updateLivreurLocation(
    livreurId: number,
    body: UpdateLivreurLocationRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.gatewayBaseUrl}/api/users/${livreurId}/location`,
      body
    );
  }

  syncDeliveryLocation(
    livreurId: number,
    body: UpdateLivreurLocationRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.gatewayBaseUrl}/api/deliveries/livreurs/${livreurId}/location`,
      body
    );
  }

  assignLivreurToDelivery(deliveryId: number, livreurId: number): Observable<void> {
    return this.http.put<void>(
      `${this.gatewayBaseUrl}/api/deliveries/${deliveryId}/assign-livreur`,
      { assignedUserId: livreurId }
    );
  }

  getMyDeliveriesTracking(): Observable<DeliveryTrackingResponse[]> {
    return this.http.get<DeliveryTrackingResponse[]>(`${this.gatewayBaseUrl}/api/deliveries/my/tracking`);
  }

  getAssignedDeliveriesTracking(livreurId: number): Observable<DeliveryTrackingResponse[]> {
    return this.http.get<DeliveryTrackingResponse[]>(
      `${this.gatewayBaseUrl}/api/deliveries/livreurs/${livreurId}/tracking`
    );
  }
}
