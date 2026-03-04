// Dans BuddySessionRepository.java, assure-toi d'avoir ces méthodes :

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.jungledraft.Entities.BuddySession;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BuddySessionRepository extends JpaRepository<BuddySession, Long> {
    
    /**
     * Trouve toutes les sessions pour un buddy pair
     */
    List<BuddySession> findByBuddyPairId(Long buddyPairId);
    
    /**
     * Trouve les sessions à venir pour un buddy pair (après la date actuelle)
     */
    List<BuddySession> findByBuddyPairIdAndDateAfterOrderByDateAsc(
        Long buddyPairId, LocalDateTime date
    );
    
    /**
     * Trouve les sessions passées pour un buddy pair (avant la date actuelle)
     */
    List<BuddySession> findByBuddyPairIdAndDateBeforeOrderByDateDesc(
        Long buddyPairId, LocalDateTime date
    );
    
    /**
     * Trouve les sessions par statut
     */
    List<BuddySession> findByStatus(String status);
    
    /**
     * Trouve les sessions pour un utilisateur spécifique
     */
    List<BuddySession> findByUserId1OrUserId2(Long userId1, Long userId2);
    
    /**
     * Compte les sessions par statut pour un buddy pair
     */
    long countByBuddyPairIdAndStatus(Long buddyPairId, String status);
}
