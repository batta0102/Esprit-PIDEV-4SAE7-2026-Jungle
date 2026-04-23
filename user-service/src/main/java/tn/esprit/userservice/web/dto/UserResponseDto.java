package tn.esprit.userservice.web.dto;

import java.time.LocalDateTime;
import tn.esprit.userservice.entity.UserRole;
import tn.esprit.userservice.entity.UserStatus;

public record UserResponseDto(
        Long id,
        String keycloakUserId,
        String fullName,
        String email,
        String phone,
        String address,
        UserRole role,
        UserStatus status,
        Double currentLat,
        Double currentLng,
        LocalDateTime lastLocationUpdate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
