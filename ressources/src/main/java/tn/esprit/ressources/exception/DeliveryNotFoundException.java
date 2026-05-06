package tn.esprit.ressources.exception;

public class DeliveryNotFoundException extends RuntimeException {
    public DeliveryNotFoundException(Long deliveryId) {
        super("Delivery not found with id=" + deliveryId);
    }

    public DeliveryNotFoundException(String trackingNumber) {
        super("Delivery not found with trackingNumber=" + trackingNumber);
    }
}
