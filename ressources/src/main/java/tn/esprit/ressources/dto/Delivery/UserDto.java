package tn.esprit.ressources.dto.Delivery;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String role,
        Double currentLat,
        Double currentLng,
        LocalDateTime lastLocationUpdate
) {
}
