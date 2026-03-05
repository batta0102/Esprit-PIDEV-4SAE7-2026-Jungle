import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { ProductService, Product } from '../../services/product.service';
import { DeliveryService } from '../../services/delivery.service';
import { CreateDeliveryRequest, DELIVERY_STATUS } from '../../models/delivery.model';
import { AdminPageShellComponent, AdminStat } from '../../shared/admin-page-shell/admin-page-shell.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageShellComponent],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.scss'
})
export class OrdersManagementComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private deliveryService = inject(DeliveryService);
  private route = inject(ActivatedRoute);

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  filterProductId = signal<number | null>(null);
  productList = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedTab = signal('all');
  searchTerm = signal('');
  paymentFilter = signal('All Payments');
  sortFilter = signal('Sort: Newest');

  showForm = signal(false);
  isEditMode = signal(false);

  // Delivery creation modal
  showDeliveryForm = signal(false);
  deliveryLoading = signal(false);
  currentDeliveryOrder = signal<Order | null>(null);
  deliveryAddress = signal('');
  deliveryStatus = signal(DELIVERY_STATUS.PENDING);
  deliveryDate = signal('');

  // Delivery status options
  readonly deliveryStatusOptions = [
    { value: DELIVERY_STATUS.PENDING, label: 'Pending' },
    { value: DELIVERY_STATUS.IN_TRANSIT, label: 'In Transit' },
    { value: DELIVERY_STATUS.DELIVERED, label: 'Delivered' },
    { value: DELIVERY_STATUS.CANCELLED, label: 'Cancelled' }
  ];

  currentOrder = signal<Order>({
    product: { idProduct: 0 },
    totalAmount: 0,
    status: 'Pending',
    paymentMethod: 'Credit Card',
    address: ''
  });

  readonly tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  readonly filters = computed(() => [
    {
      label: 'Payment',
      options: ['All Payments', 'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash'],
      value: this.paymentFilter()
    },
    {
      label: 'Sort',
      options: ['Sort: Newest', 'Sort: Oldest', 'Sort: Amount ↑', 'Sort: Amount ↓'],
      value: this.sortFilter()
    }
  ]);

  readonly displayedOrders = computed(() => {
    let items = [...this.filteredOrders()];
    const tab = this.selectedTab();
    const payment = this.paymentFilter();
    const search = this.searchTerm().trim().toLowerCase();
    const sort = this.sortFilter();

    if (tab !== 'all') {
      items = items.filter((order) => (order.status || '').toLowerCase() === tab);
    }

    if (payment !== 'All Payments') {
      items = items.filter((order) => (order.paymentMethod || '') === payment);
    }

    if (search) {
      items = items.filter((order) => {
        const productName = this.getProductName(order.product?.idProduct);
        return `${productName} ${order.address} ${order.status} ${order.paymentMethod}`
          .toLowerCase()
          .includes(search);
      });
    }

    if (sort === 'Sort: Newest') {
      items.sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
    } else if (sort === 'Sort: Oldest') {
      items.sort((a, b) => new Date(a.orderDate || 0).getTime() - new Date(b.orderDate || 0).getTime());
    } else if (sort === 'Sort: Amount ↑') {
      items.sort((a, b) => a.totalAmount - b.totalAmount);
    } else if (sort === 'Sort: Amount ↓') {
      items.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    return items;
  });

  readonly stats = computed<AdminStat[]>(() => {
    const items = this.orders();
    const total = items.length;
    const pending = items.filter((order) => (order.status || '').toLowerCase() === 'pending').length;
    const confirmed = items.filter((order) => (order.status || '').toLowerCase() === 'confirmed').length;
    const shipped = items.filter((order) => (order.status || '').toLowerCase() === 'shipped').length;
    const cancelled = items.filter((order) => (order.status || '').toLowerCase() === 'cancelled').length;

    return [
      { label: 'Total Orders', value: total },
      { label: 'Pending', value: pending, accent: 'orange' },
      { label: 'Confirmed', value: confirmed, accent: 'blue' },
      { label: 'Shipped', value: shipped, accent: 'green' },
      { label: 'Cancelled', value: cancelled }
    ];
  });

  ngOnInit(): void {
    // Load products first, then orders
    this.loadProducts();
    
    // Check for productId in query parameters
    this.route.queryParams.subscribe((params) => {
      const productId = params['productId'];
      if (productId) {
        const id = parseInt(productId, 10);
        this.filterProductId.set(id);
        console.log(`[OrdersManagement] 🔗 Filter from URL param: productId=${id}`);
      }
    });
    
    // Load orders after products have time to load
    setTimeout(() => this.loadOrders(), 100);
  }

  /**
   * Load all available products from API Gateway
   */
  loadProducts(): void {
    console.log('[OrdersManagement] 🔄 Loading available products...');
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.productList.set(products);
        console.log(`[OrdersManagement] ✅ Loaded ${products.length} available products`);
        if (products.length > 0) {
          console.log('[OrdersManagement] First product sample:', products[0]);
          console.log('[OrdersManagement] Product map ready for lookup');
        }
      },
      error: (err: any) => {
        console.error('[OrdersManagement] ⚠️ Failed to load products:', err);
        // Don't fail the whole page if products fail to load
        this.productList.set([]);
      }
    });
  }

  /**
   * Load all orders from API Gateway
   */
  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        console.log('[OrdersManagement] 📥 Loaded orders from API:', data);
        if (data.length > 0) {
          const firstOrder = data[0];
          console.log('[OrdersManagement] ✅ First order sample:', firstOrder);
          console.log('[OrdersManagement] First order product structure:', firstOrder.product);
          console.log('[OrdersManagement] First order productId:', firstOrder.product?.idProduct);
          console.log('[OrdersManagement] Product list available:', this.productList().length);
        }
        this.orders.set(data);
        
        // Apply filter if productId is set from URL param
        this.applyFilter();
        
        this.loading.set(false);
      },
      error: (err: any) => {
        const errorMsg = err.status === 0 
          ? 'Failed to load orders. Check if API Gateway is running on http://localhost:8085 or if proxy is enabled (npm start).'
          : `Failed to load orders: HTTP ${err.status} ${err.statusText}`;
        this.error.set(errorMsg);
        this.loading.set(false);
        console.error('[OrdersManagement] Error loading orders:', err);
      }
    });
  }

  /**
   * Apply product ID filter to orders
   */
  applyFilter(): void {
    const productId = this.filterProductId();
    
    if (productId === null) {
      this.filteredOrders.set(this.orders());
      console.log('[OrdersManagement] ✅ Filter cleared - showing all orders');
    } else {
      const filtered = this.orders().filter(
        (order) => order.product?.idProduct === productId
      );
      this.filteredOrders.set(filtered);
      const productName = this.getProductName(productId);
      console.log(`[OrdersManagement] ✅ Filtered ${filtered.length} orders for product: ${productName} (ID: ${productId})`);
    }
  }

  /**
   * Clear the product filter and show all orders
   */
  clearFilter(): void {
    this.filterProductId.set(null);
    this.applyFilter();
    console.log('[OrdersManagement] Filter cleared - showing all orders');
  }

  /**
   * Open form for adding a new order
   */
  openAddForm(): void {
    this.isEditMode.set(false);
    this.currentOrder.set({
      product: { idProduct: 0 },
      totalAmount: 0,
      status: 'Pending',
      paymentMethod: 'Credit Card',
      address: ''
    });
    this.showForm.set(true);
  }

  /**
   * Open form for editing an existing order
   */
  openEditForm(order: Order): void {
    this.isEditMode.set(true);
    this.currentOrder.set({ ...order });
    this.showForm.set(true);
  }

  /**
   * Close the form modal
   */
  closeForm(): void {
    this.showForm.set(false);
    this.currentOrder.set({
      product: { idProduct: 0 },
      totalAmount: 0,
      status: 'Pending',
      paymentMethod: 'Credit Card',
      address: ''
    });
  }

  /**
   * Save the current order (add or update)
   */
  saveOrder(): void {
    const order = this.currentOrder();

    if (!order.product?.idProduct || order.product.idProduct === 0) {
      this.error.set('Please select a product.');
      return;
    }

    if (!order.totalAmount || order.totalAmount === 0) {
      this.error.set('Please provide a total amount.');
      return;
    }

    if (!order.status || order.status.trim() === '') {
      this.error.set('Please provide a status.');
      return;
    }

    if (!order.paymentMethod || order.paymentMethod.trim() === '') {
      this.error.set('Please provide a payment method.');
      return;
    }

    if (!order.address || order.address.trim() === '') {
      this.error.set('Please provide a delivery address.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    if (this.isEditMode() && order.idOrder) {
      this.orderService.updateOrder(order.idOrder, order).subscribe({
        next: () => {
          this.loadOrders();
          this.closeForm();
        },
        error: (err: any) => {
          this.error.set(`Failed to update order: ${err.message ?? err}`);
          this.loading.set(false);
          console.error('[OrdersManagement] Error updating order:', err);
        }
      });
      return;
    }

    const newOrder: Order = { ...order };
    delete (newOrder as Partial<Order>).idOrder;

    this.orderService.addOrder(newOrder).subscribe({
      next: () => {
        this.loadOrders();
        this.closeForm();
      },
      error: (err: any) => {
        this.error.set(`Failed to add order: ${err.message ?? err}`);
        this.loading.set(false);
        console.error('[OrdersManagement] Error adding order:', err);
      }
    });
  }

  /**
   * Delete an order
   */
  deleteOrder(order: Order): void {
    if (!order.idOrder) {
      console.error('[OrdersManagement] No order ID provided');
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete Order #${order.idOrder}? This action cannot be undone.`);
    if (!confirmed) {
      console.log('[OrdersManagement] Delete cancelled by user');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    console.log(`[OrdersManagement] Initiating delete for order ${order.idOrder}`);
    
    this.orderService.deleteOrder(order.idOrder).subscribe({
      next: (response: any) => {
        console.log('[OrdersManagement] Order deleted successfully:', response);
        alert(`Order #${order.idOrder} has been deleted successfully!`);
        this.loadOrders();
      },
      error: (err: any) => {
        console.error('[OrdersManagement] Error deleting order:', err);
        console.error('[OrdersManagement] Error status:', err.status);
        console.error('[OrdersManagement] Error response:', err.error);
        this.error.set(`Failed to delete order #${order.idOrder}: ${err.message ?? 'Unknown error'}`);
        this.loading.set(false);
      },
      complete: () => {
        console.log('[OrdersManagement] Delete request completed');
      }
    });
  }

  /**
   * Update a field in the current order
   */
  updateField(field: keyof Order, value: Order[keyof Order]): void {
    this.currentOrder.update((order) => ({ ...order, [field]: value }));
  }

  /**
   * Update product ID and load product details (name, price)
   */
  updateProductId(productId: number): void {
    const selectedProduct = this.getProductById(productId);
    
    if (!selectedProduct) {
      console.warn(`[OrdersManagement] Product ID ${productId} not found`);
      this.currentOrder.update((order) => ({
        ...order,
        product: { idProduct: productId }
      }));
      return;
    }

    console.log(`[OrdersManagement] Selected product:`, selectedProduct);
    
    // Update order with product details and auto-fill total amount if creating new order
    this.currentOrder.update((order) => {
      const updatedOrder = {
        ...order,
        product: {
          idProduct: selectedProduct.idProduct,
          name: selectedProduct.name,
          price: selectedProduct.price
        }
      };
      
      // Auto-fill total amount with product price on new order
      if (!this.isEditMode() && selectedProduct.price && order.totalAmount === 0) {
        updatedOrder.totalAmount = selectedProduct.price;
      }
      
      return updatedOrder;
    });
  }

  /**
   * Get product by ID from the product list
   * Handles string/number conversion
   */
  getProductById(productId?: number | string): Product | undefined {
    if (!productId) return undefined;
    
    const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    if (isNaN(id)) return undefined;
    
    return this.productList().find((p) => p.idProduct === id);
  }

  /**
   * Get product name by ID or from product object
   * Cas A: order.product.name existe → afficher
   * Cas B: seulement order.product.idProduct → chercher dans productList
   * Cas C: productId string → convertir et chercher
   */
  getProductName(productIdOrObject?: number | null | any): string {
    // Handle null or undefined
    if (productIdOrObject === null || productIdOrObject === undefined) {
      return 'N/A';
    }

    // Case 1: Product object with name property
    if (typeof productIdOrObject === 'object' && productIdOrObject?.name) {
      return productIdOrObject.name;
    }

    // Case 2: Direct string/number productId
    const productId = typeof productIdOrObject === 'number' 
      ? productIdOrObject 
      : (typeof productIdOrObject === 'string' ? parseInt(productIdOrObject, 10) : undefined);

    if (!productId) {
      return 'N/A';
    }

    // Case 3: Search in productList
    const product = this.getProductById(productId);
    if (product?.name) {
      return product.name;
    }

    // Case 4: Fallback
    return `Product #${productId}`;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByIdOrder(index: number, order: Order): number {
    return order.idOrder ?? index;
  }

  onTabChange(tab: string): void {
    this.selectedTab.set(tab);
  }

  onSearchChange(search: string): void {
    this.searchTerm.set(search);
  }

  onFilterChange(change: { label: string; value: string }): void {
    if (change.label === 'Payment') {
      this.paymentFilter.set(change.value);
    }

    if (change.label === 'Sort') {
      this.sortFilter.set(change.value);
    }
  }

  /**
   * Open delivery creation modal for a specific order
   */
  openCreateDeliveryForm(order: Order): void {
    console.log('[OrdersManagement] 🚚 Opening delivery creation modal for order:', order);
    this.currentDeliveryOrder.set(order);
    this.deliveryAddress.set(order.address || '');
    this.deliveryStatus.set(DELIVERY_STATUS.PENDING);
    this.deliveryDate.set('');
    this.showDeliveryForm.set(true);
  }

  /**
   * Close delivery creation modal
   */
  closeDeliveryForm(): void {
    this.showDeliveryForm.set(false);
    this.currentDeliveryOrder.set(null);
    this.deliveryAddress.set('');
    this.deliveryStatus.set(DELIVERY_STATUS.PENDING);
    this.deliveryDate.set('');
  }

  /**
   * Create delivery for the current order
   */
  createDeliveryForOrder(): void {
    const order = this.currentDeliveryOrder();
    if (!order || !order.idOrder) {
      alert('Invalid order');
      console.error('[OrdersManagement] Invalid order:', order);
      return;
    }

    const address = this.deliveryAddress().trim();
    if (!address) {
      alert('Delivery address is required');
      return;
    }

    this.deliveryLoading.set(true);

    const deliveryRequest: CreateDeliveryRequest = {
      deliveryAddress: address,
      deliveryStatus: this.deliveryStatus(),
      deliveryDate: this.deliveryDate() || undefined,
      order: { idOrder: order.idOrder }
    };

    console.log('[OrdersManagement] 🚀 Creating delivery...');
    console.log('[OrdersManagement] Order data:', {
      idOrder: order.idOrder,
      productName: order.productName || order.product?.name,
      address: order.address
    });
    console.log('[OrdersManagement] Delivery request:', deliveryRequest);
    console.log('[OrdersManagement] Delivery request JSON:', JSON.stringify(deliveryRequest));
    console.log('[OrdersManagement] order.idOrder type:', typeof order.idOrder, 'value:', order.idOrder);
    console.log('[OrdersManagement] Proxy should forward to: http://localhost:8085/deliveries/addDelivery');

    this.deliveryService.createDelivery(deliveryRequest).subscribe({
      next: (response) => {
        console.log('[OrdersManagement] ✅ Delivery created successfully:', response);
        alert(`Delivery created successfully! Tracking Number: ${response.trackingNumber || 'N/A'}`);
        this.closeDeliveryForm();
        this.deliveryLoading.set(false);
      },
      error: (err) => {
        console.error('[OrdersManagement] ❌ Error creating delivery:', err);
        console.error('[OrdersManagement] Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          url: err.url,
          error: err.error
        });
        const errorMsg = err.error?.message || err.message || 'Failed to create delivery';
        alert(`Error: ${errorMsg}`);
        this.deliveryLoading.set(false);
      }
    });
  }
}
