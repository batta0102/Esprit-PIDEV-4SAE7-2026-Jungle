import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../../shared/utils/url.helper';

export interface ReviewResourceRef {
  resourceId: number;
}

export interface Review {
  idReview: number;
  rating: number;
  comment: string;
  resource?: ReviewResourceRef;
  userId?: string;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
  resource: {
    resourceId: number;
  };
}

/**
 * Review Service
 * Handles all review-related API calls via API Gateway
 * All requests go through /api proxy to http://localhost:8085
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);

  /**
   * Get all reviews for a specific resource
   * GET /api/reviews/getReviewsByResource/{resourceId}
   */
  getReviewsByResource(resourceId: number): Observable<Review[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', `getReviewsByResource/${resourceId}`);
    console.log('[ReviewService] Fetching reviews for resource:', url);
    return this.http.get<Review[]>(url);
  }

  /**
   * Get all reviews (use sparingly)
   * GET /api/reviews/allReview
   */
  getAllReviews(): Observable<Review[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'allReview');
    console.log('[ReviewService] Fetching all reviews:', url);
    return this.http.get<Review[]>(url);
  }

  /**
   * Add a new review
   * POST /api/reviews/addReview
   */
  addReview(payload: ReviewPayload): Observable<Review> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'addReview');
    console.log('[ReviewService] Adding review:', url);
    return this.http.post<Review>(url, payload);
  }

  /**
   * Update an existing review
   * PUT /api/reviews/updateReview/{reviewId}
   */
  updateReview(reviewId: number, payload: ReviewPayload): Observable<Review> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', `updateReview/${reviewId}`);
    console.log('[ReviewService] Updating review:', url);
    return this.http.put<Review>(url, payload);
  }

  /**
   * Delete a review
   * DELETE /api/reviews/deleteReview/{reviewId}
   */
  deleteReview(reviewId: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', `deleteReview/${reviewId}`);
    console.log('[ReviewService] Deleting review:', url);
    return this.http.delete<void>(url);
  }
}
