package tn.esprit.jungledraft.Repositories;

import tn.esprit.jungledraft.Entities.Disponibilite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {

    /**
     * Trouve les disponibilités par buddy pair ID (via la relation)
     */
    @Query("SELECT d FROM Disponibilite d WHERE d.buddyPair.idPair = :buddyPairId")
    List<Disponibilite> findByBuddyPairIdPair(@Param("buddyPairId") Long buddyPairId);

    /**
     * Trouve les disponibilités par buddy pair et période
     */
    @Query("SELECT d FROM Disponibilite d WHERE d.buddyPair.idPair = :buddyPairId AND d.debut BETWEEN :debut AND :fin")
    List<Disponibilite> findByBuddyPairIdPairAndDebutBetween(
        @Param("buddyPairId") Long buddyPairId, 
        @Param("debut") LocalDateTime debut, 
        @Param("fin") LocalDateTime fin
    );

    /**
     * Trouve les disponibilités par buddy pair et utilisateur
     */
    @Query("SELECT d FROM Disponibilite d WHERE d.buddyPair.idPair = :buddyPairId AND d.userId = :userId")
    List<Disponibilite> findByBuddyPairIdPairAndUserId(
        @Param("buddyPairId") Long buddyPairId, 
        @Param("userId") Long userId
    );

    /**
     * Trouve les disponibilités par utilisateur
     */
    List<Disponibilite> findByUserId(Long userId);

    /**
     * Compte les disponibilités par buddy pair
     */
    @Query("SELECT COUNT(d) FROM Disponibilite d WHERE d.buddyPair.idPair = :buddyPairId")
    long countByBuddyPairIdPair(@Param("buddyPairId") Long buddyPairId);
}
