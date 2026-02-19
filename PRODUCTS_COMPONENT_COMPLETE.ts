import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * ============================================
 * PRODUCT INTERFACE
 * ============================================
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
 * ============================================
 * PRODUCT SERVICE
 * ============================================
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8085/products';

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

/**
 * ============================================
 * PRODUCTS MANAGEMENT COMPONENT
 * ============================================
 * 
 * Full CRUD component for managing products
 * - Display all products in a table
 * - Add new product form
 * - Edit existing product form
 * - Delete product with confirmation
 * - Full HTTP integration with Spring Boot backend
 */
@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: require('./products-management.component.html'),
  styleUrl: './products-management.component.scss'
})
export class ProductsManagementComponent implements OnInit {
  private productService = inject(ProductService);

  // ============ STATE MANAGEMENT (Signals) ============
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Form state
  showForm = signal(false);
  isEditMode = signal(false);
  
  // Current product being edited or created
  currentProduct = signal<Product>({
    name: '',
    category: 'Book',
    description: '',
    image: '',
    price: 0,
    stock: 0
  });

  // ============ LIFECYCLE ============
  ngOnInit(): void {
    this.loadProducts();
  }

  // ============ LOAD PRODUCTS (GET) ============
  /**
   * Load all products from API
   */
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        console.log('[ProductsManagement] Loaded products:', data);
        
        // Transform data if backend returns 'id' instead of 'idProduct'
        const transformedData = data.map(p => {
          const anyP = p as any;
          if (anyP.id && !p.idProduct) {
            return { ...p, idProduct: anyP.id };
          }
          return p;
        });
        
        this.products.set(transformedData);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ProductsManagement] Error loading products:', err);
        this.error.set('Failed to load products. Check if API Gateway is running on port 8085.');
        this.loading.set(false);
      }
    });
  }

  // ============ FORM MANAGEMENT ============
  /**
   * Open form for adding new product
   */
  openAddForm(): void {
    this.isEditMode.set(false);
    this.currentProduct.set({
      name: '',
      category: 'Book',
      description: '',
      image: '',
      price: 0,
      stock: 0
    });
    this.showForm.set(true);
  }

  /**
   * Open form for editing existing product
   */
  openEditForm(product: Product): void {
    this.isEditMode.set(true);
    this.currentProduct.set({ ...product });
    this.showForm.set(true);
  }

  /**
   * Close form and reset state
   */
  closeForm(): void {
    this.showForm.set(false);
    this.isEditMode.set(false);
    this.currentProduct.set({
      name: '',
      category: 'Book',
      description: '',
      image: '',
      price: 0,
      stock: 0
    });
  }

  /**
   * Update form field value
   */
  updateField(field: keyof Product, value: any): void {
    this.currentProduct.update(p => ({
      ...p,
      [field]: value
    }));
  }

  // ============ SAVE PRODUCT (ADD or UPDATE) ============
  /**
   * Save product - calls either addProduct or updateProduct
   */
  saveProduct(): void {
    const product = this.currentProduct();

    // Validate required fields
    if (!product.name.trim() || !product.category || !product.description.trim()) {
      this.error.set('Please fill in all required fields: Name, Category, Description');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    if (this.isEditMode() && product.idProduct) {
      // UPDATE existing product
      console.log('[ProductsManagement] Updating product:', product);
      this.productService.updateProduct(product.idProduct, product).subscribe({
        next: () => {
          console.log('[ProductsManagement] ✅ Product updated successfully');
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => {
          console.error('[ProductsManagement] ❌ Error updating product:', err);
          this.error.set(`Failed to update product: ${err.message}`);
          this.loading.set(false);
        }
      });
    } else {
      // ADD new product
      console.log('[ProductsManagement] Adding new product:', product);
      this.productService.addProduct(product).subscribe({
        next: () => {
          console.log('[ProductsManagement] ✅ Product added successfully');
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => {
          console.error('[ProductsManagement] ❌ Error adding product:', err);
          this.error.set(`Failed to add product: ${err.message}`);
          this.loading.set(false);
        }
      });
    }
  }

  // ============ DELETE PRODUCT (DELETE) ============
  /**
   * Delete product with confirmation
   */
  deleteProduct(product: Product): void {
    if (!product.idProduct) {
      this.error.set('Cannot delete product without ID');
      return;
    }

    // Confirmation dialog
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    console.log('[ProductsManagement] Deleting product:', product.idProduct);
    this.productService.deleteProduct(product.idProduct).subscribe({
      next: () => {
        console.log('[ProductsManagement] ✅ Product deleted successfully');
        this.loadProducts();
      },
      error: (err) => {
        console.error('[ProductsManagement] ❌ Error deleting product:', err);
        this.error.set(`Failed to delete product: ${err.message}`);
        this.loading.set(false);
      }
    });
  }

  // ============ TRACKBY FUNCTION ============
  /**
   * TrackBy function for ngFor optimization
   * Prevents NG0955 duplicate keys error
   * Uses idProduct as unique identifier, falls back to index
   */
  trackByIdProduct(index: number, product: Product): number | undefined {
    return product.idProduct || index;
  }
}
