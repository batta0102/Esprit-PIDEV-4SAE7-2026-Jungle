import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DeliveryTrackingService } from './delivery-tracking.service';

describe('DeliveryTrackingService', () => {
  let service: DeliveryTrackingService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8085';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(DeliveryTrackingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load current user profile', () => {
    service.getCurrentUserProfile().subscribe((profile) => {
      expect(profile.id).toBe(1);
      expect(profile.role).toBe('LIVREUR');
    });

    const req = httpMock.expectOne(`${base}/api/users/me/profile`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, role: 'LIVREUR' });
  });

  it('should load delivery tracking', () => {
    service.getDeliveryTracking(11).subscribe((tracking) => {
      expect(tracking.deliveryId).toBe(11);
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/11/tracking`);
    expect(req.request.method).toBe('GET');
    req.flush({ deliveryId: 11, deliveryStatus: 'ASSIGNED' });
  });

  it('should update livreur location', () => {
    const body = { currentLat: 35.8, currentLng: 10.6 };

    service.updateLivreurLocation(9, body).subscribe();

    const req = httpMock.expectOne(`${base}/api/users/9/location`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(null);
  });

  it('should sync delivery location', () => {
    const body = { currentLat: 36.8, currentLng: 11.6 };

    service.syncDeliveryLocation(7, body).subscribe();

    const req = httpMock.expectOne(`${base}/api/deliveries/livreurs/7/location`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(null);
  });

  it('should assign livreur to delivery', () => {
    service.assignLivreurToDelivery(8, 3).subscribe();

    const req = httpMock.expectOne(`${base}/api/deliveries/8/assign-livreur`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ assignedUserId: 3 });
    req.flush(null);
  });

  it('should load my deliveries tracking', () => {
    service.getMyDeliveriesTracking().subscribe((items) => {
      expect(items.length).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/my/tracking`);
    expect(req.request.method).toBe('GET');
    req.flush([{ deliveryId: 20 }]);
  });

  it('should load assigned deliveries tracking', () => {
    service.getAssignedDeliveriesTracking(5).subscribe((items) => {
      expect(items.length).toBe(2);
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/livreurs/5/tracking`);
    expect(req.request.method).toBe('GET');
    req.flush([{ deliveryId: 1 }, { deliveryId: 2 }]);
  });

  it('should handle error when loading tracking', () => {
    let status = 0;

    service.getDeliveryTracking(99).subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/99/tracking`);
    req.flush({ message: 'server error' }, { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
  });
});
