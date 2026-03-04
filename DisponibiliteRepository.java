// Dans DisponibiliteRepository.java, assure-toi d'avoir ces méthodes :

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.jungledraft.Entities.Disponibilite;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {
    
    /**
     * Trouve toutes les disponibilités pour un buddy pair
     */
    List<Disponibilite> findByBuddyPairId(Long buddyPairId);
    
    /**
     * Trouve les disponibilités pour un buddy pair dans une période donnée
     */
    List<Disponibilite> findByBuddyPairIdAndDebutBetween(Long buddyPairId, LocalDateTime debut, LocalDateTime fin);
    
    /**
     * Trouve les disponibilités pour un utilisateur spécifique
     */
    List<Disponibilite> findByUserId(Long userId);
    
    /**
     * Vérifie si une disponibilité existe pour un buddy pair à une période donnée
     */
    boolean existsByBuddyPairIdAndDebutLessThanEqualAndFinGreaterThanEqual(
        Long buddyPairId, LocalDateTime fin, LocalDateTime debut
    );
}
