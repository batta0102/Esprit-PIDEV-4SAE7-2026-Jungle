package tn.esprit.ressources.dto.Delivery;

import java.time.LocalDateTime;

public record AssignDeliveryResponseDto(
        Long deliveryId,
        Long livreurId,
        String livreurName,
        String status,
        LocalDateTime assignedAt,
        String message
) {
}
