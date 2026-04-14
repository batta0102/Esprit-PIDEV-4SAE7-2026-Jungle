/**
 * Delivery Model
 * Represents delivery information from API Gateway
 */

/**
 * Order Reference for Delivery
 */
export interface DeliveryOrder {
  idOrder: number;
}

export interface AssignedUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: string | null;
}

/**
 * Delivery Interface
 * Maps to backend Spring Boot Delivery entity
 */
export interface Delivery {
  idDelivery?: number;
  deliveryAddress: string;
  deliveryStatus: string;
  deliveryDate?: string | Date;
  trackingNumber?: string;
  userId?: string;
  assignedUserId?: number | null;
  livreurId?: number | null;
  assignedUser?: AssignedUser | null;
  assignedAt?: string | null;
  deliveredAt?: string | null;
  order?: DeliveryOrder;
}

/**
 * Create Delivery Request
 * Payload for POST /deliveries/addDelivery
 */
export interface CreateDeliveryRequest {
  deliveryAddress: string;
  deliveryStatus: string;
  deliveryDate?: string;
  order: DeliveryOrder;
}

/**
 * Update Delivery Request
 * Payload for PUT /deliveries/updateDelivery/{id}
 */
export interface UpdateDeliveryRequest {
  deliveryAddress: string;
  deliveryStatus: string;
  deliveryDate?: string;
  order?: DeliveryOrder;
}

/**
 * Delivery Status enum
 */
export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;

export type DeliveryStatus = typeof DELIVERY_STATUS[keyof typeof DELIVERY_STATUS];
