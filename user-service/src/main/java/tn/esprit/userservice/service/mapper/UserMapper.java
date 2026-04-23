package tn.esprit.userservice.service.mapper;

import org.springframework.stereotype.Component;
import tn.esprit.userservice.entity.User;
import tn.esprit.userservice.web.dto.LivreurResponseDto;
import tn.esprit.userservice.web.dto.SimpleUserDto;
import tn.esprit.userservice.web.dto.UserResponseDto;
import tn.esprit.userservice.web.dto.UserSummaryDto;

@Component
public class UserMapper {

    public UserResponseDto toUserResponse(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getKeycloakUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole(),
                user.getStatus(),
                user.getCurrentLat(),
                user.getCurrentLng(),
                user.getLastLocationUpdate(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public LivreurResponseDto toLivreurResponse(User user) {
        return new LivreurResponseDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus(),
                user.getCurrentLat(),
                user.getCurrentLng(),
                user.getLastLocationUpdate()
        );
    }

    public SimpleUserDto toSimpleUser(User user) {
        return new SimpleUserDto(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    public UserSummaryDto toSummary(User user) {
        return new UserSummaryDto(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole());
    }
}
