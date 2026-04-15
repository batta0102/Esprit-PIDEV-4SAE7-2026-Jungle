import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Frontend/app/environments/environment';
import { buildApiUrl } from '../../../Frontend/app/shared/utils/url.helper';

export interface Review {
  idReview?: number;
  comment: string;
  rating: number;
  resource: {
    resourceId: number;
  };
}

/**
 * Review Service - Backend Admin
 * Handles all review-related API calls through API Gateway
 * Routes all requests through: http://localhost:8085
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);

  /**
   * Get all reviews for a specific resource
   * GET /api/reviews/getReviewsByResource/{resourceId}
   */
  getReviewsByResource(resourceId: number): Observable<Review[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'getReviewsByResource', resourceId.toString());
    return this.http.get<Review[]>(url);
  }

  /**
   * Get all reviews (admin/management use)
   * GET /api/reviews/getAllReviews
   */
  getAllReviews(): Observable<Review[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'getAllReviews');
    return this.http.get<Review[]>(url);
  }

  /**
   * Add a new review
   * POST /api/reviews/addReview
   */
  addReview(review: Review): Observable<Review> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'addReview');
    return this.http.post<Review>(url, review);
  }

  /**
   * Update an existing review
   * PUT /api/reviews/updateReview/{reviewId}
   */
  updateReview(reviewId: number, review: Review): Observable<Review> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'updateReview', reviewId.toString());
    return this.http.put<Review>(url, review);
  }

  /**
   * Delete a review
   * DELETE /api/reviews/deleteReview/{reviewId}
   */
  deleteReview(reviewId: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'deleteReview', reviewId.toString());
    return this.http.delete<void>(url);
  }
}
