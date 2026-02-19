import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
 */
export interface Order {
  idOrder?: number;
  product?: OrderProduct;
  totalAmount: number;
  status: string;
  orderDate?: string | Date;
  paymentMethod: string;
}

/**
 * Order Service for Backend Admin
 * Handles all order-related API calls to API Gateway
 * Base URL: http://localhost:8085/orders
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8085/orders';

  /**
   * HTTP Headers for JSON requests
   */
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  /**
   * Get all orders
   * @returns Observable<Order[]>
   */
  getAllOrders(): Observable<Order[]> {
    console.log('[OrderService] Fetching all orders...');
    return this.http.get<Order[]>(`${this.baseUrl}/allOrders`).pipe(
      tap(orders => {
        console.log(`[OrderService] Loaded ${orders.length} orders`);
        console.log('[OrderService] First order:', orders[0]);
      }),
      catchError(error => {
        console.error('[OrderService] Error loading orders:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single order by ID
   * @param id - Order ID
   * @returns Observable<Order>
   */
  getOrderById(id: number): Observable<Order> {
    console.log(`[OrderService] Fetching order with ID: ${id}`);
    return this.http.get<Order>(`${this.baseUrl}/getOrder/${id}`).pipe(
      tap(order => console.log('[OrderService] Loaded order:', order)),
      catchError(error => {
        console.error(`[OrderService] Error loading order ${id}:`, error);
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
    
    console.log('[OrderService] Adding new order:', orderData);
    console.log('[OrderService] Request URL:', `${this.baseUrl}/addOrder`);
    
    return this.http.post<Order>(
      `${this.baseUrl}/addOrder`,
      orderData,
      this.httpOptions
    ).pipe(
      tap(response => {
        console.log('[OrderService] Order added successfully:', response);
      }),
      catchError(error => {
        console.error('[OrderService] Error adding order:', error);
        console.error('[OrderService] Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing order
   * @param id - Order ID
   * @param order - Updated order data
   * @returns Observable<Order>
   */
  updateOrder(id: number, order: Order): Observable<Order> {
    console.log(`[OrderService] Updating order ${id}:`, order);
    
    return this.http.put<Order>(
      `${this.baseUrl}/updateOrder/${id}`,
      order,
      this.httpOptions
    ).pipe(
      tap(response => {
        console.log('[OrderService] Order updated successfully:', response);
      }),
      catchError(error => {
        console.error('[OrderService] Error updating order:', error);
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
    console.log(`[OrderService] Deleting order with ID: ${id}`);
    const deleteUrl = `${this.baseUrl}/deleteOrder/${id}`;
    console.log(`[OrderService] DELETE URL: ${deleteUrl}`);
    
    // For DELETE requests, we need minimal headers to avoid CORS issues
    const deleteOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json, text/plain, */*'
      })
    };
    
    return this.http.delete<any>(deleteUrl, deleteOptions).pipe(
      tap((response: any) => {
        console.log(`[OrderService] Order ${id} deleted successfully`);
        console.log('[OrderService] Delete response:', response);
      }),
      catchError((error: any) => {
        console.error(`[OrderService] Error deleting order ${id}:`, error);
        console.error('[OrderService] Error status:', error.status);
        console.error('[OrderService] Error URL:', error.url);
        console.error('[OrderService] Error statusText:', error.statusText);
        console.error('[OrderService] Error response body:', error.error);
        return throwError(() => error);
      })
    );
  }
}
