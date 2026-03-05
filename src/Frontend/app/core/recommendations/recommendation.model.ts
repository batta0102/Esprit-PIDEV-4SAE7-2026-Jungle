/**
 * Recommendation Product Model
 * Represents a product recommendation from the API Gateway
 */
export interface RecommendationProduct {
  id: number;
  title: string;
  category: string;
  avgRating: number;
  ratingCount: number;
  ordersCount: number;
  score: number;
}
