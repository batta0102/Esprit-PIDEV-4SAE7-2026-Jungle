import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { DeliveryTrackingResponse } from '../delivery-tracking/delivery-tracking.model';

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
}

export interface DeliveryDto {
  id: number;
  status: string;
  deliveryAddress: string;
  trackingNumber: string;
  assignedAt: string | null;
  assignedUserId: number | null;
  assignedUser: UserDto | null;
  customerUserId: string | null;
}

export interface AssignDeliveryRequestDto {
  assignedUserId: number;
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly http = inject(HttpClient);
  private readonly gatewayBaseUrl = environment.gatewayUrl || 'http://localhost:8085';

  getAllDeliveries(): Observable<DeliveryDto[]> {
    return this.http.get<DeliveryDto[]>(`${this.gatewayBaseUrl}/api/deliveries`);
  }

  getDeliveryById(id: number): Observable<DeliveryDto> {
    return this.http.get<DeliveryDto>(`${this.gatewayBaseUrl}/api/deliveries/${id}`);
  }

  assignLivreurToDelivery(deliveryId: number, assignedUserId: number): Observable<DeliveryDto> {
    return this.http.put<DeliveryDto>(
      `${this.gatewayBaseUrl}/api/deliveries/${deliveryId}/assign-livreur`,
      { assignedUserId } as AssignDeliveryRequestDto
    );
  }

  getTrackingByDeliveryId(deliveryId: number): Observable<DeliveryTrackingResponse> {
    return this.http.get<DeliveryTrackingResponse>(`${this.gatewayBaseUrl}/api/deliveries/${deliveryId}/tracking`);
  }

  getDeliveryByTrackingNumber(trackingNumber: string): Observable<DeliveryDto> {
    return this.http.get<DeliveryDto>(`${this.gatewayBaseUrl}/api/deliveries/track/${trackingNumber}`);
  }
}
