package tn.esprit.ressources.dto.Delivery;

import jakarta.validation.constraints.NotNull;

public record UpdateLivreurLocationRequestDto(
        @NotNull Double currentLat,
        @NotNull Double currentLng
) {
}