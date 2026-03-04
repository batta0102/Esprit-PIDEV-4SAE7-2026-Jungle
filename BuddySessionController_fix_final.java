package tn.esprit.jungledraft.Controllers;

import tn.esprit.jungledraft.Entities.BuddySession;
import tn.esprit.jungledraft.DTO.CreateSessionDTO;
import tn.esprit.jungledraft.Services.BuddySessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/buddySessions")
@CrossOrigin(origins = "http://localhost:4200")
public class BuddySessionController {

    @Autowired
    private BuddySessionService buddySessionService;

    @PostMapping
    public ResponseEntity<BuddySession> createSession(@RequestBody CreateSessionDTO sessionDTO) {
        try {
            System.out.println("📝 DTO reçu: " + sessionDTO);
            
            // ✅ CONVERSION MANUELLE DU DTO VERS L'ENTITÉ
            BuddySession session = new BuddySession();
            
            // Extraire buddyPairId du DTO imbriqué
            if (sessionDTO.getBuddyPair() != null && sessionDTO.getBuddyPair().getIdPair() != null) {
                session.setBuddyPairId(sessionDTO.getBuddyPair().getIdPair());
                System.out.println("✅ buddyPairId extrait: " + sessionDTO.getBuddyPair().getIdPair());
            } else {
                System.err.println("❌ buddyPair ou idPair est null!");
                return ResponseEntity.badRequest().build();
            }
            
            // Parser la date
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime dateSession = LocalDateTime.parse(sessionDTO.getDate(), formatter);
            session.setDate(dateSession);
            
            // Autres champs
            session.setDuree(sessionDTO.getDuree());
            session.setSujet(sessionDTO.getSujet());
            session.setNotes(sessionDTO.getNotes());
            session.setStatus(sessionDTO.getStatus());
            session.setConfirmeParUtilisateur1(false);
            session.setConfirmeParUtilisateur2(false);
            session.setSatisfactionUtilisateur1(null);
            session.setSatisfactionUtilisateur2(null);
            
            System.out.println("📝 Entité BuddySession créée: " + session);
            
            BuddySession created = buddySessionService.createSession(session);
            System.out.println("✅ Session créée avec buddyPairId: " + created.getBuddyPairId());
            
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.err.println("❌ Erreur création session: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<java.util.List<BuddySession>> getAllSessions() {
        try {
            java.util.List<BuddySession> sessions = buddySessionService.getAllSessions();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            System.err.println("❌ Erreur récupération sessions: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
