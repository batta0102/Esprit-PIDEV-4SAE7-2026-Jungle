package tn.esprit.jungledraft.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungledraft.Entities.Disponibilite;
import tn.esprit.jungledraft.Services.CalendrierService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendrier")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CalendrierController {

    private final CalendrierService calendrierService;

    @GetMapping("/disponibilites/{buddyPairId}")
    public ResponseEntity<List<Disponibilite>> getDisponibilites(@PathVariable Long buddyPairId) {
        try {
            System.out.println("📅 Chargement disponibilités - buddyPairId: " + buddyPairId);
            List<Disponibilite> disponibilites = calendrierService.getDisponibilites(buddyPairId);
            System.out.println("✅ " + disponibilites.size() + " disponibilités trouvées");
            return ResponseEntity.ok(disponibilites);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du chargement: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/disponibilites/{buddyPairId}")
    public ResponseEntity<Disponibilite> ajouterDisponibilite(
            @PathVariable Long buddyPairId,
            @RequestParam Long userId,
            @RequestParam String debut,
            @RequestParam String fin) {
        try {
            System.out.println("📅 Ajout disponibilité - buddyPairId: " + buddyPairId + ", userId: " + userId);
            System.out.println("📅 Période: " + debut + " -> " + fin);
            
            LocalDateTime debutDateTime = LocalDateTime.parse(debut);
            LocalDateTime finDateTime = LocalDateTime.parse(fin);

            Disponibilite dispo = calendrierService.ajouterDisponibilite(
                    buddyPairId, userId, debutDateTime, finDateTime);

            System.out.println("✅ Disponibilité créée avec ID: " + dispo.getId());
            return ResponseEntity.ok(dispo);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'ajout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/disponibilites/{id}")
    public ResponseEntity<Void> supprimerDisponibilite(@PathVariable Long id) {
        try {
            System.out.println("🗑️ Suppression disponibilité - ID: " + id);
            calendrierService.supprimerDisponibilite(id);
            System.out.println("✅ Disponibilité supprimée");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Autres méthodes inchangées...
}
