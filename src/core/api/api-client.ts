import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        httpParams = httpParams.set(k, String(v));
      });
    }
    const url = path.startsWith('http') ? path : `${this.base}/${path.replace(/^\//, '')}`;
    return this.http.get<T>(url, { params: httpParams.keys().length ? httpParams : undefined });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.base}/${path.replace(/^\//, '')}`;
    return this.http.post<T>(url, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.base}/${path.replace(/^\//, '')}`;
    return this.http.put<T>(url, body);
  }

  delete<T>(path: string): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.base}/${path.replace(/^\//, '')}`;
    return this.http.delete<T>(url);
  }
}
