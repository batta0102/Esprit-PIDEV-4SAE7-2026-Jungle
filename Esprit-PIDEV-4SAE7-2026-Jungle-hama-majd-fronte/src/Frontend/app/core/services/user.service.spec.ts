import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const base = 'http://localhost:8085';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load all livreurs', () => {
    service.getAllLivreurs().subscribe((items) => {
      expect(items.length).toBe(1);
      expect(items[0].id).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/api/users/livreurs`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, fullName: 'Driver One' }]);
  });

  it('should load livreur by id', () => {
    service.getLivreurById(2).subscribe((user) => {
      expect(user.id).toBe(2);
    });

    const req = httpMock.expectOne(`${base}/api/users/livreurs/2`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 2, fullName: 'Driver Two' });
  });

  it('should update livreur location', () => {
    const payload = { currentLat: 33, currentLng: 9 };

    service.updateLivreurLocation(2, payload).subscribe();

    const req = httpMock.expectOne(`${base}/api/users/2/location`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 2, ...payload });
  });

  it('should handle error when loading livreur by id', () => {
    let status = 0;

    service.getLivreurById(404).subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne(`${base}/api/users/livreurs/404`);
    req.flush({}, { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
  });
});
