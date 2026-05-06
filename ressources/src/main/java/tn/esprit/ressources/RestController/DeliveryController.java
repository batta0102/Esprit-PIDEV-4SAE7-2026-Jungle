package tn.esprit.ressources.RestController;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.ressources.Entites.Delivery;
import tn.esprit.ressources.Service.Interface.DeliveryService;
import tn.esprit.ressources.dto.Delivery.AssignDeliveryRequestDto;
import tn.esprit.ressources.dto.Delivery.DeliveryResponseDto;
import tn.esprit.ressources.dto.Delivery.DeliveryTrackingDto;
import tn.esprit.ressources.dto.Delivery.UpdateLivreurLocationRequestDto;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<DeliveryResponseDto> createDelivery(@RequestBody Delivery delivery) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryService.createDelivery(delivery));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryResponseDto>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }

    @GetMapping("/{deliveryId}")
    public ResponseEntity<DeliveryResponseDto> getDeliveryById(@PathVariable Long deliveryId) {
        return ResponseEntity.ok(deliveryService.getDeliveryById(deliveryId));
    }

    @PutMapping("/{deliveryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponseDto> updateDelivery(@PathVariable Long deliveryId, @RequestBody Delivery delivery) {
        return ResponseEntity.ok(deliveryService.updateDelivery(deliveryId, delivery));
    }

    @DeleteMapping("/{deliveryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Long deliveryId) {
        deliveryService.deleteDelivery(deliveryId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{deliveryId}/assign-livreur")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponseDto> assignLivreurToDelivery(
            @PathVariable Long deliveryId,
            @Valid @RequestBody AssignDeliveryRequestDto request
    ) {
        return ResponseEntity.ok(deliveryService.assignLivreurToDelivery(deliveryId, request));
    }

    @GetMapping("/{deliveryId}/tracking")
    public ResponseEntity<DeliveryTrackingDto> getTrackingByDeliveryId(@PathVariable Long deliveryId) {
        return ResponseEntity.ok(deliveryService.getTrackingByDeliveryId(deliveryId));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<DeliveryResponseDto> getByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(deliveryService.getDeliveryByTrackingNumber(trackingNumber));
    }

    @GetMapping("/my/tracking")
    public ResponseEntity<List<DeliveryTrackingDto>> getMyTracking(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null || jwt.getSubject().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.ok(deliveryService.getMyDeliveriesTracking(jwt.getSubject()));
    }

    @GetMapping("/livreurs/{livreurId}/tracking")
    @PreAuthorize("hasAnyRole('ADMIN','LIVREUR')")
    public ResponseEntity<List<DeliveryTrackingDto>> getAssignedDeliveries(@PathVariable Long livreurId) {
        return ResponseEntity.ok(deliveryService.getAssignedDeliveriesTracking(livreurId));
    }

    @PutMapping("/livreurs/{livreurId}/location")
    @PreAuthorize("hasAnyRole('ADMIN','LIVREUR')")
    public ResponseEntity<Void> updateLivreurLocation(
            @PathVariable Long livreurId,
            @Valid @RequestBody UpdateLivreurLocationRequestDto request
    ) {
        deliveryService.updateLivreurLocation(livreurId, request);
        return ResponseEntity.noContent().build();
    }

    // Legacy aliases kept for backward compatibility with existing frontend pages.
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/addDelivery")
    public ResponseEntity<DeliveryResponseDto> createDeliveryLegacy(@RequestBody Delivery delivery) {
        return createDelivery(delivery);
    }

    @GetMapping("/Alldelivery")
    public ResponseEntity<List<DeliveryResponseDto>> getAllDeliveriesLegacy() {
        return getAllDeliveries();
    }

    @GetMapping("/getDelivery/{id}")
    public ResponseEntity<DeliveryResponseDto> getDeliveryLegacy(@PathVariable("id") Long deliveryId) {
        return getDeliveryById(deliveryId);
    }

    @PutMapping("/updateDelivery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponseDto> updateDeliveryLegacy(@PathVariable("id") Long deliveryId, @RequestBody Delivery delivery) {
        return updateDelivery(deliveryId, delivery);
    }

    @DeleteMapping("/deleteDelivery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDeliveryLegacy(@PathVariable("id") Long deliveryId) {
        return deleteDelivery(deliveryId);
    }

    @PutMapping("/{deliveryId}/assign/{livreurId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryResponseDto> assignLivreurLegacy(
            @PathVariable Long deliveryId,
            @PathVariable Long livreurId
    ) {
        return ResponseEntity.ok(deliveryService.assignLivreurToDelivery(
                deliveryId,
                new AssignDeliveryRequestDto(livreurId)
        ));
    }
}
