package tn.esprit.ressources.dto.user;

import java.time.LocalDateTime;

public record LivreurClientDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String status,
        Double currentLat,
        Double currentLng,
        LocalDateTime lastLocationUpdate
) {
}
