import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { DeliveryTrackingService } from '../../core/delivery-tracking/delivery-tracking.service';

@Component({
  selector: 'app-delivery-assign-test-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './delivery-assign-test.page.html',
  styleUrl: './delivery-assign-test.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryAssignTestPage {
  private readonly trackingService = inject(DeliveryTrackingService);

  readonly deliveryId = signal('');
  readonly livreurId = signal('');
  readonly loading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly assignedDeliveryId = signal<number | null>(null);

  assign(): void {
    const deliveryId = Number(this.deliveryId().trim());
    const livreurId = Number(this.livreurId().trim());

    if (!Number.isInteger(deliveryId) || deliveryId <= 0 || !Number.isInteger(livreurId) || livreurId <= 0) {
      this.errorMessage.set('Please enter valid positive IDs for delivery and livreur.');
      this.successMessage.set(null);
      this.assignedDeliveryId.set(null);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.assignedDeliveryId.set(null);

    this.trackingService.assignLivreurToDelivery(deliveryId, livreurId).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set(`Livreur ${livreurId} assigned to delivery ${deliveryId} successfully.`);
        this.assignedDeliveryId.set(deliveryId);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.toUserError(error));
      }
    });
  }

  private toUserError(error: HttpErrorResponse): string {
    if (error.status === 401 || error.status === 403) {
      return 'Session expired. Please log in again.';
    }

    if (error.status === 404) {
      return 'Delivery or livreur not found.';
    }

    if (error.status === 0) {
      return 'Cannot reach API Gateway on localhost:8085.';
    }

    return 'Assign request failed. Please verify IDs and retry.';
  }
}
