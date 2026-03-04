package tn.esprit.jungledraft.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungledraft.Entities.BuddySession;
import tn.esprit.jungledraft.Services.BuddySessionService;

import java.util.List;

@RestController
@RequestMapping("/api/buddySessions")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class BuddySessionController {

    private final BuddySessionService buddySessionService;

    @GetMapping("/upcoming")
    public ResponseEntity<List<BuddySession>> getUpcomingSessions(@RequestParam Long buddyPairId) {
        try {
            System.out.println("🔍 Chargement sessions à venir - buddyPairId: " + buddyPairId);
            List<BuddySession> sessions = buddySessionService.getUpcomingSessionsByBuddyPair(buddyPairId);
            System.out.println("✅ " + sessions.size() + " sessions à venir trouvées");
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            System.err.println("❌ Erreur sessions à venir: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<BuddySession>> getHistorySessions(@RequestParam Long buddyPairId) {
        try {
            System.out.println("🔍 Chargement historique sessions - buddyPairId: " + buddyPairId);
            List<BuddySession> sessions = buddySessionService.getHistorySessionsByBuddyPair(buddyPairId);
            System.out.println("✅ " + sessions.size() + " sessions historiques trouvées");
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            System.err.println("❌ Erreur historique sessions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<BuddySession> createSession(@RequestBody BuddySession session) {
        try {
            System.out.println("📝 Création session: " + session);
            BuddySession created = buddySessionService.createSession(session);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.err.println("❌ Erreur création session: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuddySession> updateSession(@PathVariable Long id, @RequestBody BuddySession session) {
        try {
            BuddySession updated = buddySessionService.updateSession(id, session);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        try {
            buddySessionService.deleteSession(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
