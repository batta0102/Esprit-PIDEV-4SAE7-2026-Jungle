package tn.esprit.userservice.web.dto;

import java.time.LocalDateTime;
import tn.esprit.userservice.entity.UserStatus;

public record LivreurResponseDto(
        Long id,
        String fullName,
        String email,
        String phone,
        UserStatus status,
        Double currentLat,
        Double currentLng,
        LocalDateTime lastLocationUpdate
) {
}
