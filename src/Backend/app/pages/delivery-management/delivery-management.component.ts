import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest, DELIVERY_STATUS } from '../../models/delivery.model';
import { OrderService, Order } from '../../services/order.service';
import { AdminPageShellComponent, AdminStat } from '../../shared/admin-page-shell/admin-page-shell.component';

@Component({
  selector: 'app-delivery-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageShellComponent],
  templateUrl: './delivery-management.component.html',
  styleUrl: './delivery-management.component.scss'
})
export class DeliveryManagementComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private orderService = inject(OrderService);

  deliveries = signal<Delivery[]>([]);
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedTab = signal('all');
  searchTerm = signal('');
  sortFilter = signal('Sort: Newest');

  showForm = signal(false);
  isEditMode = signal(false);
  showDeleteConfirm = signal(false);
  deliveryToDelete = signal<number | null>(null);

  currentDelivery = signal<Partial<Delivery>>({
    deliveryAddress: '',
    deliveryStatus: DELIVERY_STATUS.PENDING,
    deliveryDate: '',
    order: { idOrder: 0 }
  });

  // Delivery status options
  readonly statusOptions = [
    { value: DELIVERY_STATUS.PENDING, label: 'Pending' },
    { value: DELIVERY_STATUS.IN_TRANSIT, label: 'In Transit' },
    { value: DELIVERY_STATUS.DELIVERED, label: 'Delivered' },
    { value: DELIVERY_STATUS.CANCELLED, label: 'Cancelled' }
  ];

  readonly tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: DELIVERY_STATUS.PENDING.toLowerCase() },
    { label: 'In Transit', value: DELIVERY_STATUS.IN_TRANSIT.toLowerCase() },
    { label: 'Delivered', value: DELIVERY_STATUS.DELIVERED.toLowerCase() },
    { label: 'Cancelled', value: DELIVERY_STATUS.CANCELLED.toLowerCase() }
  ];

  readonly filters = computed(() => [
    {
      label: 'Sort',
      options: ['Sort: Newest', 'Sort: Oldest'],
      value: this.sortFilter()
    }
  ]);

  readonly displayedDeliveries = computed(() => {
    let items = [...this.deliveries()];
    const tab = this.selectedTab();
    const search = this.searchTerm().trim().toLowerCase();
    const sort = this.sortFilter();

    if (tab !== 'all') {
      items = items.filter((delivery) => (delivery.deliveryStatus || '').toLowerCase() === tab);
    }

    if (search) {
      items = items.filter((delivery) =>
        `${delivery.trackingNumber} ${delivery.deliveryAddress} ${delivery.deliveryStatus}`
          .toLowerCase()
          .includes(search)
      );
    }

    if (sort === 'Sort: Newest') {
      items.sort((a, b) => new Date(b.deliveryDate || 0).getTime() - new Date(a.deliveryDate || 0).getTime());
    } else {
      items.sort((a, b) => new Date(a.deliveryDate || 0).getTime() - new Date(b.deliveryDate || 0).getTime());
    }

    return items;
  });

  readonly stats = computed<AdminStat[]>(() => {
    const items = this.deliveries();
    const total = items.length;
    const pending = items.filter((delivery) => delivery.deliveryStatus === DELIVERY_STATUS.PENDING).length;
    const inTransit = items.filter((delivery) => delivery.deliveryStatus === DELIVERY_STATUS.IN_TRANSIT).length;
    const delivered = items.filter((delivery) => delivery.deliveryStatus === DELIVERY_STATUS.DELIVERED).length;
    const cancelled = items.filter((delivery) => delivery.deliveryStatus === DELIVERY_STATUS.CANCELLED).length;

    return [
      { label: 'Total Deliveries', value: total },
      { label: 'Pending', value: pending, accent: 'orange' },
      { label: 'In Transit', value: inTransit, accent: 'blue' },
      { label: 'Delivered', value: delivered, accent: 'green' },
      { label: 'Cancelled', value: cancelled }
    ];
  });

  ngOnInit(): void {
    this.loadDeliveries();
    this.loadOrders();
  }

  loadDeliveries(): void {
    this.loading.set(true);
    this.error.set(null);

    this.deliveryService.getAllDeliveries().subscribe({
      next: (data) => {
        this.deliveries.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[DeliveryManagement] Error loading deliveries:', err);
        this.error.set(
          err.status === 0
            ? 'Failed to load deliveries. Check if API Gateway is running on http://localhost:8085 or if proxy is enabled (npm start).'
            : `Failed to load deliveries: ${err.message || 'Unknown error'}`
        );
        this.loading.set(false);
      }
    });
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: (err) => {
        console.error('[DeliveryManagement] Error loading orders:', err);
      }
    });
  }

  openAddForm(): void {
    this.isEditMode.set(false);
    this.currentDelivery.set({
      deliveryAddress: '',
      deliveryStatus: DELIVERY_STATUS.PENDING,
      deliveryDate: '',
      order: { idOrder: 0 }
    });
    this.showForm.set(true);
  }

  openEditForm(delivery: Delivery): void {
    this.isEditMode.set(true);
    this.currentDelivery.set({
      idDelivery: delivery.idDelivery,
      deliveryAddress: delivery.deliveryAddress,
      deliveryStatus: delivery.deliveryStatus,
      deliveryDate: delivery.deliveryDate ? this.formatDateForInput(delivery.deliveryDate) : '',
      trackingNumber: delivery.trackingNumber,
      order: delivery.order
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.currentDelivery.set({
      deliveryAddress: '',
      deliveryStatus: DELIVERY_STATUS.PENDING,
      deliveryDate: '',
      order: { idOrder: 0 }
    });
  }

  saveDelivery(): void {
    const delivery = this.currentDelivery();

    // Validation
    if (!delivery.deliveryAddress?.trim()) {
      alert('Delivery address is required');
      return;
    }

    if (!delivery.order?.idOrder || delivery.order.idOrder === 0) {
      alert('Please select an order');
      return;
    }

    this.loading.set(true);

    // Convert date to string if it's a Date object
    const deliveryDateStr = delivery.deliveryDate 
      ? (typeof delivery.deliveryDate === 'string' ? delivery.deliveryDate : (delivery.deliveryDate as Date).toISOString().split('T')[0])
      : undefined;

    if (this.isEditMode() && delivery.idDelivery) {
      // Update
      const updatePayload: UpdateDeliveryRequest = {
        deliveryAddress: delivery.deliveryAddress,
        deliveryStatus: delivery.deliveryStatus || DELIVERY_STATUS.PENDING,
        deliveryDate: deliveryDateStr,
        order: delivery.order
      };

      this.deliveryService.updateDelivery(delivery.idDelivery, updatePayload).subscribe({
        next: () => {
          this.loadDeliveries();
          this.closeForm();
        },
        error: (err) => {
          console.error('[DeliveryManagement] Error updating delivery:', err);
          alert(`Failed to update delivery: ${err.error?.message || err.message || 'Unknown error'}`);
          this.loading.set(false);
        }
      });
    } else {
      // Create
      const createPayload: CreateDeliveryRequest = {
        deliveryAddress: delivery.deliveryAddress,
        deliveryStatus: delivery.deliveryStatus || DELIVERY_STATUS.PENDING,
        deliveryDate: deliveryDateStr,
        order: { idOrder: delivery.order.idOrder }
      };

      this.deliveryService.createDelivery(createPayload).subscribe({
        next: () => {
          this.loadDeliveries();
          this.closeForm();
        },
        error: (err) => {
          console.error('[DeliveryManagement] Error creating delivery:', err);
          alert(`Failed to create delivery: ${err.error?.message || err.message || 'Unknown error'}`);
          this.loading.set(false);
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deliveryToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  deleteDelivery(): void {
    const id = this.deliveryToDelete();
    if (!id) return;

    this.loading.set(true);
    this.deliveryService.deleteDelivery(id).subscribe({
      next: () => {
        this.loadDeliveries();
        this.showDeleteConfirm.set(false);
        this.deliveryToDelete.set(null);
      },
      error: (err) => {
        console.error('[DeliveryManagement] Error deleting delivery:', err);
        alert(`Failed to delete delivery: ${err.error?.message || err.message || 'Unknown error'}`);
        this.loading.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deliveryToDelete.set(null);
  }

  updateField(field: string, value: any): void {
    this.currentDelivery.update(delivery => ({ ...delivery, [field]: value }));
  }

  updateOrderId(orderId: number): void {
    // When selecting an order, pre-fill the address if available
    const selectedOrder = this.orders().find(o => o.idOrder === orderId);
    this.currentDelivery.update(delivery => ({
      ...delivery,
      order: { idOrder: orderId },
      deliveryAddress: selectedOrder?.address || delivery.deliveryAddress || ''
    }));
  }

  getOrderInfo(orderId?: number): string {
    if (!orderId) return 'N/A';
    const order = this.orders().find(o => o.idOrder === orderId);
    if (!order) return `Order #${orderId}`;
    const productName = order.productName || order.product?.name || 'Unknown Product';
    return `Order #${orderId} - ${productName}`;
  }

  formatDate(date?: string | Date): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  }

  formatDateForInput(date: string | Date): string {
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case DELIVERY_STATUS.DELIVERED:
        return 'badge-success';
      case DELIVERY_STATUS.IN_TRANSIT:
        return 'badge-info';
      case DELIVERY_STATUS.PENDING:
        return 'badge-warning';
      case DELIVERY_STATUS.CANCELLED:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  onTabChange(tab: string): void {
    this.selectedTab.set(tab);
  }

  onSearchChange(search: string): void {
    this.searchTerm.set(search);
  }

  onFilterChange(change: { label: string; value: string }): void {
    if (change.label === 'Sort') {
      this.sortFilter.set(change.value);
    }
  }
}
