import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Router } from '@angular/router';

import { CartComponent } from './cart.component';
import { CartService } from '../../shared/cart/cart.service';
import { OrderService } from '../../shared/order/order';
import { AuthService } from '../../core/auth/auth.service';

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let component: CartComponent;
  let cartMock: {
    getCart: ReturnType<typeof vi.fn>;
    getTotal: ReturnType<typeof vi.fn>;
    increaseQuantity: ReturnType<typeof vi.fn>;
    decreaseQuantity: ReturnType<typeof vi.fn>;
    removeFromCart: ReturnType<typeof vi.fn>;
    clearCart: ReturnType<typeof vi.fn>;
  };
  let orderMock: { createOrder: ReturnType<typeof vi.fn> };
  let authMock: { currentUser: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.useFakeTimers();

    cartMock = {
      getCart: vi.fn().mockReturnValue([{ productId: 1, productName: 'Book', price: 20, quantity: 2 }]),
      getTotal: vi.fn().mockReturnValue(40),
      increaseQuantity: vi.fn(),
      decreaseQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn()
    };

    orderMock = {
      createOrder: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    authMock = {
      currentUser: vi.fn().mockReturnValue({ id: 'u1', email: 'u@test.com' })
    };

    routerMock = {
      navigate: vi.fn()
    };

    TestBed.overrideComponent(CartComponent, {
      set: { template: '<div></div>' }
    });

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: CartService, useValue: cartMock },
        { provide: OrderService, useValue: orderMock },
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call cart actions', () => {
    component.increaseQuantity(1);
    component.decreaseQuantity(1);
    component.removeItem(1);
    component.clearCart();

    expect(cartMock.increaseQuantity).toHaveBeenCalledWith(1);
    expect(cartMock.decreaseQuantity).toHaveBeenCalledWith(1);
    expect(cartMock.removeFromCart).toHaveBeenCalledWith(1);
    expect(cartMock.clearCart).toHaveBeenCalled();
  });

  it('should handle empty cart on submit', () => {
    cartMock.getCart.mockReturnValueOnce([]);

    component.confirmOrder();

    expect(component.error()).toBe('Your cart is empty.');
    expect(orderMock.createOrder).not.toHaveBeenCalled();
  });

  it('should handle missing address on submit', () => {
    component.shippingAddress.set('');

    component.confirmOrder();

    expect(component.error()).toContain('delivery address');
  });

  it('should submit order and navigate on success', () => {
    component.shippingAddress.set('Tunis');
    component.deliveryMethod.set('STANDARD_HOME');

    component.confirmOrder();

    expect(orderMock.createOrder).toHaveBeenCalled();
    expect(cartMock.clearCart).toHaveBeenCalled();
    vi.runAllTimers();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/front/orders']);
  });

  it('should handle order submit error', () => {
    orderMock.createOrder.mockReturnValueOnce(throwError(() => ({ error: { message: 'failed' } })));
    component.shippingAddress.set('Sousse');
    component.deliveryMethod.set('EXPRESS_HOME');

    component.confirmOrder();

    expect(component.error()).toBe('failed');
    expect(component.loading()).toBe(false);
  });
});
