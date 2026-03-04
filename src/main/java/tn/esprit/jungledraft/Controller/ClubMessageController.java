package tn.esprit.jungledraft.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungledraft.DTO.CreateMessageDTO;
import tn.esprit.jungledraft.Entities.ClubMessage;
import tn.esprit.jungledraft.Services.ClubMessageService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clubMessages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ClubMessageController {

    private final ClubMessageService clubMessageService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateMessageDTO request) {
        try {
            System.out.println("📥 Requête reçue: " + request);
            ClubMessage message = clubMessageService.createFromRequest(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ClubMessage>> getAll() {
        return ResponseEntity.ok(clubMessageService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubMessage> getById(@PathVariable Long id) {
        Optional<ClubMessage> message = clubMessageService.getById(id);
        return message.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all/By-Club/{id}")
    public List<ClubMessage> getAllByClub(@PathVariable Long id){
        return clubMessageService.getAllByClub(id);
    }

    @PutMapping("/like/{id}")
    public Integer likePost(@PathVariable Long id){
        return clubMessageService.likePost(id);
    }

    @PutMapping
    public ResponseEntity<ClubMessage> update(@RequestBody ClubMessage message) {
        try {
            return ResponseEntity.ok(clubMessageService.update(message));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            ClubMessage message = clubMessageService.getById(id)
                    .orElseThrow(() -> new RuntimeException("Message non trouvé"));

            // Dissocier le club avant suppression
            message.setClub(null);
            clubMessageService.update(message); // Sauvegarder la dissociation

            // Maintenant supprimer
            clubMessageService.delete(id);

            return ResponseEntity.ok("Message supprimé");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
}