import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from '../order/order';

export interface ProductForOrder {
  productId: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-take-order-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './take-order-dialog.component.html',
  styleUrl: './take-order-dialog.component.scss'
})
export class TakeOrderDialogComponent {
  private orderService = inject(OrderService);

  // Tunisia Governorates (24)
  readonly TUNISIA_GOVERNORATES = [
    'Tunis',
    'Ariana',
    'Ben Arous',
    'Manouba',
    'Nabeul',
    'Zaghouan',
    'Bizerte',
    'Béja',
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
    'Gabès',
    'Médenine',
    'Tataouine',
    'Gafsa',
    'Tozeur',
    'Kébili'
  ];

  // Inputs
  product = input.required<ProductForOrder>();
  isOpen = input(false);

  // Outputs
  close = output<void>();
  orderCreated = output<void>();

  // State
  paymentMethod = signal<'CREDIT_CARD' | 'CASH'>('CREDIT_CARD');
  address = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Form validation
  isFormValid = computed(() => {
    return this.address().trim() !== '';
  });

  onCancel(): void {
    this.paymentMethod.set('CREDIT_CARD');
    this.address.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
    this.close.emit();
  }

  onSave(): void {
    // Validate address is provided
    if (!this.address() || this.address().trim() === '') {
      this.errorMessage.set('Please select a governorate');
      return;
    }

    // Validate payment method is selected
    if (!this.paymentMethod()) {
      this.errorMessage.set('Please select a payment method');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Build order payload
    const order: Order = {
      product: {
        idProduct: this.product().productId,
        name: this.product().name,
        price: this.product().price
      },
      totalAmount: this.product().price,
      paymentMethod: this.paymentMethod(),
      status: 'PENDING',
      orderDate: new Date().toISOString(),
      address: this.address().trim()
    };

    console.log('[TakeOrderDialog] Creating order:', order);

    this.orderService.addOrder(order).subscribe({
      next: (response) => {
        console.log('[TakeOrderDialog] ✅ Order created:', response);
        this.isLoading.set(false);
        this.successMessage.set('Order created successfully!');
        
        // Emit success and close dialog after brief delay
        setTimeout(() => {
          this.orderCreated.emit();
          this.onCancel();
        }, 1000);
      },
      error: (err) => {
        console.error('[TakeOrderDialog] ❌ Error creating order:', err);
        this.isLoading.set(false);
        
        // Extract error message from response
        let errorText = 'Failed to create order';
        if (err.error?.message) {
          errorText = err.error.message;
        } else if (err.error?.error) {
          errorText = err.error.error;
        } else if (typeof err.error === 'string') {
          errorText = err.error;
        }
        
        this.errorMessage.set(errorText);
      }
    });
  }
}
