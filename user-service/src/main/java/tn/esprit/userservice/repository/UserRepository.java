package tn.esprit.userservice.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.entity.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(UserRole role);

    Optional<User> findByKeycloakUserId(String keycloakUserId);

    boolean existsByEmail(String email);
}
