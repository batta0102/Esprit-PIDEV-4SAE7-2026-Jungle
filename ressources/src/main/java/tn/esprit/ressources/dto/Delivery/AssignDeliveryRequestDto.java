package tn.esprit.ressources.dto.Delivery;

import jakarta.validation.constraints.NotNull;

public record AssignDeliveryRequestDto(
        @NotNull Long assignedUserId
) {
}
