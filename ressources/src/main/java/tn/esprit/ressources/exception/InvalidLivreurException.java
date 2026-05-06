package tn.esprit.ressources.exception;

public class InvalidLivreurException extends RuntimeException {
    public InvalidLivreurException(Long userId) {
        super("User " + userId + " is not a LIVREUR");
    }
}
