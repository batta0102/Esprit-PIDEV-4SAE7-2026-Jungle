import { Injectable, inject } from '@angular/core';
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
  image?: string;
  price?: number;
  stock: number;
}

/**
 * Product Service for Backend Admin
 * Handles all product-related API calls to API Gateway
 * Base URL: http://localhost:8085/products
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8085/products';


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
   * GET all products
   */
  getAllProducts(): Observable<Product[]> {
    console.log('[ProductService] GET /allProducts');
    return this.http.get<Product[]>(`${this.baseUrl}/allProducts`).pipe(
      tap(products => {
        console.log(`[ProductService] ✅ Loaded ${products.length} products`);
      }),
      catchError(error => {
        console.error('[ProductService] ❌ Error loading products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * GET single product by ID
   */
  getProductById(id: number): Observable<Product> {
    console.log(`[ProductService] GET /getProduct/${id}`);
    return this.http.get<Product>(`${this.baseUrl}/getProduct/${id}`).pipe(
      tap(product => console.log('[ProductService] ✅ Loaded product:', product)),
      catchError(error => {
        console.error(`[ProductService] ❌ Error loading product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * POST - Add new product
   * Note: Remove idProduct if present (new products don't have IDs)
   */
  addProduct(product: Product): Observable<Product> {
    const { idProduct, ...productData } = product;
    
    console.log('[ProductService] POST /addProduct', productData);
    return this.http.post<Product>(
      `${this.baseUrl}/addProduct`,
      productData,
      this.httpOptions
    ).pipe(
      tap(response => {
        console.log('[ProductService] ✅ Product added:', response);
      }),
      catchError(error => {
        console.error('[ProductService] ❌ Error adding product:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * PUT - Update existing product
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    console.log(`[ProductService] PUT /updateProduct/${id}`, product);
    return this.http.put<Product>(
      `${this.baseUrl}/updateProduct/${id}`,
      product,
      this.httpOptions
    ).pipe(
      tap(response => {
        console.log('[ProductService] ✅ Product updated:', response);
      }),
      catchError(error => {
        console.error(`[ProductService] ❌ Error updating product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * DELETE - Delete product by ID
   */
  deleteProduct(id: number): Observable<void> {
    console.log(`[ProductService] DELETE /deleteProduct/${id}`);
    return this.http.delete<void>(`${this.baseUrl}/deleteProduct/${id}`).pipe(
      tap(() => {
        console.log(`[ProductService] ✅ Product ${id} deleted`);
      }),
      catchError(error => {
        console.error(`[ProductService] ❌ Error deleting product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}

