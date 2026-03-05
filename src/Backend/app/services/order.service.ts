import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../Frontend/app/environments/environment';
import { buildApiUrl } from '../../../Frontend/app/shared/utils/url.helper';

/**
 * Product Reference Interface
 * Represents a product reference in Order
 */
export interface OrderProduct {
  idProduct?: number;
  name?: string;
  price?: number;
}

/**
 * Order Interface
 * Represents an order from the API Gateway
 * Maps to backend Spring Boot Order entity with attributes:
 * - idOrder: Long
 * - totalAmount: Double
 * - status: String
 * - orderDate: LocalDateTime
 * - paymentMethod: String
 * - product: Product (contains idProduct)
 * - address: String (delivery address)
 *  - productName: String (optional, direct product name from API)
 */
export interface Order {
  idOrder?: number;
  product?: OrderProduct;
  totalAmount: number;
  status: string;
  orderDate?: string | Date;
  paymentMethod: string;
  address?: string;
  productName?: string;
}

/**
 * Order Service for Backend Admin
 * Handles all order-related API calls through API Gateway
 * Routes all requests to: http://localhost:8085
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  /**
   * Get all orders
   * GET /api/orders/allOrders
   */
  getAllOrders(): Observable<Order[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'orders', 'allOrders');
    console.log('[OrderService] GET', url);
    return this.http.get<Order[]>(url).pipe(
      tap(orders => {
        console.log(`[OrderService] ✅ Loaded ${orders.length} orders`);
      }),
      catchError(error => {
        console.error('[OrderService] ❌ Error loading orders:', error);
        this.logErrorDetails('getAllOrders', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single order by ID
   * GET /api/orders/getOrder/{id}
   */
  getOrderById(id: number): Observable<Order> {
    const url = buildApiUrl(environment.apiBaseUrl, 'orders', 'getOrder', id.toString());
    console.log(`[OrderService] GET ${url}`);
    return this.http.get<Order>(url).pipe(
      tap(order => console.log('[OrderService] ✅ Loaded order:', order)),
      catchError(error => {
        console.error(`[OrderService] ❌ Error loading order ${id}:`, error);
        this.logErrorDetails(`getOrder(${id})`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add a new order
   * @param order - Order data (idOrder will be removed if present)
   * @returns Observable<Order>
   */
  addOrder(order: Order): Observable<Order> {
    // Remove idOrder for new orders to avoid issues
    const { idOrder, ...orderData } = order;
    
    const url = buildApiUrl(environment.apiBaseUrl, 'orders', 'addOrder');
    console.log('[OrderService] POST', url, orderData);
    
    return this.http.post<Order>(
      url,
      orderData
    ).pipe(
      tap(response => {
        console.log('[OrderService] ✅ Order added successfully:', response);
      }),
      catchError(error => {
        console.error('[OrderService] ❌ Error adding order:', error);
        this.logErrorDetails('addOrder', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Error logging helper
   * Provides detailed diagnostic info for CORS, network, and API errors
   */
  private logErrorDetails(method: string, error: any): void {
    console.group(`[OrderService] Error Details for ${method}()`);
    
    if (error.status === 0) {
      console.error('⚠️ CORS/Network Error (Status 0)');
      console.error('Possible causes:');
      console.error('  1. API Gateway not running on http://localhost:8085');
      console.error('  2. CORS preflight (OPTIONS) request failed');
      console.error('  3. Incorrect endpoint path (/api/orders/...)');
      console.error('  4. Network connectivity issue');
      console.error('  5. Proxy not enabled - use: npm start (not ng serve directly)');
    } else if (error.status === 404) {
      console.error('404 Not Found - Check endpoint path');
      console.error('URL attempted:', error.url);
    } else if (error.status === 400) {
      console.error('400 Bad Request - Check payload format');
      console.error('Response:', error.error);
    } else if (error.status === 415) {
      console.error('415 Unsupported Media Type - Check Content-Type');
      console.error('Ensure Content-Type is application/json');
    } else if (error.status === 500) {
      console.error('500 Server Error - Backend issue');
      console.error('Response:', error.error);
    } else {
      console.error(`HTTP ${error.status} Error`);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('Response:', error.error);
    }
    
    console.groupEnd();
  }

  /**
   * Update an existing order
   * @param id - Order ID
   * @param order - Updated order data
   * @returns Observable<Order>
   */
  updateOrder(id: number, order: Order): Observable<Order> {
    const url = buildApiUrl(environment.apiBaseUrl, 'orders', 'updateOrder', id.toString());
    console.log(`[OrderService] PUT ${url}`, order);
    
    return this.http.put<Order>(
      url,
      order
    ).pipe(
      tap(response => {
        console.log('[OrderService] ✅ Order updated successfully:', response);
      }),
      catchError(error => {
        console.error('[OrderService] ❌ Error updating order:', error);
        this.logErrorDetails(`updateOrder(${id})`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an order by ID
   * @param id - Order ID
   * @returns Observable<any>
   */
  deleteOrder(id: number): Observable<any> {
    const url = buildApiUrl(environment.apiBaseUrl, 'orders', 'deleteOrder', id.toString());
    console.log(`[OrderService] DELETE ${url}`);
    
    return this.http.delete<any>(url).pipe(
      tap((response: any) => {
        console.log(`[OrderService] ✅ Order ${id} deleted successfully`);
      }),
      catchError((error: any) => {
        console.error(`[OrderService] ❌ Error deleting order ${id}:`, error);
        this.logErrorDetails(`deleteOrder(${id})`, error);
        return throwError(() => error);
      })
    );
  }
}
