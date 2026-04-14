import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ReviewPayload, ReviewService } from './review.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load reviews by resource', () => {
    service.getReviewsByResource(3).subscribe((reviews) => {
      expect(reviews.length).toBe(1);
      expect(reviews[0].idReview).toBe(10);
    });

    const req = httpMock.expectOne('/api/reviews/getReviewsByResource/3');
    expect(req.request.method).toBe('GET');
    req.flush([{ idReview: 10, rating: 5, comment: 'Great' }]);
  });

  it('should load all reviews', () => {
    service.getAllReviews().subscribe((reviews) => {
      expect(reviews.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/reviews/allReview');
    expect(req.request.method).toBe('GET');
    req.flush([{ idReview: 1 }, { idReview: 2 }]);
  });

  it('should add review', () => {
    const payload: ReviewPayload = {
      rating: 4,
      comment: 'Nice',
      resource: { resourceId: 6 }
    };

    service.addReview(payload).subscribe((review) => {
      expect(review.idReview).toBe(99);
    });

    const req = httpMock.expectOne('/api/reviews/addReview');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ idReview: 99, ...payload });
  });

  it('should update review', () => {
    const payload: ReviewPayload = {
      rating: 3,
      comment: 'Updated',
      resource: { resourceId: 2 }
    };

    service.updateReview(4, payload).subscribe();

    const req = httpMock.expectOne('/api/reviews/updateReview/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ idReview: 4, ...payload });
  });

  it('should delete review', () => {
    service.deleteReview(7).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('/api/reviews/deleteReview/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle error when deleting review', () => {
    let status = 0;

    service.deleteReview(70).subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne('/api/reviews/deleteReview/70');
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
  });
});
