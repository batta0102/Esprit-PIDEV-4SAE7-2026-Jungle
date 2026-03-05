import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../Frontend/app/environments/environment';
import { buildApiUrl } from '../../../Frontend/app/shared/utils/url.helper';

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
 * Product Service for Backend Admin
 * Handles all product-related API calls through API Gateway
 * All requests route to: http://localhost:8085
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  /**
   * GET all products
   * GET /api/products/allProducts
   */
  getAllProducts(): Observable<Product[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
    console.log(`[ProductService] 🔄 GET ${url}`);
    
    return this.http.get<Product[]>(url).pipe(
      tap(products => {
        console.log(`[ProductService] ✅ Loaded ${products.length} products`);
        console.log('[ProductService] Products sample:', products.slice(0, 2));
      }),
      catchError(error => {
        console.error('[ProductService] ❌ Error loading products:', error);
        console.error('[ProductService] Status:', error.status);
        console.error('[ProductService] Status Text:', error.statusText);
        console.error('[ProductService] Error Message:', error.message);
        console.error('[ProductService] Full Error:', error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * GET single product by ID
   * GET /api/products/getProduct/{id}
   */
  getProductById(id: number): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'getProduct', id.toString());
    console.log(`[ProductService] GET ${url}`);
    return this.http.get<Product>(url).pipe(
      tap(product => console.log('[ProductService] ✅ Loaded product:', product)),
      catchError(error => {
        console.error(`[ProductService] ❌ Error loading product ${id}:`, error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * POST - Add new product
   * Note: Remove idProduct if present (new products don't have IDs)
   * POST /api/products/addProduct
   */
  addProduct(product: Product): Observable<Product> {
    const { idProduct, ...productData } = product;
    
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'addProduct');
    console.log('[ProductService] POST', url, productData);
    return this.http.post<Product>(
      url,
      productData
    ).pipe(
      tap(response => {
        console.log('[ProductService] ✅ Product added:', response);
      }),
      catchError(error => {
        console.error('[ProductService] ❌ Error adding product:', error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * POST - Add new product with image file (multipart/form-data)
   * Spring Boot backend expects:
   * @RequestPart("product") Product product
   * @RequestPart("image") MultipartFile image
   */
  addProductWithFile(product: Product, imageFile: File): Observable<Product> {
    const { idProduct, ...productData } = product;
    
    const formData = new FormData();
    
    // Append product as JSON string in "product" part
    // Spring Boot @RequestPart("product") will deserialize this JSON
    formData.append(
      'product',
      new Blob([JSON.stringify(productData)], { type: 'application/json' })
    );
    
    // Append the image file in "image" part
    // Spring Boot @RequestPart("image") will bind this to MultipartFile
    formData.append('image', imageFile, imageFile.name);
    
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'addProduct');
    console.log('[ProductService] POST', url, '(multipart with @RequestPart):', {
      productData,
      fileName: imageFile.name,
      fileSize: imageFile.size
    });
    
    // Don't set Content-Type header - let browser set it with boundary
    // This is CRITICAL for Spring Boot @RequestPart to work correctly
    return this.http.post<Product>(
      url,
      formData
    ).pipe(
      tap(response => {
        console.log('[ProductService] ✅ Product added with image:', response);
      }),
      catchError(error => {
        console.error('[ProductService] ❌ Error adding product with file:', error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Error logging helper
   * Provides detailed diagnostic info for CORS, network, and API errors
   */
  private logErrorDetails(error: any): void {
    if (error.status === 0) {
      console.error('[ProductService] ⚠️ CORS/Network Error (Status 0)');
      console.error('  Possible causes:');
      console.error('    1. API Gateway not running on http://localhost:8085');
      console.error('    2. CORS preflight (OPTIONS) request failed');
      console.error('    3. Incorrect endpoint path');
      console.error('    4. Network connectivity issue');
      console.error('    5. Proxy not enabled - use: npm start (not ng serve directly)');
    } else if (error.status === 404) {
      console.error('[ProductService] 404 Not Found - Check endpoint path');
      console.error('  URL attempted:', error.url);
    } else if (error.status === 400) {
      console.error('[ProductService] 400 Bad Request - Check payload format');
      console.error('  Response:', error.error);
    } else if (error.status === 415) {
      console.error('[ProductService] 415 Unsupported Media Type - Check Content-Type');
      console.error('  Ensure Content-Type is application/json');
    } else if (error.status === 500) {
      console.error('[ProductService] 500 Server Error');
      console.error('  Response:', error.error);
    } else {
      console.error(`[ProductService] HTTP ${error.status} Error:`, error);
    }
  }

  /**
   * PUT - Update existing product
   * PUT /api/products/updateProduct/{id}
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'updateProduct', id.toString());
    console.log(`[ProductService] PUT ${url}`, product);
    return this.http.put<Product>(
      url,
      product
    ).pipe(
      tap(response => {
        console.log('[ProductService] ✅ Product updated:', response);
      }),
      catchError(error => {
        console.error(`[ProductService] ❌ Error updating product ${id}:`, error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * PUT - Update existing product with image file (multipart/form-data)
   * Spring Boot backend expects:
   * @RequestPart("product") Product product
   * @RequestPart("image") MultipartFile image
   */
  updateProductWithFile(id: number, product: Product, imageFile: File): Observable<Product> {
    const { idProduct, ...productData } = product;
    
    const formData = new FormData();
    
    // Append product as JSON string in "product" part
    // Spring Boot @RequestPart("product") will deserialize this JSON
    formData.append(
      'product',
      new Blob([JSON.stringify(productData)], { type: 'application/json' })
    );
    
    // Append the image file in "image" part
    // Spring Boot @RequestPart("image") will bind this to MultipartFile
    formData.append('image', imageFile, imageFile.name);
    
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'updateProduct', id.toString());
    console.log(`[ProductService] PUT ${url} (multipart with @RequestPart):`, {
      productData,
      fileName: imageFile.name,
      fileSize: imageFile.size
    });
    
    // Don't set Content-Type header - let browser set it with boundary
    // This is CRITICAL for Spring Boot @RequestPart to work correctly
    return this.http.put<Product>(
      url,
      formData
    ).pipe(
      tap(response => {
        console.log('[ProductService] ✅ Product updated with image:', response);
      }),
      catchError(error => {
        console.error(`[ProductService] ❌ Error updating product ${id} with file:`, error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * DELETE - Delete product by ID
   * DELETE /api/products/deleteProduct/{id}
   */
  deleteProduct(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'deleteProduct', id.toString());
    console.log(`[ProductService] DELETE ${url}`);
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log(`[ProductService] ✅ Product ${id} deleted`);
      }),
      catchError(error => {
        console.error(`[ProductService] ❌ Error deleting product ${id}:`, error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }
}

