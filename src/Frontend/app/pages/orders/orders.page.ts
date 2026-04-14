import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { OrderResponse, OrderService } from '../../shared/order/order';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);
  readonly authService = inject(AuthService);

  readonly orders = signal<OrderResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    const userId = this.authService.currentUser()?.id;
    const role = this.authService.currentUser()?.role;

    if (role === 'LIVREUR') {
      this.error.set('Livreur accounts use My deliveries. Open the Livreur space to track assigned deliveries.');
      this.orders.set([]);
      this.loading.set(false);
      return;
    }

    const request$ = userId && userId.trim().length > 0
      ? this.orderService.getOrdersByUserId(userId)
      : this.orderService.getAllOrders();

    request$.subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load orders.');
        this.loading.set(false);
      }
    });
  }
}
