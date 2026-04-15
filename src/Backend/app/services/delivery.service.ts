import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest } from '../models/delivery.model';
import { environment } from '../../../Frontend/app/environments/environment';
import { buildApiUrl } from '../../../Frontend/app/shared/utils/url.helper';

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

export interface DeliveryResponseDto {
  id: number;
  status: string;
  deliveryAddress: string;
  trackingNumber: string;
  assignedAt: string | null;
  assignedUserId: number | null;
  assignedUser: UserDto | null;
  customerUserId?: string | null;
}

export interface AssignDeliveryRequestDto {
  assignedUserId: number;
}

export interface DeliveryTrackingDto {
  deliveryId: number;
  deliveryStatus: string;
  assignedUserId: number | null;
  livreurName: string | null;
  livreurPhone: string | null;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
  destinationLat: number | null;
  destinationLng: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly http = inject(HttpClient);

  getAllDeliveries(): Observable<Delivery[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries');
    return this.http.get<DeliveryResponseDto[]>(url).pipe(
      map((items) => items.map((item) => this.toDelivery(item)))
    );
  }

  getDeliveryById(id: number): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', id.toString());
    return this.http.get<DeliveryResponseDto>(url).pipe(map((item) => this.toDelivery(item)));
  }

  createDelivery(delivery: CreateDeliveryRequest): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries');
    return this.http.post<DeliveryResponseDto>(url, delivery).pipe(map((item) => this.toDelivery(item)));
  }

  updateDelivery(id: number, delivery: UpdateDeliveryRequest): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', id.toString());
    return this.http.put<DeliveryResponseDto>(url, delivery).pipe(map((item) => this.toDelivery(item)));
  }

  deleteDelivery(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', id.toString());
    return this.http.delete<void>(url);
  }

  assignLivreurToDelivery(deliveryId: number, livreurId: number): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', deliveryId.toString(), 'assign-livreur');
    const payload: AssignDeliveryRequestDto = { assignedUserId: livreurId };
    return this.http.put<DeliveryResponseDto>(url, payload).pipe(map((item) => this.toDelivery(item)));
  }

  getTracking(deliveryId: number): Observable<DeliveryTrackingDto> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', deliveryId.toString(), 'tracking');
    return this.http.get<DeliveryTrackingDto>(url);
  }

  getDeliveryByTrackingNumber(trackingNumber: string): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', 'track', trackingNumber);
    return this.http.get<DeliveryResponseDto>(url).pipe(map((item) => this.toDelivery(item)));
  }

  private toDelivery(dto: DeliveryResponseDto): Delivery {
    return {
      idDelivery: dto.id,
      deliveryStatus: dto.status,
      deliveryAddress: dto.deliveryAddress,
      trackingNumber: dto.trackingNumber,
      assignedAt: dto.assignedAt,
      assignedUserId: dto.assignedUserId,
      livreurId: dto.assignedUserId,
      assignedUser: dto.assignedUser,
      userId: dto.customerUserId ?? undefined
    };
  }
}
