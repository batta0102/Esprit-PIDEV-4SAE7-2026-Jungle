import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { AdminPageShellComponent, AdminStat } from '../../shared/admin-page-shell/admin-page-shell.component';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageShellComponent],
  templateUrl: './products-management.component.html',
  styleUrl: './products-management.component.scss'
})
export class ProductsManagementComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedTab = signal('all');
  searchTerm = signal('');
  stockFilter = signal('All Stock');
  sortFilter = signal('Sort: Name A → Z');

  showForm = signal(false);
  isEditMode = signal(false);

  currentProduct = signal<Product>({
    name: '',
    category: 'Book',
    description: '',
    imageUrl: '',
    price: 0,
    stock: 0
  });

  // File upload handling
  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);

  // Form validation signals
  nameError = signal<string | null>(null);
  categoryError = signal<string | null>(null);
  descriptionError = signal<string | null>(null);
  stockError = signal<string | null>(null);
  priceError = signal<string | null>(null);

  isFormValid = computed(() => {
    const product = this.currentProduct();
    return (
      product.name?.trim()?.length > 0 &&
      product.category?.trim()?.length > 0 &&
      product.description?.trim()?.length > 0 &&
      (product.stock !== undefined && product.stock !== null && product.stock >= 0) &&
      (product.price === undefined || product.price === null || product.price >= 0)
    );
  });

  readonly tabs = [
    { label: 'All', value: 'all' },
    { label: 'Book', value: 'book' },
    { label: 'Course', value: 'course' },
    { label: 'Study Material', value: 'study material' }
  ];

  readonly filters = computed(() => [
    {
      label: 'Stock',
      options: ['All Stock', 'In Stock', 'Low Stock'],
      value: this.stockFilter()
    },
    {
      label: 'Sort',
      options: ['Sort: Name A → Z', 'Sort: Name Z → A', 'Sort: Price ↑', 'Sort: Price ↓'],
      value: this.sortFilter()
    }
  ]);

  readonly displayedProducts = computed(() => {
    let items = [...this.products()];
    const tab = this.selectedTab();
    const search = this.searchTerm().trim().toLowerCase();
    const stock = this.stockFilter();
    const sort = this.sortFilter();

    if (tab !== 'all') {
      items = items.filter((product) => (product.category || '').toLowerCase() === tab);
    }

    if (search) {
      items = items.filter((product) =>
        `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search)
      );
    }

    if (stock === 'In Stock') {
      items = items.filter((product) => (product.stock || 0) > 0);
    }

    if (stock === 'Low Stock') {
      items = items.filter((product) => (product.stock || 0) > 0 && (product.stock || 0) < 10);
    }

    if (sort === 'Sort: Name A → Z') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'Sort: Name Z → A') {
      items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'Sort: Price ↑') {
      items.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'Sort: Price ↓') {
      items.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return items;
  });

  readonly stats = computed<AdminStat[]>(() => {
    const items = this.products();
    const total = items.length;
    const books = items.filter((product) => product.category?.toLowerCase() === 'book').length;
    const courses = items.filter((product) => product.category?.toLowerCase() === 'course').length;
    const inStock = items.filter((product) => (product.stock || 0) > 0).length;
    const lowStock = items.filter((product) => (product.stock || 0) > 0 && (product.stock || 0) < 10).length;

    return [
      { label: 'Total Products', value: total },
      { label: 'Books', value: books, accent: 'green' },
      { label: 'Courses', value: courses, accent: 'blue' },
      { label: 'In Stock', value: inStock, accent: 'green' },
      { label: 'Low Stock', value: lowStock, accent: 'orange' }
    ];
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    console.log('[ProductsManagement] 🔄 Loading products...');
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAllProducts().subscribe({
      next: (data: Product[]) => {
        console.log(`[ProductsManagement] ✅ Loaded ${data.length} products`);
        console.log('[ProductsManagement] Raw data sample:', data[0]);

        this.products.set(data);
        this.loading.set(false);
        console.log('[ProductsManagement] ✅ Products ready for display');
      },
      error: (err) => {
        console.error('[ProductsManagement] ❌ Error loading products:', err);
        console.error('[ProductsManagement] Error status:', err.status);
        console.error('[ProductsManagement] Error message:', err.message);
        
        let errorMsg = 'Failed to load products.';
        if (err.status === 0) {
          errorMsg += ' Cannot connect to API Gateway on localhost:8085. Check if it is running.';
        } else if (err.status === 404) {
          errorMsg += ' Endpoint not found (404). Check the API Gateway endpoints.';
        } else if (err.status === 500) {
          errorMsg += ' API Gateway error (500). Check server logs.';
        } else if (err.message) {
          errorMsg += ` Error: ${err.message}`;
        }
        
        this.error.set(errorMsg);
        this.loading.set(false);
      }
    });
  }

  openAddForm(): void {
    this.isEditMode.set(false);
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

  openEditForm(product: Product): void {
    this.isEditMode.set(true);
    this.currentProduct.set({ ...product });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.currentProduct.set({
      name: '',
      category: 'Book',
      description: '',
      imageUrl: '',
      price: 0,
      stock: 0
    });
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
  }

  saveProduct(): void {
    // Validate form before saving
    if (!this.validateForm()) {
      this.error.set('Please fix all validation errors before saving.');
      return;
    }

    const product = this.currentProduct();

    this.loading.set(true);
    this.error.set(null);

    if (this.isEditMode() && product.idProduct) {
      const file = this.selectedFile();

      this.productService.updateProductWithFile(product.idProduct, product, file ?? undefined).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => {
          this.error.set(`Failed to update product: ${err.message ?? err}`);
          this.loading.set(false);
          console.error('[ProductsManagement] Error updating product:', err);
        }
      });
      return;
    }

    // For add mode, check if there's a file
    const newProduct: Product = { ...product };
    delete (newProduct as Partial<Product>).idProduct;

    const file = this.selectedFile();

    this.productService.addProductWithFile(newProduct, file ?? undefined).subscribe({
      next: () => {
        this.loadProducts();
        this.closeForm();
      },
      error: (err) => {
        this.error.set(`Failed to add product: ${err.message ?? err}`);
        this.loading.set(false);
        console.error('[ProductsManagement] Error adding product:', err);
      }
    });
  }

  deleteProduct(product: Product): void {
    if (!product.idProduct) {
      return;
    }

    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.productService.deleteProduct(product.idProduct).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (err) => {
        this.error.set(`Failed to delete product: ${err.message ?? err}`);
        this.loading.set(false);
        console.error('[ProductsManagement] Error deleting product:', err);
      }
    });
  }

  updateField(field: keyof Product, value: Product[keyof Product]): void {
    this.currentProduct.update((product) => ({ ...product, [field]: value }));
    // Clear error when user starts editing
    this.validateField(field as string);
  }

  /**
   * Validate individual field
   */
  validateField(field: string): void {
    const product = this.currentProduct();
    
    switch (field) {
      case 'name':
        if (!product.name?.trim()) {
          this.nameError.set('Product name is required');
        } else if (product.name.trim().length < 2) {
          this.nameError.set('Product name must be at least 2 characters');
        } else if (product.name.trim().length > 100) {
          this.nameError.set('Product name must not exceed 100 characters');
        } else {
          this.nameError.set(null);
        }
        break;

      case 'category':
        if (!product.category?.trim()) {
          this.categoryError.set('Category is required');
        } else {
          this.categoryError.set(null);
        }
        break;

      case 'description':
        if (!product.description?.trim()) {
          this.descriptionError.set('Description is required');
        } else if (product.description.trim().length < 10) {
          this.descriptionError.set('Description must be at least 10 characters');
        } else if (product.description.trim().length > 1000) {
          this.descriptionError.set('Description must not exceed 1000 characters');
        } else {
          this.descriptionError.set(null);
        }
        break;

      case 'stock':
        if (product.stock === undefined || product.stock === null) {
          this.stockError.set('Stock quantity is required');
        } else if (product.stock < 0) {
          this.stockError.set('Stock cannot be negative');
        } else if (!Number.isInteger(product.stock)) {
          this.stockError.set('Stock must be a whole number');
        } else {
          this.stockError.set(null);
        }
        break;

      case 'price':
        if (product.price !== undefined && product.price !== null) {
          if (product.price < 0) {
            this.priceError.set('Price cannot be negative');
          } else if (product.price > 999999.99) {
            this.priceError.set('Price is too high');
          } else {
            this.priceError.set(null);
          }
        }
        break;
    }
  }

  /**
   * Validate all fields and return true if form is valid
   */
  validateForm(): boolean {
    const product = this.currentProduct();
    let isValid = true;

    // Validate name
    if (!product.name?.trim()) {
      this.nameError.set('Product name is required');
      isValid = false;
    } else if (product.name.trim().length < 2) {
      this.nameError.set('Product name must be at least 2 characters');
      isValid = false;
    } else if (product.name.trim().length > 100) {
      this.nameError.set('Product name must not exceed 100 characters');
      isValid = false;
    } else {
      this.nameError.set(null);
    }

    // Validate category
    if (!product.category?.trim()) {
      this.categoryError.set('Category is required');
      isValid = false;
    } else {
      this.categoryError.set(null);
    }

    // Validate description
    if (!product.description?.trim()) {
      this.descriptionError.set('Description is required');
      isValid = false;
    } else if (product.description.trim().length < 10) {
      this.descriptionError.set('Description must be at least 10 characters');
      isValid = false;
    } else if (product.description.trim().length > 1000) {
      this.descriptionError.set('Description must not exceed 1000 characters');
      isValid = false;
    } else {
      this.descriptionError.set(null);
    }

    // Validate stock
    if (product.stock === undefined || product.stock === null) {
      this.stockError.set('Stock quantity is required');
      isValid = false;
    } else if (product.stock < 0) {
      this.stockError.set('Stock cannot be negative');
      isValid = false;
    } else if (!Number.isInteger(product.stock)) {
      this.stockError.set('Stock must be a whole number');
      isValid = false;
    } else {
      this.stockError.set(null);
    }

    // Validate price
    if (product.price !== undefined && product.price !== null) {
      if (product.price < 0) {
        this.priceError.set('Price cannot be negative');
        isValid = false;
      } else if (product.price > 999999.99) {
        this.priceError.set('Price is too high');
        isValid = false;
      } else {
        this.priceError.set(null);
      }
    }

    return isValid;
  }

  /**
   * Handle file selection from input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error.set('Please select a valid image file.');
        this.selectedFile.set(null);
        this.imagePreviewUrl.set(null);
        return;
      }

      this.selectedFile.set(file);
      this.error.set(null);

      // Generate preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.imagePreviewUrl.set(url);
      };
      reader.readAsDataURL(file);
    }
  }

  trackByIdProduct(index: number, product: Product): number {
    return product.idProduct ?? index;
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    return this.productService.resolveImageUrl(imageUrl);
  }

  onTabChange(tab: string): void {
    this.selectedTab.set(tab);
  }

  onSearchChange(search: string): void {
    this.searchTerm.set(search);
  }

  onFilterChange(change: { label: string; value: string }): void {
    if (change.label === 'Stock') {
      this.stockFilter.set(change.value);
    }

    if (change.label === 'Sort') {
      this.sortFilter.set(change.value);
    }
  }

  checkProductOrders(product: Product): void {
    if (!product.idProduct) {
      console.error('[ProductsManagement] ❌ Product ID is missing - cannot navigate to orders');
      return;
    }

    console.log(`[ProductsManagement] 🔗 Navigating to orders for product: ${product.name} (ID: ${product.idProduct})`);
    // Navigate to orders page with product ID as query parameter
    this.router.navigate(['/back/orders-management'], {
      queryParams: { productId: product.idProduct }
    });
  }
}