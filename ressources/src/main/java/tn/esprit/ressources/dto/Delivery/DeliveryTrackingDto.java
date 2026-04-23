package tn.esprit.ressources.dto.Delivery;

import java.time.LocalDateTime;

public record DeliveryTrackingDto(
        Long deliveryId,
        String deliveryStatus,
        Long assignedUserId,
        String livreurName,
        String livreurPhone,
        Double currentLat,
        Double currentLng,
        LocalDateTime lastLocationUpdate,
        Double destinationLat,
        Double destinationLng
) {
}
