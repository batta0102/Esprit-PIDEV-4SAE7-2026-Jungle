import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../utils/url.helper';

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
 * Product Service
 * Handles all product-related API calls to API Gateway via proxy
 * Proxy configuration: /api -> http://localhost:8085/api
 * All requests use environment.apiBaseUrl (/api) to avoid CORS
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  /**
   * Get all products
   * GET /api/products/allProducts
   * @returns Observable<Product[]>
   */
  getAllProducts(): Observable<Product[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
    console.log('[ProductService] Fetching all products:', url);
    return this.http.get<Product[]>(url).pipe(
      tap(products => {
        console.log(`[ProductService] Loaded ${products.length} products`);
        console.log('[ProductService] First product:', products[0]);
        console.log('[ProductService] Product keys:', products[0] ? Object.keys(products[0]) : 'No products');
      }),
      catchError(error => {
        console.error('[ProductService] Error loading products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single product by ID
   * GET /api/products/getProduct/{id}
   * @param id - Product ID
   * @returns Observable<Product>
   */
  getProductById(id: number): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', `getProduct/${id}`);
    console.log(`[ProductService] Fetching product with ID ${id}:`, url);
    return this.http.get<Product>(url).pipe(
      tap(product => console.log('[ProductService] Loaded product:', product)),
      catchError(error => {
        console.error(`[ProductService] Error loading product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add a new product
   * POST /api/products/addProduct
   * @param product - Product data (idProduct will be removed if present)
   * @returns Observable<Product>
   */
  addProduct(product: Product): Observable<Product> {
    // Remove idProduct for new products to avoid issues
    const { idProduct, ...productData } = product;
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'addProduct');
    
    console.log('[ProductService] Adding new product:', productData);
    console.log('[ProductService] Request URL:', url);
    
    return this.http.post<Product>(url, productData).pipe(
      tap(response => {
        console.log('[ProductService] Product added successfully:', response);
      }),
      catchError(error => {
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
   * PUT /api/products/updateProduct/{id}
   * @param id - Product ID
   * @param product - Updated product data
   * @returns Observable<Product>
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', `updateProduct/${id}`);
    console.log(`[ProductService] Updating product ${id}:`, url);
    
    return this.http.put<Product>(url, product).pipe(
      tap(response => {
        console.log('[ProductService] Product updated successfully:', response);
      }),
      catchError(error => {
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
   * DELETE /api/products/deleteProduct/{id}
   * @param id - Product ID
   * @returns Observable<void>
   */
  deleteProduct(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', `deleteProduct/${id}`);
    console.log(`[ProductService] Deleting product ${id}:`, url);
    
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log(`[ProductService] Product ${id} deleted successfully`);
      }),
      catchError(error => {
        console.error(`[ProductService] Error deleting product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
