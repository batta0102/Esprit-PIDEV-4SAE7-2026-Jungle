/**
 * Recommendation Product Model
 * Represents a product recommendation from the API Gateway
 * Backend returns top ordered products with ordersCount
 */
export interface RecommendationProduct {
  id: number;
  title: string;
  category: string;
  ordersCount: number;
  // Optional fields (may not be returned by backend)
  avgRating?: number;
  ratingCount?: number;
  score?: number;
}
