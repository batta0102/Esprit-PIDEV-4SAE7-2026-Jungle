import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Resource, ResourceResponse } from '../models/resource.model';
import { environment } from '../../../Frontend/app/environments/environment';
import { buildApiUrl } from '../../../Frontend/app/shared/utils/url.helper';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private http = inject(HttpClient);

  /**
   * Get all resources
   * GET /api/resources/displayResources
   */
  getAll(): Observable<ResourceResponse[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'resources', 'displayResources');
    return this.http.get<ResourceResponse[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a single resource by ID
   * GET /api/resources/getResource/{id}
   */
  getById(id: number): Observable<ResourceResponse> {
    const url = buildApiUrl(environment.apiBaseUrl, 'resources', 'getResource', id.toString());
    return this.http.get<ResourceResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new resource
   * POST /api/resources/addResource
   */
  create(resource: Resource): Observable<ResourceResponse> {
    const url = buildApiUrl(environment.apiBaseUrl, 'resources', 'addResource');
    return this.http.post<ResourceResponse>(url, resource).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing resource
   * PUT /api/resources/updateResource/{id}
   */
  update(id: number, resource: Resource): Observable<ResourceResponse> {
    const url = buildApiUrl(environment.apiBaseUrl, 'resources', 'updateResource', id.toString());
    return this.http.put<ResourceResponse>(url, resource).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a resource
   * DELETE /api/resources/deleteResource/{id}
   */
  delete(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'resources', 'deleteResource', id.toString());
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
