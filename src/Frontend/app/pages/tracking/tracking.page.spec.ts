import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { TrackingPage } from './tracking.page';
import { DeliveryTrackingService } from '../../core/delivery-tracking/delivery-tracking.service';

describe('TrackingPage', () => {
  let fixture: ComponentFixture<TrackingPage>;
  let component: TrackingPage;
  const paramMap$ = new Subject<any>();

  const trackingMock = {
    getDeliveryTracking: vi.fn().mockReturnValue(
      of({
        deliveryId: 1,
        deliveryStatus: 'ASSIGNED',
        assignedUserId: 7,
        livreurName: 'Driver',
        livreurPhone: null,
        currentLat: 35.8,
        currentLng: 10.6,
        lastLocationUpdate: null,
        destinationLat: null,
        destinationLng: null
      })
    )
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable()
          }
        },
        { provide: DeliveryTrackingService, useValue: trackingMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingPage);
    component = fixture.componentInstance;
    vi.spyOn(component as any, 'initializeMap').mockImplementation(() => {});
    vi.spyOn(component as any, 'startAutoRefresh').mockImplementation(() => {});
    vi.spyOn(component as any, 'stopAutoRefresh').mockImplementation(() => {});
    vi.spyOn(component as any, 'updateDriverMarker').mockImplementation(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tracking on valid delivery id', () => {
    paramMap$.next(convertToParamMap({ deliveryId: '1' }));

    expect(trackingMock.getDeliveryTracking).toHaveBeenCalledWith(1);
    expect(component.tracking()?.deliveryId).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should handle invalid delivery id', () => {
    paramMap$.next(convertToParamMap({ deliveryId: 'invalid' }));

    expect(component.errorMessage()).toContain('Invalid delivery ID');
    expect(component.loading()).toBe(false);
  });

  it('should refresh tracking when refreshNow is called', () => {
    paramMap$.next(convertToParamMap({ deliveryId: '1' }));
    trackingMock.getDeliveryTracking.mockClear();

    component.refreshNow();

    expect(trackingMock.getDeliveryTracking).toHaveBeenCalledWith(1);
  });

  it('should handle tracking service error', () => {
    trackingMock.getDeliveryTracking.mockReturnValueOnce(throwError(() => ({ status: 500 })));
    paramMap$.next(convertToParamMap({ deliveryId: '2' }));

    expect(component.errorMessage()).toContain('Tracking service error');
    expect(component.loading()).toBe(false);
  });
});
