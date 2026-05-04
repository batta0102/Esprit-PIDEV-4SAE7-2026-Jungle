import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface LivreurDto {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  status: string | null;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly gatewayBaseUrl = environment.gatewayUrl || 'http://localhost:8085';

  getAllLivreurs(): Observable<LivreurDto[]> {
    return this.http.get<LivreurDto[]>(`${this.gatewayBaseUrl}/api/users/livreurs`);
  }

  getLivreurById(id: number): Observable<LivreurDto> {
    return this.http.get<LivreurDto>(`${this.gatewayBaseUrl}/api/users/livreurs/${id}`);
  }

  updateLivreurLocation(id: number, payload: { currentLat: number; currentLng: number }): Observable<LivreurDto> {
    return this.http.put<LivreurDto>(`${this.gatewayBaseUrl}/api/users/${id}/location`, payload);
  }
}
