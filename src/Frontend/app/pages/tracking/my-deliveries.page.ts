import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { DeliveryTrackingResponse } from '../../core/delivery-tracking/delivery-tracking.model';
import { DeliveryTrackingService } from '../../core/delivery-tracking/delivery-tracking.service';

@Component({
  selector: 'app-my-deliveries-page',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './my-deliveries.page.html',
  styleUrl: './my-deliveries.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyDeliveriesPage {
  private readonly auth = inject(AuthService);
  private readonly trackingService = inject(DeliveryTrackingService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly deliveries = signal<DeliveryTrackingResponse[]>([]);

  constructor() {
    this.loadMyDeliveries();
  }

  loadMyDeliveries(): void {
    this.loading.set(true);
    this.error.set(null);

    this.trackingService.getMyDeliveriesTracking().subscribe({
      next: (deliveries) => {
        this.deliveries.set(deliveries);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load your deliveries.');
        this.loading.set(false);
      }
    });
  }

  get userName(): string {
    return this.auth.currentUser()?.name || 'Customer';
  }

  getStatusClass(status: string | null | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'DELIVERED':
        return 'status-delivered';
      case 'IN_TRANSIT':
        return 'status-transit';
      case 'ASSIGNED':
        return 'status-assigned';
      case 'PENDING':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  }
}