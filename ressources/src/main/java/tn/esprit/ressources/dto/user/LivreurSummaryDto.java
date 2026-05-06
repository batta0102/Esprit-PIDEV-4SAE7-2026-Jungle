package tn.esprit.ressources.dto.user;

public record LivreurSummaryDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String role
) {
}
