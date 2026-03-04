package tn.esprit.jungledraft.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.jungledraft.Entities.*;
import tn.esprit.jungledraft.Repositories.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendrierService {

    private final DisponibiliteRepository disponibiliteRepository;
    private final EvenementCalendrierRepository evenementRepository;
    private final BuddyPairRep buddyPairRepository;
    private final BuddySessionService sessionService;
    private final BuddySessionRep buddySessionRep;

    /**
     * Récupère les disponibilités d'un buddy pair
     */
    public List<Disponibilite> getDisponibilites(Long buddyPairId) {
        try {
            System.out.println("📅 Service: Recherche disponibilités pour buddyPairId: " + buddyPairId);
            List<Disponibilite> disponibilites = disponibiliteRepository.findByBuddyPairIdPair(buddyPairId);
            System.out.println("✅ Service: " + disponibilites.size() + " disponibilités trouvées");
            return disponibilites;
        } catch (Exception e) {
            System.err.println("❌ Service: Erreur lors de la recherche: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Impossible de récupérer les disponibilités: " + e.getMessage());
        }
    }

    /**
     * Ajoute une disponibilité
     */
    @Transactional
    public Disponibilite ajouterDisponibilite(Long buddyPairId, Long userId, LocalDateTime debut, LocalDateTime fin) {
        try {
            System.out.println("📅 Service: Création disponibilité - buddyPairId: " + buddyPairId + ", userId: " + userId);
            System.out.println("📅 Service: Période: " + debut + " -> " + fin);
            
            // Validation
            if (debut.isAfter(fin)) {
                throw new IllegalArgumentException("La date de début doit être avant la date de fin");
            }
            
            BuddyPair buddyPair = buddyPairRepository.findById(buddyPairId)
                    .orElseThrow(() -> new RuntimeException("BuddyPair non trouvé: " + buddyPairId));

            Disponibilite dispo = new Disponibilite();
            dispo.setBuddyPair(buddyPair);
            dispo.setUserId(userId);
            dispo.setDebut(debut);
            dispo.setFin(fin);
            dispo.setRecurrent(false);

            Disponibilite saved = disponibiliteRepository.save(dispo);
            System.out.println("✅ Service: Disponibilité sauvegardée avec ID: " + saved.getId());
            return saved;
            
        } catch (Exception e) {
            System.err.println("❌ Service: Erreur lors de la création: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Impossible de créer la disponibilité: " + e.getMessage());
        }
    }

    /**
     * Supprime une disponibilité
     */
    @Transactional
    public void supprimerDisponibilite(Long id) {
        try {
            System.out.println("🗑️ Service: Suppression disponibilité ID: " + id);
            
            if (!disponibiliteRepository.existsById(id)) {
                throw new RuntimeException("Disponibilité non trouvée: " + id);
            }
            
            disponibiliteRepository.deleteById(id);
            System.out.println("✅ Service: Disponibilité supprimée");
        } catch (Exception e) {
            System.err.println("❌ Service: Erreur lors de la suppression: " + e.getMessage());
            throw new RuntimeException("Impossible de supprimer la disponibilité: " + e.getMessage());
        }
    }

    /**
     * Récupère les disponibilités d'un buddy pair sur une période
     */
    public List<Disponibilite> getDisponibilitesParPeriode(Long buddyPairId, LocalDateTime debut, LocalDateTime fin) {
        return disponibiliteRepository.findByBuddyPairIdPairAndDebutBetween(buddyPairId, debut, fin);
    }

    /**
     * Récupère les disponibilités d'un utilisateur spécifique dans un buddy pair
     */
    public List<Disponibilite> getDisponibilitesUtilisateur(Long buddyPairId, Long userId) {
        return disponibiliteRepository.findByBuddyPairIdPairAndUserId(buddyPairId, userId);
    }

    /**
     * Récupère les disponibilités communes des deux buddies
     */
    public List<LocalDateTime[]> getDisponibilitesCommunes(Long buddyPairId, int dureeMinutes) {
        BuddyPair buddyPair = buddyPairRepository.findById(buddyPairId)
                .orElseThrow(() -> new RuntimeException("BuddyPair non trouvé"));

        List<Disponibilite> dispoUser1 = disponibiliteRepository
                .findByBuddyPairIdPairAndUserId(buddyPairId, buddyPair.getUserID_1());
        List<Disponibilite> dispoUser2 = disponibiliteRepository
                .findByBuddyPairIdPairAndUserId(buddyPairId, buddyPair.getUserID_2());

        List<LocalDateTime[]> creneauxCommuns = new ArrayList<>();

        // Algorithme pour trouver les intersections de disponibilités
        for (Disponibilite d1 : dispoUser1) {
            for (Disponibilite d2 : dispoUser2) {
                LocalDateTime debutCommun = d1.getDebut().isAfter(d2.getDebut()) ? d1.getDebut() : d2.getDebut();
                LocalDateTime finCommun = d1.getFin().isBefore(d2.getFin()) ? d1.getFin() : d2.getFin();

                if (debutCommun.plusMinutes(dureeMinutes).isBefore(finCommun)) {
                    creneauxCommuns.add(new LocalDateTime[]{debutCommun, finCommun});
                }
            }
        }

        return creneauxCommuns;
    }

    /**
     * Suggère des créneaux pour une session
     */
    public List<LocalDateTime> suggererCreneaux(Long buddyPairId, int dureeMinutes) {
        List<LocalDateTime[]> dispoCommunes = getDisponibilitesCommunes(buddyPairId, dureeMinutes);

        return dispoCommunes.stream()
                .map(interval -> interval[0]) // Prend le début de chaque interval
                .limit(5) // Limite à 5 suggestions
                .collect(Collectors.toList());
    }

    /**
     * Vérifie les rappels à envoyer
     */
    @Transactional
    public List<EvenementCalendrier> getRappelsAEnvoyer() {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime limite = maintenant.plusHours(24); // Rappels pour les 24 prochaines heures

        return evenementRepository.findByRappelEnvoyeFalseAndDateDebutLessThan(limite);
    }

    /**
     * Marque un rappel comme envoyé
     */
    @Transactional
    public void marquerRappelEnvoye(Long evenementId) {
        EvenementCalendrier evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));
        evenement.setRappelEnvoye(true);
        evenementRepository.save(evenement);
    }

    /**
     * Crée automatiquement un événement pour une session
     */
    @Transactional
    public EvenementCalendrier creerEvenementPourSession(BuddySession session) {
        EvenementCalendrier evenement = new EvenementCalendrier();
        evenement.setBuddyPair(session.getBuddyPair());
        evenement.setTitre("Session avec " + session.getBuddyPair().getUserID_2());
        evenement.setDescription(session.getSujet());
        evenement.setDateDebut(session.getDate().toLocalDate().atStartOfDay());
        evenement.setDateFin(evenement.getDateDebut().plusMinutes(session.getDuree()));
        evenement.setType(TypeEvenement.SESSION);
        evenement.setSessionId(session.getIdSession());
        evenement.setRappelEnvoye(false);

        return evenementRepository.save(evenement);
    }
}
