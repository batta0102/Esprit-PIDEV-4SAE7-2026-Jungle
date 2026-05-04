import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RecommendationService } from './recommendation.service';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(RecommendationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load recommendations for current user', () => {
    service.getRecommendationsForMe(2).subscribe((items) => {
      expect(items.length).toBe(2);
      expect(items[0].id).toBe(10);
    });

    const req = httpMock.expectOne('/api/recommendations/me?limit=2');
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 10, title: 'T1', category: 'Books', ordersCount: 4 },
      { id: 20, title: 'T2', category: 'PDF', ordersCount: 6 }
    ]);
  });

  it('should return fallback mock data when me endpoint returns empty list', () => {
    service.getRecommendationsForMe(3).subscribe((items) => {
      expect(items.length).toBe(3);
      expect(items[0].title).toContain('English');
    });

    const req = httpMock.expectOne('/api/recommendations/me?limit=3');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should return fallback top3 on server error', () => {
    service.getTop3MostOrderedProducts().subscribe((items) => {
      expect(items.length).toBe(3);
    });

    const req = httpMock.expectOne('/api/recommendations/top3');
    expect(req.request.method).toBe('GET');
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('should load similar products by product id', () => {
    service.getRecommendationsForProduct(7, 2).subscribe((items) => {
      expect(items.length).toBe(2);
      expect(items[1].id).toBe(71);
    });

    const req = httpMock.expectOne('/api/recommendations/product/7?limit=2');
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 70, title: 'A', category: 'Books', ordersCount: 10 },
      { id: 71, title: 'B', category: 'Books', ordersCount: 8 }
    ]);
  });

  it('should return fallback random recommendations on error for product endpoint', () => {
    service.getRecommendationsForProduct(7, 4).subscribe((items) => {
      expect(items.length).toBe(4);
    });

    const req = httpMock.expectOne('/api/recommendations/product/7?limit=4');
    expect(req.request.method).toBe('GET');
    req.flush({}, { status: 404, statusText: 'Not Found' });
  });
});
