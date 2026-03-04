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
    public ResponseEntity<Disponibilite> ajouterDisponibilite(
            @PathVariable Long buddyPairId,
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        
        try {
            System.out.println("📅 Ajout disponibilité - buddyPairId: " + buddyPairId + ", userId: " + userId);
            System.out.println("📅 Période: " + debut + " -> " + fin);
            
            Disponibilite disponibilite = calendarService.ajouterDisponibilite(buddyPairId, userId, debut, fin);
            return ResponseEntity.ok(disponibilite);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'ajout de disponibilité: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/disponibilites/{buddyPairId}")
    public ResponseEntity<List<Disponibilite>> getDisponibilites(@PathVariable Long buddyPairId) {
        try {
            System.out.println("📅 Chargement disponibilités - buddyPairId: " + buddyPairId);
            List<Disponibilite> disponibilites = calendarService.getDisponibilitesByBuddyPair(buddyPairId);
            System.out.println("✅ " + disponibilites.size() + " disponibilités trouvées");
            return ResponseEntity.ok(disponibilites);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du chargement des disponibilités: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/disponibilites/{id}")
    public ResponseEntity<Void> supprimerDisponibilite(@PathVariable Long id) {
        try {
            System.out.println("🗑️ Suppression disponibilité - ID: " + id);
            calendarService.supprimerDisponibilite(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
