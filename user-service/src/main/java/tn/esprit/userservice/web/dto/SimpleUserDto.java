package tn.esprit.userservice.web.dto;

import tn.esprit.userservice.entity.UserRole;

public record SimpleUserDto(
        Long id,
        String fullName,
        String email,
        UserRole role
) {
}
