package tn.esprit.userservice.web;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import tn.esprit.userservice.entity.UserRole;
import tn.esprit.userservice.service.UserService;
import tn.esprit.userservice.web.dto.CreateUserRequestDto;
import tn.esprit.userservice.web.dto.CurrentUserResponse;
import tn.esprit.userservice.web.dto.LivreurResponseDto;
import tn.esprit.userservice.web.dto.SimpleUserDto;
import tn.esprit.userservice.web.dto.UpdateLivreurLocationRequestDto;
import tn.esprit.userservice.web.dto.UpdateUserRequestDto;
import tn.esprit.userservice.web.dto.UserResponseDto;
import tn.esprit.userservice.web.dto.UserSummaryDto;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal Jwt jwt) {
        String fullName = (jwt.getClaimAsString("name") == null || jwt.getClaimAsString("name").isBlank())
                ? jwt.getClaimAsString("preferred_username")
                : jwt.getClaimAsString("name");

        return new CurrentUserResponse(
                jwt.getSubject(),
                jwt.getClaimAsString("preferred_username"),
                jwt.getClaimAsString("email"),
                fullName,
                extractRoles(jwt)
        );
    }

    @GetMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> meProfile(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(jwt.getSubject()));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserRequestDto request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PostMapping("/livreurs/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> createLivreur(@Valid @RequestBody CreateUserRequestDto request) {
        return ResponseEntity.ok(userService.createLivreurAccount(request));
    }

    @GetMapping("/getAll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/getById/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ETUDIANT','TUTEUR','LIVREUR')")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDto request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/livreurs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LivreurResponseDto>> getAllLivreurs() {
        return ResponseEntity.ok(userService.getAllLivreurs());
    }

    @GetMapping("/livreurs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIVREUR')")
    public ResponseEntity<LivreurResponseDto> getLivreurById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getLivreurById(id));
    }

    @PutMapping("/livreurs/{id}/location")
    @PreAuthorize("hasAnyRole('ADMIN','LIVREUR')")
    public ResponseEntity<UserResponseDto> updateLivreurLocation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLivreurLocationRequestDto request
    ) {
        return ResponseEntity.ok(userService.updateLivreurLocation(id, request));
    }

    @PutMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('ADMIN','LIVREUR')")
    public ResponseEntity<UserResponseDto> updateUserLocation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLivreurLocationRequestDto request
    ) {
        return ResponseEntity.ok(userService.updateLivreurLocation(id, request));
    }

    @GetMapping("/livreurs/{id}/summary")
    @PreAuthorize("hasAnyRole('ADMIN','ETUDIANT','TUTEUR','LIVREUR')")
    public ResponseEntity<UserSummaryDto> getLivreurSummary(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getLivreurSummary(id));
    }

    @GetMapping("/livreurs/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN','ETUDIANT','TUTEUR','LIVREUR')")
    public ResponseEntity<SimpleUserDto> validateLivreur(@PathVariable Long id) {
        return ResponseEntity.ok(userService.validateLivreur(id));
    }

    @GetMapping("/{keycloakUserId}/email")
    @PreAuthorize("hasAnyRole('ADMIN','ETUDIANT','TUTEUR','LIVREUR')")
    public ResponseEntity<Map<String, String>> getEmailByKeycloakUserId(@PathVariable String keycloakUserId) {
        return ResponseEntity.ok(Map.of("email", userService.getEmailByKeycloakUserId(keycloakUserId)));
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signup(@Valid @RequestBody CreateUserRequestDto request) {
        CreateUserRequestDto normalizedRequest = new CreateUserRequestDto(
                request.fullName(),
                request.email(),
                request.password(),
                request.phone(),
                request.address(),
                request.role() == null ? UserRole.ETUDIANT : request.role(),
                request.status(),
                request.enabled()
        );
        return ResponseEntity.ok(userService.createUser(normalizedRequest));
    }

    private List<String> extractRoles(Jwt jwt) {
        java.util.Set<String> roles = new java.util.TreeSet<>();

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null) {
            Object roleObj = realmAccess.get("roles");
            if (roleObj instanceof List<?> roleList) {
                for (Object role : roleList) {
                    if (role instanceof String roleString && !roleString.isBlank()) {
                        roles.add(roleString);
                    }
                }
            }
        }

        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            for (Object clientEntry : resourceAccess.values()) {
                if (clientEntry instanceof Map<?, ?> clientAccess) {
                    Object roleObj = clientAccess.get("roles");
                    if (roleObj instanceof List<?> roleList) {
                        for (Object role : roleList) {
                            if (role instanceof String roleString && !roleString.isBlank()) {
                                roles.add(roleString);
                            }
                        }
                    }
                }
            }
        }

        return new ArrayList<>(roles);
    }
}
