package tn.esprit.jungledraft.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BuddySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSession;
    
    @Column(name = "buddy_pair_id")
    private Long buddyPairId;
    
    @Column(name = "date_session")
    private LocalDateTime date;
    
    @Column(name = "duree")
    private Integer duree;
    
    @Column(name = "sujet")
    private String sujet;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "confirme_par_utilisateur1")
    private Boolean confirmeParUtilisateur1;
    
    @Column(name = "confirme_par_utilisateur2")
    private Boolean confirmeParUtilisateur2;
    
    @Column(name = "satisfaction_utilisateur1")
    private String satisfactionUtilisateur1;
    
    @Column(name = "satisfaction_utilisateur2")
    private String satisfactionUtilisateur2;
    
    // Additional fields for compatibility
    @Column(name = "user_id_createur")
    private Long userIdCreateur;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
    
    @Column(name = "confirmation_user1")
    private Boolean confirmationUser1;
    
    @Column(name = "confirmation_user2")
    private Boolean confirmationUser2;
    
    @Column(name = "satisfaction_user1")
    private String satisfactionUser1;
    
    @Column(name = "satisfaction_user2")
    private String satisfactionUser2;
    
    @Column(name = "commentaire_user1")
    private String commentaireUser1;
    
    @Column(name = "commentaire_user2")
    private String commentaireUser2;
    
    @Column(name = "lieu")
    private String lieu;
    
    @Column(name = "description")
    private String description;
}
