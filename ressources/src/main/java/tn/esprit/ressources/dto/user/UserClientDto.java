package tn.esprit.ressources.dto.user;

import java.time.LocalDateTime;

public record UserClientDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String address,
        String role,
        Double currentLat,
        Double currentLng,
        LocalDateTime lastLocationUpdate
) {
}
