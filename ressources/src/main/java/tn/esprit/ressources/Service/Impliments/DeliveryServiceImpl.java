package tn.esprit.ressources.Service.Impliments;

import feign.FeignException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.ressources.Entites.Delivery;
import tn.esprit.ressources.Entites.Order;
import tn.esprit.ressources.Repository.DeliveryRepository;
import tn.esprit.ressources.Repository.OrderRepository;
import tn.esprit.ressources.Service.Interface.DeliveryService;
import tn.esprit.ressources.client.UserClient;
import tn.esprit.ressources.dto.Delivery.AssignDeliveryRequestDto;
import tn.esprit.ressources.dto.Delivery.DeliveryResponseDto;
import tn.esprit.ressources.dto.Delivery.DeliveryTrackingDto;
import tn.esprit.ressources.dto.Delivery.UserDto;
import tn.esprit.ressources.dto.Delivery.UpdateLivreurLocationRequestDto;
import tn.esprit.ressources.dto.user.UserClientDto;
import tn.esprit.ressources.exception.DeliveryNotAssignedException;
import tn.esprit.ressources.exception.DeliveryNotFoundException;
import tn.esprit.ressources.exception.InvalidLivreurException;
import tn.esprit.ressources.exception.UserNotFoundException;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {
    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final UserClient userClient;

    @Override
    public DeliveryResponseDto createDelivery(Delivery delivery) {
        if (delivery == null || delivery.getOrder() == null || delivery.getOrder().getId() == null) {
            throw new IllegalArgumentException("Payload must include order.id");
        }

        Long orderId = delivery.getOrder().getId();
        Order managedOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id=" + orderId));

        delivery.setOrder(managedOrder);
        delivery.setUserId(managedOrder.getUserId());

        if (delivery.getTrackingNumber() == null || delivery.getTrackingNumber().isBlank()) {
            delivery.setTrackingNumber(generateUniqueTrackingNumber());
        } else if (deliveryRepository.existsByTrackingNumber(delivery.getTrackingNumber())) {
            throw new IllegalArgumentException("Tracking number already exists");
        }

        delivery.setCurrentLat(null);
        delivery.setCurrentLng(null);
        delivery.setLastLocationUpdate(null);

        Delivery savedDelivery = deliveryRepository.save(delivery);

        String customerEmail = managedOrder.getUserEmail();
        if (customerEmail != null && !customerEmail.isBlank()) {
            try {
                emailService.sendTrackingNumber(customerEmail, savedDelivery.getTrackingNumber());
            } catch (Exception ignored) {
                // Delivery creation must not fail because of email delivery issues.
            }
        }

        return toDeliveryResponse(savedDelivery);
    }

    @Override
    public DeliveryResponseDto updateDelivery(Long id, Delivery delivery) {
        Delivery existing = findDelivery(id);

        existing.setDeliveryAddress(delivery.getDeliveryAddress());
        existing.setDeliveryStatus(delivery.getDeliveryStatus());
        existing.setDeliveryDate(delivery.getDeliveryDate());
        existing.setDeliveredAt(delivery.getDeliveredAt());

        if (delivery.getOrder() != null && delivery.getOrder().getId() != null) {
            Long orderId = delivery.getOrder().getId();
            Order managedOrder = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with id=" + orderId));
            existing.setOrder(managedOrder);
            existing.setUserId(managedOrder.getUserId());
        }

        return toDeliveryResponse(deliveryRepository.save(existing));
    }

    @Override
    public List<DeliveryResponseDto> getAllDeliveries() {
        return deliveryRepository.findAll().stream().map(this::toDeliveryResponse).toList();
    }

    @Override
    public DeliveryResponseDto getDeliveryById(Long id) {
        return toDeliveryResponse(findDelivery(id));
    }

    @Override
    public void deleteDelivery(Long id) {
        Delivery existing = findDelivery(id);
        deliveryRepository.delete(existing);
    }

    @Override
    public DeliveryResponseDto getDeliveryByTrackingNumber(String trackingNumber) {
        Delivery delivery = deliveryRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new DeliveryNotFoundException(trackingNumber));
        return toDeliveryResponse(delivery);
    }

    @Override
    public DeliveryResponseDto assignLivreurToDelivery(Long deliveryId, AssignDeliveryRequestDto request) {
        Delivery delivery = findDelivery(deliveryId);
        Long assignedUserId = request.assignedUserId();

        UserClientDto user = fetchUserById(assignedUserId);
        if (user == null || user.id() == null) {
            throw new UserNotFoundException(assignedUserId);
        }
        if (user.role() == null || !"LIVREUR".equalsIgnoreCase(user.role())) {
            throw new InvalidLivreurException(assignedUserId);
        }

        delivery.setAssignedUserId(assignedUserId);
        delivery.setAssignedAt(LocalDateTime.now());
        delivery.setAssignedUserName(user.fullName());
        delivery.setAssignedUserPhone(user.phone());
        delivery.setCurrentLat(user.currentLat());
        delivery.setCurrentLng(user.currentLng());
        delivery.setLastLocationUpdate(user.lastLocationUpdate());

        if (delivery.getDeliveryStatus() == null || delivery.getDeliveryStatus().isBlank()) {
            delivery.setDeliveryStatus("ASSIGNED");
        }

        Delivery saved = deliveryRepository.save(delivery);
        return toDeliveryResponse(saved, toUserDto(user));
    }

    @Override
    public DeliveryTrackingDto getTrackingByDeliveryId(Long deliveryId) {
        Delivery delivery = findDelivery(deliveryId);

        if (delivery.getAssignedUserId() == null) {
            throw new DeliveryNotAssignedException(deliveryId);
        }

        UserClientDto assignedUser = fetchUserByIdForTracking(delivery.getAssignedUserId());

        return new DeliveryTrackingDto(
                delivery.getIdDelivery(),
                delivery.getDeliveryStatus(),
                delivery.getAssignedUserId(),
            delivery.getAssignedUserName() != null ? delivery.getAssignedUserName() : assignedUser != null ? assignedUser.fullName() : null,
            delivery.getAssignedUserPhone() != null ? delivery.getAssignedUserPhone() : assignedUser != null ? assignedUser.phone() : null,
            delivery.getCurrentLat() != null ? delivery.getCurrentLat() : assignedUser != null ? assignedUser.currentLat() : null,
            delivery.getCurrentLng() != null ? delivery.getCurrentLng() : assignedUser != null ? assignedUser.currentLng() : null,
            delivery.getLastLocationUpdate() != null ? delivery.getLastLocationUpdate() : assignedUser != null ? assignedUser.lastLocationUpdate() : null,
                null,
                null
        );
    }

    @Override
    public List<DeliveryTrackingDto> getMyDeliveriesTracking(String userId) {
        return deliveryRepository.findByOrder_UserId(userId).stream().map(this::toTrackingDto).toList();
    }

    @Override
    public List<DeliveryTrackingDto> getAssignedDeliveriesTracking(Long assignedUserId) {
        return deliveryRepository.findByAssignedUserId(assignedUserId).stream().map(this::toTrackingDto).toList();
    }

    @Override
    public void updateLivreurLocation(Long livreurId, UpdateLivreurLocationRequestDto request) {
        List<Delivery> deliveries = deliveryRepository.findByAssignedUserId(livreurId);
        if (deliveries.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Delivery delivery : deliveries) {
            delivery.setCurrentLat(request.currentLat());
            delivery.setCurrentLng(request.currentLng());
            delivery.setLastLocationUpdate(now);
        }

        deliveryRepository.saveAll(deliveries);
    }

    private DeliveryTrackingDto toTrackingDto(Delivery delivery) {
        if (delivery.getAssignedUserId() == null) {
            return new DeliveryTrackingDto(
                    delivery.getIdDelivery(),
                    delivery.getDeliveryStatus(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }

            UserClientDto assignedUser = fetchUserByIdForTracking(delivery.getAssignedUserId());
        return new DeliveryTrackingDto(
                delivery.getIdDelivery(),
                delivery.getDeliveryStatus(),
                delivery.getAssignedUserId(),
                delivery.getAssignedUserName() != null ? delivery.getAssignedUserName() : assignedUser != null ? assignedUser.fullName() : null,
                delivery.getAssignedUserPhone() != null ? delivery.getAssignedUserPhone() : assignedUser != null ? assignedUser.phone() : null,
                delivery.getCurrentLat() != null ? delivery.getCurrentLat() : assignedUser != null ? assignedUser.currentLat() : null,
                delivery.getCurrentLng() != null ? delivery.getCurrentLng() : assignedUser != null ? assignedUser.currentLng() : null,
                delivery.getLastLocationUpdate() != null ? delivery.getLastLocationUpdate() : assignedUser != null ? assignedUser.lastLocationUpdate() : null,
                null,
                null
        );
    }

    private Delivery findDelivery(Long id) {
        return deliveryRepository.findById(id).orElseThrow(() -> new DeliveryNotFoundException(id));
    }

    private UserClientDto fetchUserById(Long userId) {
        try {
            return userClient.getUserById(userId);
        } catch (FeignException.NotFound ex) {
            throw new UserNotFoundException(userId);
        }
    }

    private UserClientDto fetchUserByIdForTracking(Long userId) {
        try {
            return userClient.getUserById(userId);
        } catch (FeignException ex) {
            return null;
        }
    }

    private DeliveryResponseDto toDeliveryResponse(Delivery delivery) {
        UserDto assigned = null;
        if (delivery.getAssignedUserId() != null) {
            assigned = toUserDto(fetchUserById(delivery.getAssignedUserId()));
        }
        return toDeliveryResponse(delivery, assigned);
    }

    private DeliveryResponseDto toDeliveryResponse(Delivery delivery, UserDto assignedUser) {
        return new DeliveryResponseDto(
                delivery.getIdDelivery(),
                delivery.getDeliveryStatus(),
                delivery.getDeliveryAddress(),
                delivery.getTrackingNumber(),
                delivery.getAssignedAt(),
                delivery.getAssignedUserId(),
                assignedUser,
                delivery.getUserId()
        );
    }

    private UserDto toUserDto(UserClientDto user) {
        return new UserDto(
                user.id(),
                user.fullName(),
                user.email(),
                user.phone(),
                user.role(),
                user.currentLat(),
                user.currentLng(),
                user.lastLocationUpdate()
        );
    }

    private String generateUniqueTrackingNumber() {
        String tracking;
        int attempts = 0;

        do {
            attempts++;
            if (attempts > 10) {
                throw new IllegalStateException("Failed to generate unique tracking number");
            }

            tracking = "TN-" + UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 16)
                    .toUpperCase();

        } while (deliveryRepository.existsByTrackingNumber(tracking));

        return tracking;
    }
}
