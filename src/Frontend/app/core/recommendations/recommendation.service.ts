import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { RecommendationProduct } from './recommendation.model';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../../shared/utils/url.helper';

/**
 * Mock recommendations for demo/testing
 * These will be returned when the backend doesn't have real data
 */
const MOCK_RECOMMENDATIONS: RecommendationProduct[] = [
  {
    id: 1,
    title: 'English Grammar Mastery',
    category: 'Books',
    avgRating: 4.8,
    ratingCount: 145,
    ordersCount: 523,
    score: 9.2
  },
  {
    id: 2,
    title: 'Conversational English Series',
    category: 'PDF',
    avgRating: 4.6,
    ratingCount: 89,
    ordersCount: 312,
    score: 8.9
  },
  {
    id: 3,
    title: 'English Pronunciation Guide',
    category: 'EBook',
    avgRating: 4.7,
    ratingCount: 156,
    ordersCount: 441,
    score: 8.7
  },
  {
    id: 4,
    title: 'Business English for Professionals',
    category: 'Books',
    avgRating: 4.9,
    ratingCount: 203,
    ordersCount: 678,
    score: 9.4
  },
  {
    id: 5,
    title: 'IELTS Preparation Course',
    category: 'MP3',
    avgRating: 4.7,
    ratingCount: 267,
    ordersCount: 891,
    score: 9.1
  },
  {
    id: 6,
    title: 'Advanced Vocabulary Builder',
    category: 'EBook',
    avgRating: 4.5,
    ratingCount: 112,
    ordersCount: 289,
    score: 8.5
  }
];

/**
 * Recommendation Service
 * Handles all recommendation-related API calls to API Gateway via proxy
 * 
 * Proxy configuration: /api -> http://localhost:8085/api
 * All requests use environment.apiBaseUrl (/api) to avoid CORS
 * 
 * Example: GET /api/recommendations/me -> http://localhost:8085/api/recommendations/me
 */
@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly http = inject(HttpClient);

  /**
   * HTTP Headers for JSON requests
   */
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  /**
   * Get recommendations for the current user (from JWT token)
   * GET /api/recommendations/me?limit={limit}
   * 
   * Falls back to mock recommendations if the API returns empty
   * 
   * @param limit - Number of recommendations to return (default: 10)
   * @returns Observable<RecommendationProduct[]>
   */
  getRecommendationsForMe(limit: number = 10): Observable<RecommendationProduct[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'recommendations', `me?limit=${limit}`);
    console.log(`[RecommendationService] Fetching recommendations for current user: ${url}`);
    
    return this.http.get<RecommendationProduct[]>(url, this.httpOptions).pipe(
      tap(recommendations => {
        console.log(`[RecommendationService] Loaded ${recommendations.length} recommendations for current user`);
      }),
      map(recommendations => {
        // If backend returns empty array, show mock data for demo
        if (!recommendations || recommendations.length === 0) {
          console.log('[RecommendationService] Backend returned empty, using mock data for demo');
          return MOCK_RECOMMENDATIONS.slice(0, limit);
        }
        return recommendations;
      }),
      catchError(error => {
        console.error('[RecommendationService] Error loading recommendations for current user:', error);
        console.error('[RecommendationService] Request URL:', url);
        console.error('[RecommendationService] Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        // Fallback to mock data on error for demo
        console.log('[RecommendationService] Using mock data as fallback');
        return of(MOCK_RECOMMENDATIONS.slice(0, limit));
      })
    );
  }

  /**
   * Get similar product recommendations
   * GET /api/recommendations/product/{id}?limit={limit}
   * 
   * Falls back to random mock recommendations if the API returns empty
   * 
   * @param productId - ID of the product to find recommendations for
   * @param limit - Number of recommendations to return (default: 6)
   * @returns Observable<RecommendationProduct[]>
   */
  getRecommendationsForProduct(productId: number, limit: number = 6): Observable<RecommendationProduct[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'recommendations', `product/${productId}?limit=${limit}`);
    console.log(`[RecommendationService] Fetching similar products for product ${productId}: ${url}`);
    
    return this.http.get<RecommendationProduct[]>(url, this.httpOptions).pipe(
      tap(recommendations => {
        console.log(`[RecommendationService] Loaded ${recommendations.length} similar products for product ${productId}`);
      }),
      map(recommendations => {
        // If backend returns empty array, show random mock data for demo
        if (!recommendations || recommendations.length === 0) {
          console.log('[RecommendationService] Backend returned empty, using mock data for demo');
          // Shuffle and return random mock recommendations
          return this.getRandomMockData(limit);
        }
        return recommendations;
      }),
      catchError(error => {
        console.error(`[RecommendationService] Error loading recommendations for product ${productId}:`, error);
        console.error('[RecommendationService] Request URL:', url);
        console.error('[RecommendationService] Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        // Fallback to random mock data on error for demo
        console.log('[RecommendationService] Using mock data as fallback');
        return of(this.getRandomMockData(limit));
      })
    );
  }

  /**
   * Get random mock recommendations for demo
   * Shuffles the mock data array and returns the requested number of items
   */
  private getRandomMockData(limit: number): RecommendationProduct[] {
    const shuffled = [...MOCK_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
}
