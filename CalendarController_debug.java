package tn.esprit.jungledraft.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungledraft.Entities.Disponibilite;
import tn.esprit.jungledraft.Services.CalendarService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendrier")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @PostMapping("/disponibilites/{buddyPairId}")
    public ResponseEntity<?> ajouterDisponibilite(
            @PathVariable Long buddyPairId,
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        
        try {
            System.out.println("📅 Requête reçue - buddyPairId: " + buddyPairId + ", userId: " + userId);
            System.out.println("📅 Période: " + debut + " -> " + fin);
            
            // Validation des paramètres
            if (buddyPairId == null || userId == null) {
                System.err.println("❌ buddyPairId ou userId null");
                return ResponseEntity.badRequest().body("buddyPairId et userId sont obligatoires");
            }
            
            if (debut == null || fin == null) {
                System.err.println("❌ debut ou fin null");
                return ResponseEntity.badRequest().body("debut et fin sont obligatoires");
            }
            
            if (debut.isAfter(fin)) {
                System.err.println("❌ debut après fin");
                return ResponseEntity.badRequest().body("La date de début doit être avant la date de fin");
            }
            
            Disponibilite disponibilite = calendarService.ajouterDisponibilite(buddyPairId, userId, debut, fin);
            System.out.println("✅ Disponibilité créée avec ID: " + disponibilite.getId());
            return ResponseEntity.ok(disponibilite);
            
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Erreur de validation: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Erreur serveur: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erreur interne: " + e.getMessage());
        }
    }

    @GetMapping("/disponibilites/{buddyPairId}")
    public ResponseEntity<?> getDisponibilites(@PathVariable Long buddyPairId) {
        try {
            System.out.println("📅 Chargement disponibilités - buddyPairId: " + buddyPairId);
            
            if (buddyPairId == null) {
                return ResponseEntity.badRequest().body("buddyPairId est obligatoire");
            }
            
            List<Disponibilite> disponibilites = calendarService.getDisponibilitesByBuddyPair(buddyPairId);
            System.out.println("✅ " + disponibilites.size() + " disponibilités trouvées");
            return ResponseEntity.ok(disponibilites);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du chargement: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/disponibilites/{id}")
    public ResponseEntity<?> supprimerDisponibilite(@PathVariable Long id) {
        try {
            System.out.println("🗑️ Suppression disponibilité - ID: " + id);
            
            if (id == null) {
                return ResponseEntity.badRequest().body("ID est obligatoire");
            }
            
            calendarService.supprimerDisponibilite(id);
            System.out.println("✅ Disponibilité supprimée");
            return ResponseEntity.ok().build();
            
        } catch (RuntimeException e) {
            System.err.println("❌ Disponibilité non trouvée: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la suppression: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }
}
