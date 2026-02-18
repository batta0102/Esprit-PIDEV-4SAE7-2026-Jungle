import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Product Interface
 * Represents a product from the API Gateway
 */
export interface Product {
  idProduct?: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  price?: number;
  stock: number;
}

/**
 * API Log Entry - Tracks each HTTP request/response
 */
export interface ApiLog {
  id: string;
  timestamp: Date;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  status: 'pending' | 'success' | 'error';
  requestData?: any;
  responseData?: any;
  error?: string;
  duration: number;
}

/**
 * Product Service for Backend Admin
 * Handles all product-related API calls to API Gateway
 * 
 * URL Strategy:
 * - Development: Use direct http://localhost:8085/products (bypasses proxy)
 * - Production: Configure dynamically based on environment
 * 
 * API Gateway location: port 8085
 * NOT port 4300 (that's the Angular backend admin sever)
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  // ✅ CORRECT: Point to API Gateway port 8085, NOT 4300 (Angular server)
  private baseUrl = 'http://localhost:8085/products';
  
  // Signal to track API logs in real-time
  apiLogs = signal<ApiLog[]>([]);

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
   * Log API request
   */
  private logRequest(method: string, url: string, data?: any): string {
    const logId = `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const logEntry: ApiLog = {
      id: logId,
      timestamp: new Date(),
      method: method as any,
      url: url,
      status: 'pending',
      requestData: data,
      duration: 0
    };
    
    const logs = this.apiLogs();
    this.apiLogs.set([logEntry, ...logs]);
    
    console.log(`\n📤 [HTTP ${method}] ${url}`);
    if (data) {
      console.log('📦 Request Payload:', data);
    }
    
    return logId;
  }

  /**
   * Log API response
   */
  private logResponse(logId: string, responseData: any, duration: number): void {
    const logs = this.apiLogs();
    const index = logs.findIndex(l => l.id === logId);
    
    if (index !== -1) {
      logs[index].status = 'success';
      logs[index].responseData = responseData;
      logs[index].duration = duration;
      this.apiLogs.set([...logs]);
    }
    
    console.log(`✅ Response received (${duration}ms):`, responseData);
  }

  /**
   * Log API error
   */
  private logError(logId: string, error: any, duration: number): void {
    const logs = this.apiLogs();
    const index = logs.findIndex(l => l.id === logId);
    
    if (index !== -1) {
      logs[index].status = 'error';
      logs[index].error = `${error.status} ${error.statusText}`;
      logs[index].duration = duration;
      this.apiLogs.set([...logs]);
    }
    
    console.log(`❌ Error (${duration}ms):`, error);
  }

  /**
   * Get all products
   * @returns Observable<Product[]>
   */
  getAllProducts(): Observable<Product[]> {
    const startTime = performance.now();
    const logId = this.logRequest('GET', `${this.baseUrl}/allProducts`);
    
    return this.http.get<Product[]>(`${this.baseUrl}/allProducts`).pipe(
      tap(products => {
        const duration = Math.round(performance.now() - startTime);
        this.logResponse(logId, { count: products.length, items: products }, duration);
        console.log(`[ProductService] Loaded ${products.length} products`);
        console.log('[ProductService] First product:', products[0]);
        console.log('[ProductService] Product keys:', products[0] ? Object.keys(products[0]) : 'No products');
      }),
      catchError(error => {
        const duration = Math.round(performance.now() - startTime);
        this.logError(logId, error, duration);
        console.error('[ProductService] Error loading products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single product by ID
   * @param id - Product ID
   * @returns Observable<Product>
   */
  getProductById(id: number): Observable<Product> {
    const startTime = performance.now();
    const logId = this.logRequest('GET', `${this.baseUrl}/getProduct/${id}`);
    
    return this.http.get<Product>(`${this.baseUrl}/getProduct/${id}`).pipe(
      tap(product => {
        const duration = Math.round(performance.now() - startTime);
        this.logResponse(logId, product, duration);
        console.log('[ProductService] Loaded product:', product);
      }),
      catchError(error => {
        const duration = Math.round(performance.now() - startTime);
        this.logError(logId, error, duration);
        console.error(`[ProductService] Error loading product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add a new product
   * @param product - Product data (idProduct will be removed if present)
   * @returns Observable<Product>
   */
  addProduct(product: Product): Observable<Product> {
    // Remove idProduct for new products to avoid issues
    const { idProduct, ...productData } = product;
    
    const startTime = performance.now();
    const logId = this.logRequest('POST', `${this.baseUrl}/addProduct`, productData);
    
    return this.http.post<Product>(
      `${this.baseUrl}/addProduct`,
      productData,
      this.httpOptions
    ).pipe(
      tap(response => {
        const duration = Math.round(performance.now() - startTime);
        this.logResponse(logId, response, duration);
        console.log('[ProductService] Product added successfully:', response);
      }),
      catchError(error => {
        const duration = Math.round(performance.now() - startTime);
        this.logError(logId, error, duration);
        console.error('[ProductService] Error adding product:', error);
        console.error('[ProductService] Error details:', {
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
   * Update an existing product
   * @param id - Product ID
   * @param product - Updated product data
   * @returns Observable<Product>
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    const startTime = performance.now();
    const logId = this.logRequest('PUT', `${this.baseUrl}/updateProduct/${id}`, product);
    
    return this.http.put<Product>(
      `${this.baseUrl}/updateProduct/${id}`,
      product,
      this.httpOptions
    ).pipe(
      tap(response => {
        const duration = Math.round(performance.now() - startTime);
        this.logResponse(logId, response, duration);
        console.log('[ProductService] Product updated successfully:', response);
      }),
      catchError(error => {
        const duration = Math.round(performance.now() - startTime);
        this.logError(logId, error, duration);
        console.error(`[ProductService] Error updating product ${id}:`, error);
        console.error('[ProductService] Error details:', {
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
   * Delete a product
   * @param id - Product ID
   * @returns Observable<void>
   */
  deleteProduct(id: number): Observable<void> {
    const startTime = performance.now();
    const logId = this.logRequest('DELETE', `${this.baseUrl}/deleteProduct/${id}`);
    
    return this.http.delete<void>(`${this.baseUrl}/deleteProduct/${id}`).pipe(
      tap(() => {
        const duration = Math.round(performance.now() - startTime);
        this.logResponse(logId, { message: `Product ${id} deleted successfully` }, duration);
        console.log(`[ProductService] Product ${id} deleted successfully`);
      }),
      catchError(error => {
        const duration = Math.round(performance.now() - startTime);
        this.logError(logId, error, duration);
        console.error(`[ProductService] Error deleting product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
