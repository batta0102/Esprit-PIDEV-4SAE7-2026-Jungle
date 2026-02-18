import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../shared/product/product';

interface DisplayProduct extends Product {
  id?: number;
  title?: string;
  image?: string;
  rating?: number;
}

/**
 * Products Page Component
 * Displays products from API Gateway in grid layout
 * Standalone component with signals for reactive state management
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.page.html',
  styleUrl: './products.page.scss'
})
export class ProductsPage implements OnInit {
  private productService = inject(ProductService);

  // State signals
  filteredProducts = signal<DisplayProduct[]>([]);
  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);

  categories = ['All', 'Book'];

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load all products from API Gateway
   */
  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.transformAndDisplayProducts(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error.set('Failed to load products. Using sample data.');
        this.loadSampleProducts();
        this.loading.set(false);
      }
    });
  }

  /**
   * Transform API products to display format
   */
  private transformAndDisplayProducts(products: Product[]): void {
    const transformed: DisplayProduct[] = products.map((p, index) => ({
      ...p,
      id: p.idProduct || index + 1,
      title: p.name,
      image: p.imageUrl || 'https://via.placeholder.com/300x200?text=Book',
      rating: 4.5 + Math.random() * 0.5 // Random rating between 4.5-5
    }));
    this.applyFilters(transformed);
  }

  /**
   * Load sample products if API fails
   */
  private loadSampleProducts(): void {
    const sampleProducts: DisplayProduct[] = [
      {
        idProduct: 1,
        name: 'English Grammar Essentials',
        title: 'English Grammar Essentials',
        category: 'Book',
        description: 'Master the fundamentals of English grammar with interactive lessons.',
        price: 29.99,
        image: 'https://via.placeholder.com/300x200?text=Grammar',
        stock: 50,
        rating: 4.8
      },
      {
        idProduct: 2,
        name: 'Conversational English',
        title: 'Conversational English',
        category: 'Book',
        description: 'Improve your speaking skills and confidence in everyday conversations.',
        price: 39.99,
        image: 'https://via.placeholder.com/300x200?text=Conversation',
        stock: 30,
        rating: 4.6
      },
      {
        idProduct: 3,
        name: 'IELTS Preparation',
        title: 'IELTS Preparation',
        category: 'Book',
        description: 'Complete guide to prepare for IELTS exam successfully.',
        price: 49.99,
        image: 'https://via.placeholder.com/300x200?text=IELTS',
        stock: 20,
        rating: 4.9
      },
      {
        idProduct: 4,
        name: 'Business English',
        title: 'Business English',
        category: 'Book',
        description: 'Professional English for business communication and presentations.',
        price: 44.99,
        image: 'https://via.placeholder.com/300x200?text=Business',
        stock: 25,
        rating: 4.7
      },
      {
        idProduct: 5,
        name: 'Vocabulary Builder',
        title: 'Vocabulary Builder',
        category: 'Book',
        description: 'Expand your vocabulary with 5000+ common and advanced words.',
        price: 19.99,
        image: 'https://via.placeholder.com/300x200?text=Vocabulary',
        stock: 60,
        rating: 4.5
      },
      {
        idProduct: 6,
        name: 'Pronunciation Mastery',
        title: 'Pronunciation Mastery',
        category: 'Book',
        description: 'Perfect your pronunciation and accent with expert guidance.',
        price: 34.99,
        image: 'https://via.placeholder.com/300x200?text=Pronunciation',
        stock: 40,
        rating: 4.8
      }
    ];
    this.filteredProducts.set(sampleProducts);
  }

  /**
   * Filter products by category
   */
  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    this.applyFilters(this.filteredProducts());
  }

  /**
   * Handle search input
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters(this.filteredProducts());
  }

  /**
   * Apply filters and search to products
   */
  private applyFilters(products: DisplayProduct[]): void {
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase();

    const filtered = products.filter(product => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesQuery = (product.title?.toLowerCase().includes(query) || false) ||
                          (product.description?.toLowerCase().includes(query) || false);
      return matchesCategory && matchesQuery;
    });

    this.filteredProducts.set(filtered);
  }

  /**
   * Generate star array for rating display
   */
  getStarArray(rating: number): number[] {
    return Array.from({ length: Math.floor(rating) }, (_, i) => i + 1);
  }

  /**
   * Retry loading products
   */
  retryLoadProducts(): void {
    this.loadProducts();
  }
}
