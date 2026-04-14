export interface DeliveryTrackingResponse {
  deliveryId: number;
  deliveryStatus: string;
  assignedUserId: number | null;
  trackingNumber?: string | null;
  deliveryAddress?: string | null;
  livreurName: string | null;
  livreurPhone: string | null;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
  destinationLat: number | null;
  destinationLng: number | null;

  // Backward compatibility for existing pages.
  livreurId?: number | null;
  userId?: string | null;
  assignedAt?: string | null;
  message?: string;
}

export interface UpdateLivreurLocationRequest {
  currentLat: number;
  currentLng: number;
}
