package tn.esprit.jungledraft.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.jungledraft.Entities.Disponibilite;
import tn.esprit.jungledraft.Repositories.DisponibiliteRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final DisponibiliteRepository disponibiliteRepository;

    public Disponibilite ajouterDisponibilite(Long buddyPairId, Long userId, LocalDateTime debut, LocalDateTime fin) {
        System.out.println("📅 Service: Création disponibilité - buddyPairId: " + buddyPairId + ", userId: " + userId);
        System.out.println("📅 Service: Période: " + debut + " -> " + fin);
        
        // Validation
        if (buddyPairId == null || userId == null) {
            throw new IllegalArgumentException("buddyPairId et userId sont obligatoires");
        }
        
        if (debut == null || fin == null) {
            throw new IllegalArgumentException("debut et fin sont obligatoires");
        }
        
        if (debut.isAfter(fin)) {
            throw new IllegalArgumentException("La date de début doit être avant la date de fin");
        }
        
        // Création de l'entité
        Disponibilite disponibilite = new Disponibilite();
        disponibilite.setBuddyPairId(buddyPairId);
        disponibilite.setUserId(userId);
        disponibilite.setDebut(debut);
        disponibilite.setFin(fin);
        
        try {
            System.out.println("📅 Service: Sauvegarde en base de données...");
            Disponibilite saved = disponibiliteRepository.save(disponibilite);
            System.out.println("✅ Service: Disponibilité sauvegardée avec ID: " + saved.getId());
            return saved;
        } catch (Exception e) {
            System.err.println("❌ Service: Erreur lors de la sauvegarde: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Impossible de sauvegarder la disponibilité: " + e.getMessage());
        }
    }

    public List<Disponibilite> getDisponibilitesByBuddyPair(Long buddyPairId) {
        System.out.println("📅 Service: Recherche disponibilités pour buddyPairId: " + buddyPairId);
        
        if (buddyPairId == null) {
            throw new IllegalArgumentException("buddyPairId est obligatoire");
        }
        
        try {
            List<Disponibilite> disponibilites = disponibiliteRepository.findByBuddyPairId(buddyPairId);
            System.out.println("✅ Service: " + disponibilites.size() + " disponibilités trouvées");
            return disponibilites;
        } catch (Exception e) {
            System.err.println("❌ Service: Erreur lors de la recherche: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Impossible de récupérer les disponibilités: " + e.getMessage());
        }
    }

    public void supprimerDisponibilite(Long id) {
        System.out.println("🗑️ Service: Suppression disponibilité ID: " + id);
        
        if (id == null) {
            throw new IllegalArgumentException("ID est obligatoire");
        }
        
        if (!disponibiliteRepository.existsById(id)) {
            throw new RuntimeException("Disponibilité non trouvée: " + id);
        }
        
        try {
            disponibiliteRepository.deleteById(id);
            System.out.println("✅ Service: Disponibilité supprimée");
        } catch (Exception e) {
            System.err.println("❌ Service: Erreur lors de la suppression: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Impossible de supprimer la disponibilité: " + e.getMessage());
        }
    }
}
