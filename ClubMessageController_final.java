package tn.esprit.jungledraft.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungledraft.DTO.CreateMessageRequest;
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
    public ResponseEntity<ClubMessage> create(@RequestBody CreateMessageRequest request) {
        try {
            System.out.println("📥 Requête de création reçue: " + request);
            
            // Validation manuelle
            if (request.getContenu() == null || request.getContenu().trim().isEmpty()) {
                System.err.println("❌ Erreur: contenu vide");
                return ResponseEntity.badRequest().build();
            }
            if (request.getUserId() == null) {
                System.err.println("❌ Erreur: userId null");
                return ResponseEntity.badRequest().build();
            }
            if (request.getClub() == null || request.getClub().getIdClub() == null) {
                System.err.println("❌ Erreur: club ou club.idClub null");
                return ResponseEntity.badRequest().build();
            }
            
            ClubMessage message = clubMessageService.createFromRequest(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création du message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
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
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            clubMessageService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
