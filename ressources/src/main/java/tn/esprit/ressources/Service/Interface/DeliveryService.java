package tn.esprit.ressources.Service.Interface;

import tn.esprit.ressources.Entites.Delivery;
import tn.esprit.ressources.dto.Delivery.AssignDeliveryRequestDto;
import tn.esprit.ressources.dto.Delivery.DeliveryResponseDto;
import tn.esprit.ressources.dto.Delivery.DeliveryTrackingDto;
import tn.esprit.ressources.dto.Delivery.UpdateLivreurLocationRequestDto;

import java.util.List;

public interface DeliveryService {
    DeliveryResponseDto createDelivery(Delivery delivery);

    List<DeliveryResponseDto> getAllDeliveries();

    DeliveryResponseDto getDeliveryById(Long id);

    DeliveryResponseDto updateDelivery(Long id, Delivery delivery);

    void deleteDelivery(Long id);

    DeliveryResponseDto getDeliveryByTrackingNumber(String trackingNumber);

    DeliveryResponseDto assignLivreurToDelivery(Long deliveryId, AssignDeliveryRequestDto request);

    DeliveryTrackingDto getTrackingByDeliveryId(Long deliveryId);

    List<DeliveryTrackingDto> getMyDeliveriesTracking(String userId);

    List<DeliveryTrackingDto> getAssignedDeliveriesTracking(Long assignedUserId);

    void updateLivreurLocation(Long livreurId, UpdateLivreurLocationRequestDto request);
}
