import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../../shared/utils/url.helper';

export interface ResourceDto {
  resourceId: number;
  title: string;
  description: string;
  type: string;
  fileUrl: string | null;
  uploadDate: string | null;
}

/**
 * Resource Service
 * Handles all resource-related API calls via API Gateway
 * All requests go through /api proxy to http://localhost:8085
 */
@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly http = inject(HttpClient);

  /**
 * Get all resources
   * GET /api/resources/displayResources
   */
  listResources(): Observable<ResourceDto[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'resources', 'displayResources');
    console.log('[ResourceService] Fetching resources:', url);
    return this.http.get<ResourceDto[]>(url);
  }
}
