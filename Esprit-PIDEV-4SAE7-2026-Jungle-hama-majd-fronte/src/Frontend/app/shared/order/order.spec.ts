import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { OrderService } from './order';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit create order request', () => {
    const payload = {
      userId: 'u1',
      items: [{ productId: 11, quantity: 2 }]
    };

    service.createOrder(payload).subscribe((order) => {
      expect(order.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, userId: 'u1', items: [] });
  });

  it('should load all orders', () => {
    service.getAllOrders().subscribe((orders) => {
      expect(orders.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }, { id: 2 }]);
  });

  it('should load order by id', () => {
    service.getOrderById(5).subscribe((order) => {
      expect(order.id).toBe(5);
    });

    const req = httpMock.expectOne('/api/orders/5');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 5, items: [] });
  });

  it('should load orders by user id', () => {
    service.getOrdersByUserId('u55').subscribe((orders) => {
      expect(orders.length).toBe(1);
    });

    const req = httpMock.expectOne('/api/orders/user/u55');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 10, userId: 'u55', items: [] }]);
  });

  it('should update order status', () => {
    service.updateOrderStatus(8, 'SHIPPED').subscribe((order) => {
      expect(order.id).toBe(8);
    });

    const req = httpMock.expectOne('/api/orders/8/status');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'SHIPPED' });
    req.flush({ id: 8, status: 'SHIPPED', items: [] });
  });

  it('should handle error when creating order', () => {
    let status = 0;

    service.createOrder({ userId: 'u1', items: [] }).subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne('/api/orders');
    req.flush({ message: 'invalid' }, { status: 400, statusText: 'Bad Request' });

    expect(status).toBe(400);
  });
});
