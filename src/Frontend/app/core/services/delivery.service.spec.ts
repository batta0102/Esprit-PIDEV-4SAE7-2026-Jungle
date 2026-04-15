import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DeliveryService } from './delivery.service';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8085';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load all deliveries', () => {
    const mock = [{ id: 1, status: 'PENDING' }];

    service.getAllDeliveries().subscribe((data) => {
      expect(data).toEqual(mock as any);
    });

    const req = httpMock.expectOne(`${base}/api/deliveries`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should load delivery by id', () => {
    service.getDeliveryById(4).subscribe((data) => {
      expect(data.id).toBe(4 as any);
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/4`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 4, status: 'ASSIGNED' });
  });

  it('should call assign livreur', () => {
    service.assignLivreurToDelivery(10, 7).subscribe();

    const req = httpMock.expectOne(`${base}/api/deliveries/10/assign-livreur`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ assignedUserId: 7 });
    req.flush({ id: 10 });
  });

  it('should load tracking by delivery id', () => {
    service.getTrackingByDeliveryId(2).subscribe((data) => {
      expect(data.deliveryId).toBe(2);
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/2/tracking`);
    expect(req.request.method).toBe('GET');
    req.flush({ deliveryId: 2, deliveryStatus: 'IN_TRANSIT' });
  });

  it('should load delivery by tracking number', () => {
    service.getDeliveryByTrackingNumber('TRK-123').subscribe((data) => {
      expect(data.id).toBe(6 as any);
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/track/TRK-123`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 6, status: 'PENDING' });
  });

  it('should handle error when loading delivery by id', () => {
    let status = 0;

    service.getDeliveryById(999).subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne(`${base}/api/deliveries/999`);
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
  });
});
