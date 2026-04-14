import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { MyDeliveriesPage } from './my-deliveries.page';
import { AuthService } from '../../core/auth/auth.service';
import { DeliveryTrackingService } from '../../core/delivery-tracking/delivery-tracking.service';

describe('MyDeliveriesPage', () => {
  let fixture: ComponentFixture<MyDeliveriesPage>;
  let component: MyDeliveriesPage;
  let authMock: { currentUser: ReturnType<typeof vi.fn> };
  let trackingMock: { getMyDeliveriesTracking: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authMock = {
      currentUser: vi.fn().mockReturnValue({ name: 'John' })
    };

    trackingMock = {
      getMyDeliveriesTracking: vi.fn().mockReturnValue(of([{ deliveryId: 1, deliveryStatus: 'PENDING' }]))
    };

    await TestBed.configureTestingModule({
      imports: [MyDeliveriesPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: DeliveryTrackingService, useValue: trackingMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyDeliveriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load deliveries on init', () => {
    expect(trackingMock.getMyDeliveriesTracking).toHaveBeenCalled();
    expect(component.deliveries().length).toBe(1);
  });

  it('should expose user name', () => {
    expect(component.userName).toBe('John');
  });

  it('should handle load error', () => {
    trackingMock.getMyDeliveriesTracking.mockReturnValueOnce(throwError(() => ({ error: { message: 'no data' } })));

    component.loadMyDeliveries();

    expect(component.error()).toBe('no data');
    expect(component.loading()).toBe(false);
  });

  it('should return status css class', () => {
    expect(component.getStatusClass('DELIVERED')).toBe('status-delivered');
    expect(component.getStatusClass('UNKNOWN')).toBe('status-unknown');
  });
});