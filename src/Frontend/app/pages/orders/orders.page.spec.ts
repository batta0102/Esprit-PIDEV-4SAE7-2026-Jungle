import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { OrdersPage } from './orders.page';
import { AuthService } from '../../core/auth/auth.service';
import { OrderService } from '../../shared/order/order';

describe('OrdersPage', () => {
  let fixture: ComponentFixture<OrdersPage>;
  let component: OrdersPage;
  let authMock: { currentUser: ReturnType<typeof vi.fn> };
  let orderMock: {
    getOrdersByUserId: ReturnType<typeof vi.fn>;
    getAllOrders: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authMock = {
      currentUser: vi.fn().mockReturnValue({ id: 'u1', role: 'ETUDIANT' })
    };

    orderMock = {
      getOrdersByUserId: vi.fn().mockReturnValue(of([{ id: 1 }])) ,
      getAllOrders: vi.fn().mockReturnValue(of([{ id: 2 }]))
    };

    await TestBed.configureTestingModule({
      imports: [OrdersPage],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: OrderService, useValue: orderMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user orders when user id exists', () => {
    expect(orderMock.getOrdersByUserId).toHaveBeenCalledWith('u1');
    expect(component.orders().length).toBe(1);
  });

  it('should load all orders when user id is missing', () => {
    authMock.currentUser.mockReturnValue({ id: '', role: 'ETUDIANT' });

    component.loadOrders();

    expect(orderMock.getAllOrders).toHaveBeenCalled();
  });

  it('should block orders page for LIVREUR role', () => {
    authMock.currentUser.mockReturnValue({ id: 'u2', role: 'LIVREUR' });

    component.loadOrders();

    expect(component.error()).toContain('Livreur accounts');
    expect(component.loading()).toBe(false);
  });

  it('should handle error while loading orders', () => {
    orderMock.getOrdersByUserId.mockReturnValueOnce(throwError(() => ({ error: { message: 'fail' } })));

    component.loadOrders();

    expect(component.error()).toBe('fail');
    expect(component.loading()).toBe(false);
  });
});
