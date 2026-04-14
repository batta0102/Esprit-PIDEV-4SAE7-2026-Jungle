import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET backend1 endpoint', () => {
    const response = { ok: true };

    service.getBackend1Data('users').subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpMock.expectOne('/api/backend1/users');
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should call POST backend1 endpoint', () => {
    const payload = { name: 'test' };

    service.postBackend1Data('users', payload).subscribe();

    const req = httpMock.expectOne('/api/backend1/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it('should call GET backend2 endpoint', () => {
    service.getBackend2Data('products').subscribe();

    const req = httpMock.expectOne('/api/backend2/products');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should handle error for backend2 POST', () => {
    let status = 0;

    service.postBackend2Data('products', { title: 'p1' }).subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne('/api/backend2/products');
    req.flush({ message: 'bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(status).toBe(400);
  });
});