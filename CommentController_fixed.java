package tn.esprit.jungledraft.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungledraft.DTO.CreateCommentDTO;
import tn.esprit.jungledraft.Entities.Comment;
import tn.esprit.jungledraft.Services.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> create(@RequestBody CreateCommentDTO createCommentDTO) {
        try {
            System.out.println("📝 Création d'un commentaire: " + createCommentDTO);
            Comment comment = commentService.create(createCommentDTO);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création du commentaire: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all/By-Message/{messageId}")
    public ResponseEntity<List<Comment>> getByMessageId(@PathVariable Long messageId) {
        try {
            System.out.println("🔍 Chargement des commentaires du message " + messageId);
            List<Comment> comments = commentService.getByMessageId(messageId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du chargement des commentaires: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getAll() {
        return ResponseEntity.ok(commentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getById(@PathVariable Long id) {
        return commentService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/like/{id}")
    public ResponseEntity<Integer> like(@PathVariable Long id) {
        try {
            Integer likes = commentService.like(id);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            commentService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
