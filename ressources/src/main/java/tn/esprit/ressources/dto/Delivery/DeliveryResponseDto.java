package tn.esprit.ressources.dto.Delivery;

import java.time.LocalDateTime;

public record DeliveryResponseDto(
        Long id,
        String status,
        String deliveryAddress,
        String trackingNumber,
        LocalDateTime assignedAt,
        Long assignedUserId,
        UserDto assignedUser,
        String customerUserId
) {
}
