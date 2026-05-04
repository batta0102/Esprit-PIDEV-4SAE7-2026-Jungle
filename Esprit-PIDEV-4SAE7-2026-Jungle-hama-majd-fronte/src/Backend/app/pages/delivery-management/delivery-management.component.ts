import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DeliveryService } from '../../services/delivery.service';
import { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest, DELIVERY_STATUS } from '../../models/delivery.model';
import { OrderService, Order } from '../../services/order.service';
import { LivreurUser, UserService } from '../../services/user.service';
import { AdminPageShellComponent, AdminStat } from '../../shared/admin-page-shell/admin-page-shell.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-delivery-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageShellComponent, RouterLink],
  templateUrl: './delivery-management.component.html',
  styleUrl: './delivery-management.component.scss'
})
export class DeliveryManagementComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);

  deliveries = signal<Delivery[]>([]);
  orders = signal<Order[]>([]);
  livreurs = signal<LivreurUser[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedTab = signal('all');
  searchTerm = signal('');
  sortFilter = signal('Sort: Newest');

  showForm = signal(false);
  isEditMode = signal(false);
  showDeleteConfirm = signal(false);
  deliveryToDelete = signal<number | null>(null);
  showAssignModal = signal(false);
  deliveryToAssign = signal<Delivery | null>(null);
  selectedLivreurId = signal<number | null>(null);
  assignError = signal<string | null>(null);

  currentDelivery = signal<Partial<Delivery>>({
    deliveryAddress: '',
    deliveryStatus: DELIVERY_STATUS.PENDING,
    deliveryDate: '',
    order: { idOrder: 0 }
  });

  // Form validation signals
  deliveryAddressError = signal<string | null>(null);
  deliveryStatusError = signal<string | null>(null);
  orderError = signal<string | null>(null);

  // Check if form is valid
  isFormValid = computed(() => {
    const delivery = this.currentDelivery();
    
    // Address required and min 5 chars
    if (!delivery.deliveryAddress?.trim() || delivery.deliveryAddress.trim().length < 5) {
      return false;
    }
    
    // Status required
    if (!delivery.deliveryStatus || delivery.deliveryStatus.trim() === '') {
      return false;
    }
    
    // Order required
    if (!delivery.order?.idOrder || delivery.order.idOrder === 0) {
      return false;
    }
    
    return !this.deliveryAddressError() && !this.deliveryStatusError() && !this.orderError();
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
    const assigned = items.filter((delivery) => !!delivery.livreurId).length;

    return [
      { label: 'Total Deliveries', value: total },
      { label: 'Assigned', value: assigned, accent: 'blue' },
      { label: 'Pending', value: pending, accent: 'orange' },
      { label: 'In Transit', value: inTransit, accent: 'blue' },
      { label: 'Delivered', value: delivered, accent: 'green' },
      { label: 'Cancelled', value: cancelled }
    ];
  });

  readonly availableLivreurs = computed(() =>
    this.livreurs().filter((livreur) => livreur.status === 'AVAILABLE' || livreur.id === this.selectedLivreurId())
  );

  ngOnInit(): void {
    this.loadDeliveries();
    this.loadOrders();
    this.loadLivreurs();
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

  loadLivreurs(): void {
    this.userService.getAllLivreurs().subscribe({
      next: (data) => {
        this.livreurs.set(data);
      },
      error: (err) => {
        console.error('[DeliveryManagement] Error loading livreurs:', err);
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

  openAssignModal(delivery: Delivery): void {
    this.deliveryToAssign.set(delivery);
    this.selectedLivreurId.set(delivery.livreurId ?? null);
    this.assignError.set(null);
    this.showAssignModal.set(true);
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false);
    this.deliveryToAssign.set(null);
    this.selectedLivreurId.set(null);
    this.assignError.set(null);
  }

  assignLivreur(): void {
    const delivery = this.deliveryToAssign();
    const livreurId = this.selectedLivreurId();

    if (!delivery?.idDelivery || !livreurId) {
      this.assignError.set('Please select a driver');
      return;
    }

    this.loading.set(true);
    this.deliveryService.assignLivreurToDelivery(delivery.idDelivery, livreurId).subscribe({
      next: () => {
        this.loadDeliveries();
        this.loadLivreurs();
        this.closeAssignModal();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[DeliveryManagement] Error assigning livreur:', err);
        this.assignError.set(this.toAssignErrorMessage(err));
        this.loading.set(false);
      }
    });
  }

  private toAssignErrorMessage(err: HttpErrorResponse): string {
    if (typeof err?.error?.message === 'string' && err.error.message.trim().length > 0) {
      return err.error.message;
    }

    if (typeof err?.error === 'string' && err.error.trim().length > 0) {
      return err.error;
    }

    if (err.status === 400) {
      return 'Selected user is not a LIVREUR.';
    }

    if (err.status === 403) {
      return 'Access denied. Please login as ADMIN.';
    }

    if (err.status === 404) {
      return 'Delivery or livreur not found.';
    }

    if (err.status === 409) {
      return 'Delivery is already assigned to another livreur.';
    }

    if (err.status === 0) {
      return 'Cannot reach API Gateway on localhost:8085.';
    }

    return err.message || 'Failed to assign driver';
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
    if (!this.validateForm()) {
      return;
    }

    const delivery = this.currentDelivery();
    this.loading.set(true);

    // Convert date to string if it's a Date object
    const deliveryDateStr = delivery.deliveryDate 
      ? (typeof delivery.deliveryDate === 'string' ? delivery.deliveryDate : (delivery.deliveryDate as Date).toISOString().split('T')[0])
      : undefined;

    if (this.isEditMode() && delivery.idDelivery) {
      // Update
      const updatePayload: UpdateDeliveryRequest = {
        deliveryAddress: delivery.deliveryAddress || '',
        deliveryStatus: delivery.deliveryStatus || DELIVERY_STATUS.PENDING,
        deliveryDate: deliveryDateStr,
        order: delivery.order || { idOrder: 0 }
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
        deliveryAddress: delivery.deliveryAddress || '',
        deliveryStatus: delivery.deliveryStatus || DELIVERY_STATUS.PENDING,
        deliveryDate: deliveryDateStr,
        order: { idOrder: delivery.order?.idOrder || 0 }
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

  /**
   * Validate individual field and set error message
   */
  validateField(field: string): void {
    const delivery = this.currentDelivery();

    switch (field) {
      case 'deliveryAddress':
        if (!delivery.deliveryAddress?.trim()) {
          this.deliveryAddressError.set('Delivery address is required');
        } else if (delivery.deliveryAddress.trim().length < 5) {
          this.deliveryAddressError.set('Address must be at least 5 characters');
        } else {
          this.deliveryAddressError.set(null);
        }
        break;

      case 'deliveryStatus':
        if (!delivery.deliveryStatus || delivery.deliveryStatus.trim() === '') {
          this.deliveryStatusError.set('Delivery status is required');
        } else {
          this.deliveryStatusError.set(null);
        }
        break;

      case 'order':
        if (!delivery.order?.idOrder || delivery.order.idOrder === 0) {
          this.orderError.set('Please select an order');
        } else {
          this.orderError.set(null);
        }
        break;
    }
  }

  /**
   * Validate entire form before submission
   */
  validateForm(): boolean {
    this.validateField('deliveryAddress');
    this.validateField('deliveryStatus');
    this.validateField('order');

    if (!this.isFormValid()) {
      alert('Please fix the errors in the form');
      return false;
    }

    return true;
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

  getLivreurInfo(delivery: Delivery): string {
    if (delivery.livreurId) {
      const livreur = this.livreurs().find((item) => item.id === delivery.livreurId);
      if (livreur) {
        return `${livreur.fullName}${livreur.status ? ` (${livreur.status})` : ''}`;
      }
      return `Livreur #${delivery.livreurId}`;
    }

    return 'Unassigned';
  }

  getTrackingLink(deliveryId?: number): string {
    if (!deliveryId) {
      return '/front/tracking/1';
    }

    return `/front/tracking/${deliveryId}`;
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
