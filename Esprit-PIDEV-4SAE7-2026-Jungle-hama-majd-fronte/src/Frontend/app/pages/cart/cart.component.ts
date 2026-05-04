import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import {
  CreateOrderRequest,
  OrderItemRequest,
  OrderService
} from '../../shared/order/order';
import { CartItem } from '../../shared/cart/cart-item.model';
import { CartService } from '../../shared/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly shippingAddress = signal('');
  readonly deliveryMethod = signal('STANDARD_HOME');

  readonly governorates = [
    'Tunis',
    'Ariana',
    'Ben Arous',
    'Manouba',
    'Nabeul',
    'Zaghouan',
    'Bizerte',
    'Beja',
    'Jendouba',
    'Kef',
    'Siliana',
    'Sousse',
    'Monastir',
    'Mahdia',
    'Kairouan',
    'Kasserine',
    'Sidi Bouzid',
    'Sfax',
    'Gabes',
    'Medenine',
    'Tataouine',
    'Gafsa',
    'Tozeur',
    'Kebili'
  ];

  readonly deliveryMethods = [
    { value: 'STANDARD_HOME', label: 'Standard Home Delivery (3-5 days)' },
    { value: 'EXPRESS_HOME', label: 'Express Home Delivery (24h)' },
    { value: 'PICKUP_POINT', label: 'Pickup Point' }
  ];

  readonly items = computed(() => this.cartService.getCart());
  readonly total = computed(() => this.cartService.getTotal());

  increaseQuantity(productId: number): void {
    this.cartService.increaseQuantity(productId);
  }

  decreaseQuantity(productId: number): void {
    this.cartService.decreaseQuantity(productId);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  confirmOrder(): void {
    if (this.items().length === 0) {
      this.error.set('Your cart is empty.');
      return;
    }

    if (!this.shippingAddress().trim()) {
      this.error.set('Please choose your delivery address before confirming.');
      return;
    }

    if (!this.deliveryMethod().trim()) {
      this.error.set('Please choose a delivery method before confirming.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: CreateOrderRequest = {
      userId: this.resolveUserId(),
      userEmail: this.authService.currentUser()?.email || undefined,
      address: this.shippingAddress().trim(),
      paymentMethod: this.deliveryMethod(),
      items: this.items().map((item): OrderItemRequest => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.loading.set(false);
        this.success.set('Order confirmed successfully.');

        setTimeout(() => {
          this.router.navigate(['/front/orders']);
        }, 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to confirm order.');
      }
    });
  }

  private resolveUserId(): string {
    return this.authService.currentUser()?.id || 'anonymous';
  }
}
