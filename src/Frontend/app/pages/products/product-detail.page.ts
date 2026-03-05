import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { signal, computed } from '@angular/core';

import { Product, ProductService } from '../../shared/product/product';
import { RecommendationService } from '../../core/recommendations/recommendation.service';
import { RecommendationProduct } from '../../core/recommendations/recommendation.model';

interface ProductDetail extends Product {
  idProduct: number;
}

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss'
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly recommendationService = inject(RecommendationService);

  readonly product = signal<ProductDetail | null>(null);
  readonly isLoadingProduct = signal(false);
  readonly productError = signal<string | null>(null);

  readonly similarProducts = signal<RecommendationProduct[]>([]);
  readonly isLoadingSimilar = signal(false);
  readonly similarError = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const productId = Number(params.get('productId'));
        if (productId) {
          this.loadProduct(productId);
          this.loadSimilarProducts(productId);
        } else {
          this.productError.set('Invalid product ID');
        }
      });
  }

  private loadProduct(productId: number): void {
    this.isLoadingProduct.set(true);
    this.productError.set(null);

    this.productService
      .getProductById(productId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (product) => {
          this.product.set({ ...product, idProduct: productId });
          this.isLoadingProduct.set(false);
        },
        error: (error) => {
          console.error('[ProductDetailPage] Error loading product:', error);
          if (error.status === 404) {
            this.productError.set('Product not found');
          } else {
            this.productError.set('Failed to load product. Please try again later.');
          }
          this.isLoadingProduct.set(false);
        }
      });
  }

  private loadSimilarProducts(productId: number): void {
    this.isLoadingSimilar.set(true);
    this.similarError.set(null);

    this.recommendationService
      .getRecommendationsForProduct(productId, 6)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (recommendations) => {
          this.similarProducts.set(recommendations);
          this.isLoadingSimilar.set(false);
        },
        error: (error) => {
          console.error('[ProductDetailPage] Error loading similar products:', error);
          if (error.status === 401 || error.status === 403) {
            this.similarError.set('Session expired. Please log in again.');
          } else {
            this.similarError.set('Failed to load similar products.');
          }
          this.isLoadingSimilar.set(false);
          this.similarProducts.set([]);
        }
      });
  }

  starsLabel(rating: number): string {
    const rounded = Math.round(rating * 10) / 10;
    return `${rounded} out of 5`;
  }

  viewSimilarProduct(productId: number): void {
    this.router.navigate(['/front/products', productId]);
  }

  trackSimilarId = (_: number, p: RecommendationProduct): number => p.id;

  goBack(): void {
    this.router.navigate(['/front/products']);
  }
}
