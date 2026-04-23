package tn.esprit.userservice.web.dto;

import jakarta.validation.constraints.Email;
import tn.esprit.userservice.entity.UserRole;
import tn.esprit.userservice.entity.UserStatus;

public record UpdateUserRequestDto(
        String fullName,
        @Email String email,
        String phone,
        String address,
        UserRole role,
        UserStatus status
) {
}
