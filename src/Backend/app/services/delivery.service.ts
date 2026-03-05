import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest } from '../models/delivery.model';
import { environment } from '../../../Frontend/app/environments/environment';
import { buildApiUrl } from '../../../Frontend/app/shared/utils/url.helper';

/**
 * Delivery Service for Backend Admin
 * Handles all delivery-related API calls through API Gateway
 * All requests go through /api proxy to http://localhost:8085
 */
@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);

  /**
   * Get all deliveries
   * GET /api/deliveries/Alldelivery
   */
  getAllDeliveries(): Observable<Delivery[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', 'Alldelivery');
    console.log('[DeliveryService] GET', url);
    return this.http.get<Delivery[]>(url).pipe(
      tap(deliveries => {
        console.log(`[DeliveryService] ✅ Loaded ${deliveries.length} deliveries`);
        if (deliveries.length > 0) {
          console.log('[DeliveryService] Sample:', deliveries[0]);
        }
      }),
      catchError(error => {
        console.error('[DeliveryService] ❌ Error loading deliveries:', error);
        this.logErrorDetails('getAllDeliveries', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get delivery by ID
   * GET /api/deliveries/getDelivery/{id}
   */
  getDeliveryById(id: number): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', 'getDelivery', id.toString());
    console.log(`[DeliveryService] GET ${url}`);
    return this.http.get<Delivery>(url).pipe(
      tap(delivery => {
        console.log('[DeliveryService] ✅ Loaded delivery:', delivery);
      }),
      catchError(error => {
        console.error(`[DeliveryService] ❌ Error loading delivery ${id}:`, error);
        this.logErrorDetails('getDeliveryById', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new delivery
   * POST /api/deliveries/addDelivery
   */
  createDelivery(delivery: CreateDeliveryRequest): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', 'addDelivery');
    console.log('[DeliveryService] POST', url);
    console.log('[DeliveryService] Payload:', JSON.stringify(delivery));
    console.log('[DeliveryService] Payload.order:', delivery.order);
    console.log('[DeliveryService] Payload.order.idOrder:', delivery.order?.idOrder, `(type: ${typeof delivery.order?.idOrder})`);
    
    return this.http.post<Delivery>(
      url,
      delivery
    ).pipe(
      tap(response => {
        console.log('[DeliveryService] ✅ Delivery created:', response);
      }),
      catchError(error => {
        console.error('[DeliveryService] ❌ Error creating delivery:', error);
        this.logErrorDetails('createDelivery', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update existing delivery
   * PUT /api/deliveries/updateDelivery/{id}
   */
  updateDelivery(id: number, delivery: UpdateDeliveryRequest): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', 'updateDelivery', id.toString());
    console.log(`[DeliveryService] PUT ${url}`);
    console.log('[DeliveryService] Payload:', delivery);
    return this.http.put<Delivery>(
      url,
      delivery
    ).pipe(
      tap(response => {
        console.log('[DeliveryService] ✅ Delivery updated:', response);
      }),
      catchError(error => {
        console.error(`[DeliveryService] ❌ Error updating delivery ${id}:`, error);
        this.logErrorDetails('updateDelivery', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete delivery
   * DELETE /api/deliveries/deleteDelivery/{id}
   */
  deleteDelivery(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', 'deleteDelivery', id.toString());
    console.log(`[DeliveryService] DELETE ${url}`);
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log(`[DeliveryService] ✅ Delivery ${id} deleted`);
      }),
      catchError(error => {
        console.error(`[DeliveryService] ❌ Error deleting delivery ${id}:`, error);
        this.logErrorDetails('deleteDelivery', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Log detailed error information
   */
  private logErrorDetails(operation: string, error: any): void {
    console.error(`[DeliveryService] Operation: ${operation}`);
    console.error('[DeliveryService] Error details:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      error: error.error
    });

    console.error('[DeliveryService] ⚠️ Common causes:');
    
    if (error.status === 0) {
      console.error('  ❌ Connection Error (status 0):');
      console.error('    1. Proxy not active - Run: npm start (instead of ng serve)');
      console.error('    2. API Gateway not running on http://localhost:8085');
      console.error('    3. CORS issues');
    } else if (error.status === 400) {
      console.error('  ❌ Bad Request (400):');
      console.error('    Payload is invalid. Check console for payload details.');
      console.error('    Make sure order.idOrder is a number (not null/undefined)');
    } else if (error.status === 404) {
      console.error('  ❌ Endpoint not found (404)');
      console.error('    Check if /deliveries endpoints exist in API Gateway');
    } else if (error.status === 500) {
      console.error('  ❌ Server error (500)');
      console.error('    Backend error. Check API Gateway logs.');
      console.error('    Possible causes:');
      console.error('    - order.idOrder is null or not valid');
      console.error('    - Database constraints violated');
      console.error('    - Entity mapping issue on backend');
    }
  }

  /**
   * Get delivery by tracking number
   * GET /api/deliveries/track/{trackingNumber}
   */
  getDeliveryByTrackingNumber(trackingNumber: string): Observable<Delivery> {
    const url = buildApiUrl(environment.apiBaseUrl, 'deliveries', 'track', trackingNumber);
    console.log(`[DeliveryService] GET ${url}`);
    return this.http.get<Delivery>(url).pipe(
      tap(delivery => {
        console.log('[DeliveryService] ✅ Loaded delivery by tracking number:', delivery);
      }),
      catchError(error => {
        console.error(`[DeliveryService] ❌ Error loading delivery with tracking number ${trackingNumber}:`, error);
        this.logErrorDetails('getDeliveryByTrackingNumber', error);
        return throwError(() => error);
      })
    );
  }
}
