package tn.esprit.userservice.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import tn.esprit.userservice.entity.UserRole;
import tn.esprit.userservice.entity.UserStatus;

public record CreateUserRequestDto(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        String password,
        String phone,
        String address,
        UserRole role,
        UserStatus status,
        Boolean enabled
) {
}
