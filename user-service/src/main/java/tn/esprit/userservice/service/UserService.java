package tn.esprit.userservice.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.entity.UserRole;
import tn.esprit.userservice.repository.UserRepository;
import tn.esprit.userservice.service.mapper.UserMapper;
import tn.esprit.userservice.web.dto.CreateUserRequestDto;
import tn.esprit.userservice.web.dto.LivreurResponseDto;
import tn.esprit.userservice.web.dto.SimpleUserDto;
import tn.esprit.userservice.web.dto.UpdateLivreurLocationRequestDto;
import tn.esprit.userservice.web.dto.UpdateUserRequestDto;
import tn.esprit.userservice.web.dto.UserResponseDto;
import tn.esprit.userservice.web.dto.UserSummaryDto;
import tn.esprit.userservice.web.exception.BadRequestException;
import tn.esprit.userservice.web.exception.NotFoundException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakIdentityService keycloakIdentityService;
    private final UserMapper userMapper;

    public UserService(
            UserRepository userRepository,
            KeycloakIdentityService keycloakIdentityService,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.keycloakIdentityService = keycloakIdentityService;
        this.userMapper = userMapper;
    }

    @Transactional
    public UserResponseDto createUser(CreateUserRequestDto request) {
        UserRole role = request.role() == null ? UserRole.ETUDIANT : request.role();

        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new BadRequestException("Email already exists");
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        String keycloakUserId = keycloakIdentityService.createUserInKeycloak(
                request.fullName(),
                normalizedEmail,
                request.password(),
                request.enabled()
        );
        keycloakIdentityService.assignRealmRole(keycloakUserId, role);

        User user = new User();
        user.setKeycloakUserId(keycloakUserId);
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(request.password());
        user.setPhone(request.phone());
        user.setAddress(request.address());
        user.setRole(role);
        user.setStatus(request.status());

        applyLivreurBusinessRules(user);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponseDto createLivreurAccount(CreateUserRequestDto request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("Password is required for LIVREUR account creation");
        }

        CreateUserRequestDto livreurRequest = new CreateUserRequestDto(
                request.fullName(),
                request.email(),
                request.password(),
                request.phone(),
                request.address(),
                UserRole.LIVREUR,
                request.status(),
                request.enabled()
        );

        return createUser(livreurRequest);
    }

    @Transactional
    public UserResponseDto updateUser(Long id, UpdateUserRequestDto request) {
        User user = getEntityById(id);

        if (request.email() != null && !request.email().isBlank()) {
            String newEmail = request.email().trim().toLowerCase();
            userRepository.findByEmail(newEmail)
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new BadRequestException("Email already exists");
                    });
            user.setEmail(newEmail);
        }

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.address() != null) {
            user.setAddress(request.address());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.status() != null) {
            user.setStatus(request.status());
        }

        if (user.getKeycloakUserId() != null) {
            keycloakIdentityService.updateUserInKeycloak(user.getKeycloakUserId(), user.getFullName(), user.getEmail());
        }

        applyLivreurBusinessRules(user);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    public List<LivreurResponseDto> getAllLivreurs() {
        return userRepository.findByRole(UserRole.LIVREUR).stream().map(userMapper::toLivreurResponse).toList();
    }

    public UserResponseDto getUserById(Long id) {
        return userMapper.toUserResponse(getEntityById(id));
    }

    public LivreurResponseDto getLivreurById(Long id) {
        User user = getEntityById(id);
        if (user.getRole() != UserRole.LIVREUR) {
            throw new BadRequestException("User is not LIVREUR");
        }
        return userMapper.toLivreurResponse(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponseDto updateLivreurLocation(Long userId, UpdateLivreurLocationRequestDto request) {
        User user = getEntityById(userId);
        if (user.getRole() != UserRole.LIVREUR) {
            throw new BadRequestException("User is not LIVREUR");
        }

        user.setCurrentLat(request.currentLat());
        user.setCurrentLng(request.currentLng());
        user.setLastLocationUpdate(LocalDateTime.now());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public SimpleUserDto validateLivreur(Long userId) {
        User user = getEntityById(userId);
        if (user.getRole() != UserRole.LIVREUR) {
            throw new BadRequestException("User is not LIVREUR");
        }
        return userMapper.toSimpleUser(user);
    }

    public UserSummaryDto getLivreurSummary(Long userId) {
        User user = getEntityById(userId);
        if (user.getRole() != UserRole.LIVREUR) {
            throw new BadRequestException("User is not LIVREUR");
        }
        return userMapper.toSummary(user);
    }

    public UserResponseDto getCurrentUserProfile(String keycloakUserId) {
        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new NotFoundException("Current user not found"));
        return userMapper.toUserResponse(user);
    }

    public String getEmailByKeycloakUserId(String keycloakUserId) {
        return userRepository.findByKeycloakUserId(keycloakUserId)
                .map(User::getEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private User getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id=" + id));
    }

    private void applyLivreurBusinessRules(User user) {
        if (user.getRole() == UserRole.LIVREUR) {
            return;
        }

        user.setStatus(null);
        user.setCurrentLat(null);
        user.setCurrentLng(null);
        user.setLastLocationUpdate(null);
    }
}
