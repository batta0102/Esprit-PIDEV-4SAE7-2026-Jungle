import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Frontend/app/environments/environment';

export type UserRole = 'ETUDIANT' | 'ADMIN' | 'TUTEUR' | 'LIVREUR';

export type UserStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface CreateLivreurRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address?: string | null;
  status: UserStatus;
}

export interface UpdateLivreurRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  role?: UserRole;
  status?: UserStatus;
}

export interface LivreurUser {
  id: number;
  keycloakUserId?: string;
  fullName: string;
  email: string;
  phone: string | null;
  address?: string | null;
  role?: UserRole;
  status: string | null;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly gatewayBaseUrl = environment.gatewayUrl || 'http://localhost:8085';
  private readonly usersBaseUrl = `${this.gatewayBaseUrl}/api/users`;

  createLivreur(payload: CreateLivreurRequest): Observable<LivreurUser> {
    return this.http.post<LivreurUser>(`${this.usersBaseUrl}/livreurs/add`, {
      ...payload,
      role: 'LIVREUR'
    });
  }

  getAllLivreurs(): Observable<LivreurUser[]> {
    return this.http.get<LivreurUser[]>(`${this.usersBaseUrl}/livreurs`);
  }

  getLivreurById(id: number): Observable<LivreurUser> {
    return this.http.get<LivreurUser>(`${this.usersBaseUrl}/livreurs/${id}`);
  }

  updateLivreur(id: number, payload: UpdateLivreurRequest): Observable<LivreurUser> {
    return this.http.put<LivreurUser>(`${this.usersBaseUrl}/update/${id}`, {
      ...payload,
      role: 'LIVREUR'
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersBaseUrl}/delete/${id}`);
  }

  updateLivreurLocation(id: number, payload: { currentLat: number; currentLng: number }): Observable<LivreurUser> {
    return this.http.put<LivreurUser>(`${this.usersBaseUrl}/${id}/location`, payload);
  }
}
