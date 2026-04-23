package tn.esprit.ressources.exception;

public class DeliveryNotAssignedException extends RuntimeException {
    public DeliveryNotAssignedException(Long deliveryId) {
        super("Delivery " + deliveryId + " is not assigned to a livreur");
    }
}
