import { NgOptimizedImage, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Product, ProductService } from '../../shared/product/product';
import { DeliveryDto, DeliveryService } from '../../core/services/delivery.service';
import { RecommendationService } from '../../core/recommendations/recommendation.service';
import { RecommendationProduct } from '../../core/recommendations/recommendation.model';
import { CartService } from '../../shared/cart/cart.service';

type SortMode = 'Most Popular' | 'Newest' | 'Price: Low to High' | 'Price: High to Low' | 'Top Rated';

interface ProductDisplay {
  id: string;
  productId: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  rating: number;
  reviews: number;
}

type DeliveryLookup = DeliveryDto & {
  deliveryStatus?: string;
  deliveryDate?: string;
};

@Component({
  selector: 'app-products-page',
  imports: [FormsModule, NgOptimizedImage, RouterModule, CommonModule],
  templateUrl: './products.page.html',
  styleUrl: './products.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsPage {
  private readonly productService = inject(ProductService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly recommendationService = inject(RecommendationService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  
  readonly products = signal<ProductDisplay[]>([]);
  readonly recommendations = signal<RecommendationProduct[]>([]);
  readonly isLoadingRecommendations = signal(false);
  readonly recommendationsError = signal<string | null>(null);
    
  

  
  readonly orderSuccessMessage = signal('');

  readonly query = signal('');
  readonly trackingQuery = signal('');
  readonly deliveryResult = signal<DeliveryLookup | null>(null);
  readonly sortMode = signal<SortMode>('Most Popular');
  readonly page = signal(1);
  readonly pageSize = 6;

  readonly filteredProducts = computed(() => {
    const q = this.query().trim().toLowerCase();

    const items = this.products().filter((p) => {
      if (q && !`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const sorted = [...items].sort((a, b) => {
      const mode = this.sortMode();
      if (mode === 'Price: Low to High') return a.price - b.price;
      if (mode === 'Price: High to Low') return b.price - a.price;
      if (mode === 'Top Rated') return b.rating - a.rating;
      if (mode === 'Newest') return b.productId - a.productId;
      return b.reviews - a.reviews;
    });

    return sorted;
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize)));

  readonly pagedProducts = computed(() => {
    const page = Math.min(Math.max(1, this.page()), this.pageCount());
    const start = (page - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  readonly paginationInfo = computed(() => {
    const total = this.filteredProducts().length;
    const page = this.page();
    const pageSize = this.pageSize;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    
    return {
      start,
      end,
      total,
      currentPage: page,
      totalPages: this.pageCount()
    };
  });

  readonly sorts: SortMode[] = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

  constructor() {
    this.productService
      .getAllProducts()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (items) => this.products.set(items.map((item) => this.mapProduct(item))),
        error: (err) => {
          console.error('[ProductsPage] Error loading products:', err);
          this.products.set([]);
        }
      });

    this.loadRecommendations();
  }

  private loadRecommendations(): void {
    this.isLoadingRecommendations.set(true);
    this.recommendationsError.set(null);
    
    this.recommendationService
      .getTop3MostOrderedProducts()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (recommendations) => {
          this.recommendations.set(recommendations);
          this.isLoadingRecommendations.set(false);
        },
        error: (error) => {
          console.error('[ProductsPage] Error loading recommendations:', error);
          this.recommendationsError.set('Failed to load top products. Please try again later.');
          this.isLoadingRecommendations.set(false);
          this.recommendations.set([]);
        }
      });
  }


  searchDelivery(): void {
    const trackingNumber = this.trackingQuery().trim();
    console.log('Searching for tracking number:', trackingNumber);
    if (!trackingNumber) return;

    this.deliveryService.getDeliveryByTrackingNumber(trackingNumber).subscribe({
      next: (delivery) => {
        console.log('Delivery found:', delivery);
        this.deliveryResult.set(delivery);
      },
      error: (err) => {
  if (err.status === 404) {
    console.warn('Delivery not found');
    this.deliveryResult.set(null);
  } else {
    console.error('Unexpected error:', err);
  }
}

    });
    
  }

  setPage(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.pageCount()));
  }

  prevPage(): void {
    this.setPage(this.page() - 1);
  }

  nextPage(): void {
    this.setPage(this.page() + 1);
  }

  trackProductId = (_: number, p: ProductDisplay): string => p.id;

  /**
   * Get the correct image URL for a product
   * Handles:
   * - Absolute URLs (http/https)
   * - Relative URLs (proxy/API paths)
   * - Placeholders
   */
  getImageUrl(imageUrl: string | null | undefined): string {
    return this.productService.resolveImageUrl(imageUrl);
  }

  starsLabel(rating: number): string {
    const rounded = Math.round(rating * 10) / 10;
    return `${rounded} out of 5`;
  }

  primaryActionLabel(p: ProductDisplay): string {
    if (p.stock === 0) return 'Out of Stock';
    return 'Add to Cart';
  }

  secondaryActionLabel(): string {
    return 'View Details';
  }

  shouldShowPage(pageNum: number, totalPages: number): boolean {
    const current = this.page();
    // Always show first and last page
    if (pageNum === 1 || pageNum === totalPages) return true;
    // Show current page and 2 pages around it
    if (Math.abs(pageNum - current) <= 1) return true;
    return false;
  }

  shouldShowEllipsis(pageNum: number, totalPages: number): boolean {
    const current = this.page();
    // Show ellipsis after page 1 if page 3 is hidden
    if (pageNum === 2 && !this.shouldShowPage(3, totalPages) && this.shouldShowPage(1, totalPages)) {
      return true;
    }
    // Show ellipsis before last page if page before is hidden
    if (pageNum === totalPages - 1 && !this.shouldShowPage(totalPages - 2, totalPages) && this.shouldShowPage(totalPages, totalPages)) {
      return true;
    }
    return false;
  }

  addToCart(prod: ProductDisplay): void {
    const product: Product = {
      idProduct: prod.productId,
      name: prod.name,
      category: prod.category,
      description: prod.description,
      imageUrl: prod.imageUrl,
      price: prod.price,
      stock: prod.stock
    };
    this.cartService.addToCart(product);
    this.orderSuccessMessage.set(`${prod.name} added to cart.`);
    setTimeout(() => {
      this.orderSuccessMessage.set('');
    }, 3000);
  }

  goToCart(): void {
    this.router.navigate(['/front/cart']);
  }

  recommendationStarsLabel(rating: number): string {
    const rounded = Math.round(rating * 10) / 10;
    return `${rounded} out of 5`;
  }

  trackRecommendationId = (_: number, r: RecommendationProduct): number => r.id;

  private mapProduct(item: Product): ProductDisplay {
    return {
      id: `prod-${item.idProduct}`,
      productId: item.idProduct || 0,
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price || 0,
      stock: item.stock || 0,
      imageUrl: item.imageUrl || '/englishimg2.png',
      rating: 4.5,
      reviews: 0
    };
  }
}
