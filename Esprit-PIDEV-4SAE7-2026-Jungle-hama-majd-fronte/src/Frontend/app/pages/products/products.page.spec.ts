import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Router } from '@angular/router';

import { ProductsPage } from './products.page';
import { ProductService } from '../../shared/product/product';
import { DeliveryService } from '../../core/services/delivery.service';
import { RecommendationService } from '../../core/recommendations/recommendation.service';
import { CartService } from '../../shared/cart/cart.service';

describe('ProductsPage', () => {
  let fixture: ComponentFixture<ProductsPage>;
  let component: ProductsPage;

  let productMock: { getAllProducts: ReturnType<typeof vi.fn>; resolveImageUrl: ReturnType<typeof vi.fn> };
  let deliveryMock: { getDeliveryByTrackingNumber: ReturnType<typeof vi.fn> };
  let recommendationMock: { getTop3MostOrderedProducts: ReturnType<typeof vi.fn> };
  let cartMock: { addToCart: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.useFakeTimers();

    productMock = {
      getAllProducts: vi.fn().mockReturnValue(
        of([
          {
            idProduct: 1,
            name: 'Book',
            category: 'Books',
            description: 'Desc',
            imageUrl: '/uploads/products/a.png',
            price: 30,
            stock: 5
          }
        ])
      ),
      resolveImageUrl: vi.fn().mockReturnValue('/img.png')
    };

    deliveryMock = {
      getDeliveryByTrackingNumber: vi.fn().mockReturnValue(of({ id: 10, trackingNumber: 'TRK' }))
    };

    recommendationMock = {
      getTop3MostOrderedProducts: vi.fn().mockReturnValue(of([{ id: 1, title: 'Top1', category: 'Books', ordersCount: 10 }]))
    };

    cartMock = {
      addToCart: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    };

    TestBed.overrideComponent(ProductsPage, {
      set: { template: '<div></div>' }
    });

    await TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [
        { provide: ProductService, useValue: productMock },
        { provide: DeliveryService, useValue: deliveryMock },
        { provide: RecommendationService, useValue: recommendationMock },
        { provide: CartService, useValue: cartMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products and recommendations on init', () => {
    expect(productMock.getAllProducts).toHaveBeenCalled();
    expect(recommendationMock.getTop3MostOrderedProducts).toHaveBeenCalled();
    expect(component.products().length).toBe(1);
    expect(component.recommendations().length).toBe(1);
  });

  it('should call searchDelivery and update deliveryResult', () => {
    component.trackingQuery.set('TRK-1');

    component.searchDelivery();

    expect(deliveryMock.getDeliveryByTrackingNumber).toHaveBeenCalledWith('TRK-1');
    expect(component.deliveryResult()).toEqual({ id: 10, trackingNumber: 'TRK' } as any);
  });

  it('should handle delivery not found', () => {
    deliveryMock.getDeliveryByTrackingNumber.mockReturnValueOnce(throwError(() => ({ status: 404 })));
    component.trackingQuery.set('404');

    component.searchDelivery();

    expect(component.deliveryResult()).toBeNull();
  });

  it('should add product to cart and clear success message after timeout', () => {
    const item = component.products()[0];

    component.addToCart(item);

    expect(cartMock.addToCart).toHaveBeenCalled();
    expect(component.orderSuccessMessage()).toContain('added to cart');

    vi.advanceTimersByTime(3000);
    expect(component.orderSuccessMessage()).toBe('');
  });

  it('should navigate to cart page', () => {
    component.goToCart();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/front/cart']);
  });

  it('should resolve image url via product service', () => {
    const resolved = component.getImageUrl('/uploads/products/a.png');

    expect(productMock.resolveImageUrl).toHaveBeenCalledWith('/uploads/products/a.png');
    expect(resolved).toBe('/img.png');
  });
});
