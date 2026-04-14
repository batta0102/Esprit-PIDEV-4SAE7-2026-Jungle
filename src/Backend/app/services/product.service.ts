import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../Frontend/app/environments/environment';
import { buildApiUrl } from '../../../Frontend/app/shared/utils/url.helper';

export interface Product {
  idProduct?: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  price?: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);

  getAllProducts(): Observable<Product[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
    console.log(`[ProductService] GET ${url}`);

    return this.http.get<Product[]>(url).pipe(
      map((products) => products.map((product) => this.normalizeProduct(product))),
      tap((products) => console.log(`[ProductService] Loaded ${products.length} products`)),
      catchError((error) => {
        console.error('[ProductService] Error loading products:', error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'getProduct', id.toString());
    console.log(`[ProductService] GET ${url}`);

    return this.http.get<Product>(url).pipe(
      map((product) => this.normalizeProduct(product)),
      tap((product) => console.log('[ProductService] Loaded product:', product)),
      catchError((error) => {
        console.error(`[ProductService] Error loading product ${id}:`, error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  addProduct(product: Product): Observable<Product> {
    return this.addProductWithFile(product);
  }

  addProductWithFile(product: Product, imageFile?: File): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'addProduct');
    const formData = this.buildProductFormData(product, imageFile);

    console.log('[ProductService] POST multipart', url, {
      hasImage: !!imageFile,
      imageName: imageFile?.name
    });

    return this.http.post<Product>(url, formData).pipe(
      map((response) => this.normalizeProduct(response)),
      tap((response) => console.log('[ProductService] Product added:', response)),
      catchError((error) => {
        console.error('[ProductService] Error adding product:', error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.updateProductWithFile(id, product);
  }

  updateProductWithFile(id: number, product: Product, imageFile?: File): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'updateProduct', id.toString());
    const formData = this.buildProductFormData(product, imageFile);

    console.log('[ProductService] PUT multipart', url, {
      hasImage: !!imageFile,
      imageName: imageFile?.name
    });

    return this.http.put<Product>(url, formData).pipe(
      map((response) => this.normalizeProduct(response)),
      tap((response) => console.log('[ProductService] Product updated:', response)),
      catchError((error) => {
        console.error(`[ProductService] Error updating product ${id}:`, error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'deleteProduct', id.toString());
    console.log(`[ProductService] DELETE ${url}`);

    return this.http.delete<void>(url).pipe(
      tap(() => console.log(`[ProductService] Product ${id} deleted`)),
      catchError((error) => {
        console.error(`[ProductService] Error deleting product ${id}:`, error);
        this.logErrorDetails(error);
        return throwError(() => error);
      })
    );
  }

  resolveImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return '/englishimg2.png';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/uploads/')) {
      return `${environment.resourcesBaseUrl}${imageUrl}`;
    }

    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    return `${environment.resourcesBaseUrl}/uploads/products/${imageUrl}`;
  }

  private normalizeProduct(product: Product): Product {
    const raw = product as unknown as Record<string, unknown>;
    const idProduct = product.idProduct ?? (raw['id'] as number | undefined);

    return {
      ...product,
      idProduct,
      imageUrl: this.normalizeImagePath(product.imageUrl)
    };
  }

  private normalizeImagePath(imageUrl: string | null | undefined): string | undefined {
    if (!imageUrl) {
      return undefined;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/uploads/')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    return `/uploads/products/${imageUrl}`;
  }

  private buildProductFormData(product: Product, imageFile?: File): FormData {
    const { idProduct, imageUrl, ...payload } = product;

    const formData = new FormData();
    formData.append(
      'product',
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );

    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }

    return formData;
  }

  private logErrorDetails(error: any): void {
    if (error.status === 0) {
      console.error('[ProductService] Network or proxy error');
      return;
    }

    if (error.status === 400) {
      console.error('[ProductService] 400 Bad Request:', error.error);
      return;
    }

    if (error.status === 415) {
      console.error('[ProductService] 415 Unsupported Media Type. Ensure multipart/form-data is used.');
      return;
    }

    if (error.status === 500) {
      console.error('[ProductService] 500 Server Error:', error.error);
    }
  }
}

