package tn.esprit.ressources.dto.Delivery;

import java.time.LocalDateTime;

public record TrackingResponseDto(
        Long deliveryId,
        String deliveryStatus,
        String userId,
        Long livreurId,
        String livreurName,
        String livreurPhone,
        Double currentLat,
        Double currentLng,
        LocalDateTime lastLocationUpdate,
        LocalDateTime assignedAt,
        String message
) {
}
