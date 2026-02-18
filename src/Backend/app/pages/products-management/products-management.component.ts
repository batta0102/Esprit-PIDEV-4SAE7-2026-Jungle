import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

/**
 * Products Management Component
 * Full CRUD interface for managing products
 * Backend Admin Area
 */
@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-management.component.html',
  styleUrl: './products-management.component.scss'
})
export class ProductsManagementComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  showForm = signal(false);
  editMode = signal(false);
  showLogs = signal(true);  // Show HTTP logs by default
  
  currentProduct = signal<Product>({
    name: '',
    category: '',
    description: '',
    imageUrl: '',
    price: 0,
    stock: 0
  });

  // Expose API logs from service
  apiLogs = this.productService.apiLogs;
  
  // Computed: Last 10 logs
  recentLogs = computed(() => this.apiLogs().slice(0, 10));

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load all products from API
   */
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    console.log('\n========================================');
    console.log('📋 [ProductsManagement] Starting loadProducts()');
    console.log('========================================');

    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        console.log('[ProductsManagement] Raw data from service:', data);
        console.log('[ProductsManagement] First product structure:', data[0]);
        
        // Transform if backend returns 'id' or 'product_id' instead of 'idProduct'
        const transformedData = data.map(p => {
          const anyP = p as any;
          if (anyP.id && !p.idProduct) {
            return { ...p, idProduct: anyP.id };
          }
          if (anyP.product_id && !p.idProduct) {
            return { ...p, idProduct: anyP.product_id };
          }
          return p;
        });
        
        console.log('[ProductsManagement] Transformed data:', transformedData);
        this.products.set(transformedData);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.error.set('Failed to load products');
        this.loading.set(false);
      }
    });
  }

  /**
   * Open form to add new product
   */
  openAddForm(): void {
    this.editMode.set(false);
    this.currentProduct.set({
      name: '',
      category: 'Book',
      description: '',
      imageUrl: '',
      price: 0,
      stock: 0
    });
    this.showForm.set(true);
  }

  /**
   * Open form to edit existing product
   */
  openEditForm(product: Product): void {
    this.editMode.set(true);
    this.currentProduct.set({ ...product });
    this.showForm.set(true);
  }

  /**
   * Close the form
   */
  closeForm(): void {
    this.showForm.set(false);
    this.currentProduct.set({
      name: '',
      category: '',
      description: '',
      imageUrl: '',
      price: 0,
      stock: 0
    });
  }

  /**
   * Save product (create or update)
   */
  saveProduct(): void {
    const product = this.currentProduct();

    if (!product.name || !product.category || !product.description) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading.set(true);

    if (this.editMode() && product.idProduct) {
      // Update existing product
      console.log('\n========================================');
      console.log(`🔄 [ProductsManagement] Updating product ID: ${product.idProduct}`);
      console.log('========================================');
      
      this.productService.updateProduct(product.idProduct, product).subscribe({
        next: () => {
          console.log('✅ [ProductsManagement] Update succeeded, reloading products...');
          this.loadProducts();
          this.closeForm();
        },
        error: (err: any) => {
          console.error('❌ [ProductsManagement] Error updating product:', err);
          alert('Failed to update product');
          this.loading.set(false);
        }
      });
    } else {
      // Create new product
      console.log('\n========================================');
      console.log('➕ [ProductsManagement] Creating new product');
      console.log('========================================');
      
      this.productService.addProduct(product).subscribe({
        next: () => {
          console.log('✅ [ProductsManagement] Create succeeded, reloading products...');
          this.loadProducts();
          this.closeForm();
        },
        error: (err: any) => {
          console.error('❌ [ProductsManagement] Error adding product:', err);
          alert('Failed to add product');
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * Delete a product
   */
  deleteProduct(id: number | undefined): void {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.loading.set(true);

    console.log('\n========================================');
    console.log(`🗑️  [ProductsManagement] Deleting product ID: ${id}`);
    console.log('========================================');

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        console.log('✅ [ProductsManagement] Delete succeeded, reloading products...');
        this.loadProducts();
      },
      error: (err: any) => {
        console.error('❌ [ProductsManagement] Error deleting product:', err);
        alert('Failed to delete product');
        this.loading.set(false);
      }
    });
  }

  /**
   * Update current product field
   */
  updateField(field: keyof Product, value: any): void {
    this.currentProduct.update(p => ({ ...p, [field]: value }));
  }

  /**
   * TrackBy function for ngFor optimization
   * Prevents unnecessary re-renders and NG0955 errors
   */
  trackByIdProduct(index: number, product: Product): number {
    return product.idProduct || index;
  }
}
