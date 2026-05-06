package tn.esprit.userservice.web.dto;

import tn.esprit.userservice.entity.UserRole;

public record UserSummaryDto(
        Long id,
        String fullName,
        String email,
        String phone,
        UserRole role
) {
}
