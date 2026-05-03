/** One row from GET /api/v1/3d-models/search (field names may vary by backend). */
export interface ThreeDModelSearchHit {
  uid: string;
  name: string;
  thumbnailUrl?: string;
}
