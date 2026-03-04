// Assure-toi que ton entité BuddyPair a bien cette structure :

package tn.esprit.jungledraft.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BuddyPair {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPair;  // Note: le nom du champ est "idPair" pas "id"

    @ManyToOne
    @JoinColumn(name = "user_id_1")
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user_id_2")
    private User user2;

    // Champs simples pour les IDs (plus faciles à utiliser)
    private Long userID_1;
    private Long userID_2;

    @ManyToOne
    @JoinColumn(name = "club_id")
    private Club club;

    private Long clubId;

    private LocalDate dateCreation;
    private String status; // ACTIVE, COMPLETED, CANCELLED

    // Getters pour la compatibilité
    public Long getUserID_1() {
        return userID_1 != null ? userID_1 : (user1 != null ? user1.getId() : null);
    }

    public Long getUserID_2() {
        return userID_2 != null ? userID_2 : (user2 != null ? user2.getId() : null);
    }
}
