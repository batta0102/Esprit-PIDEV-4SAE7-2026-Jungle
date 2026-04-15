import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { LivreurSpacePage } from './livreur-space.page';
import { AuthService } from '../../core/auth/auth.service';
import { DeliveryTrackingService } from '../../core/delivery-tracking/delivery-tracking.service';

describe('LivreurSpacePage', () => {
  let fixture: ComponentFixture<LivreurSpacePage>;
  let component: LivreurSpacePage;

  let authMock: { init: ReturnType<typeof vi.fn> };
  let trackingMock: {
    getCurrentUserProfile: ReturnType<typeof vi.fn>;
    updateLivreurLocation: ReturnType<typeof vi.fn>;
    syncDeliveryLocation: ReturnType<typeof vi.fn>;
    getAssignedDeliveriesTracking: ReturnType<typeof vi.fn>;
  };

  const fakeGeolocation = {
    watchPosition: vi.fn().mockReturnValue(1),
    clearWatch: vi.fn(),
    getCurrentPosition: vi.fn((success) => {
      success({ coords: { latitude: 36.8, longitude: 10.1 } });
    })
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    authMock = {
      init: vi.fn().mockResolvedValue(undefined)
    };

    trackingMock = {
      getCurrentUserProfile: vi.fn().mockReturnValue(of({ id: 5, role: 'LIVREUR', currentLat: null, currentLng: null })),
      updateLivreurLocation: vi.fn().mockReturnValue(of(null)),
      syncDeliveryLocation: vi.fn().mockReturnValue(of(null)),
      getAssignedDeliveriesTracking: vi.fn().mockReturnValue(of([{ deliveryId: 11 }]))
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: fakeGeolocation,
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [LivreurSpacePage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: DeliveryTrackingService, useValue: trackingMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LivreurSpacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init auth and load profile on ngOnInit', async () => {
    await component.ngOnInit();

    expect(authMock.init).toHaveBeenCalled();
    expect(trackingMock.getCurrentUserProfile).toHaveBeenCalled();
  });

  it('should load assigned deliveries for livreur profile', async () => {
    await component.ngOnInit();

    expect(trackingMock.getAssignedDeliveriesTracking).toHaveBeenCalledWith(5);
    expect(component.deliveries().length).toBe(1);
  });

  it('should handle profile load error', async () => {
    trackingMock.getCurrentUserProfile.mockReturnValueOnce(throwError(() => ({ error: { message: 'profile error' } })));

    await component.ngOnInit();

    expect(component.error()).toBe('profile error');
    expect(component.loading()).toBe(false);
  });

  it('should map status class correctly', () => {
    expect(component.getStatusClass('DELIVERED')).toBe('status-delivered');
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('OTHER')).toBe('status-unknown');
  });

  it('should clear geolocation watch on destroy', () => {
    (component as any).watchId = 1;

    component.ngOnDestroy();

    expect(fakeGeolocation.clearWatch).toHaveBeenCalledWith(1);
  });
});