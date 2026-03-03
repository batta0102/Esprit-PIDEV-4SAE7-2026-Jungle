package tn.esprit.pidraft.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToOne;
import lombok.Data;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
@Data
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateInterview;

    private String type; // EN_LIGNE / SUR_SITE
    private String resultat;
    private String commentaire;

    @OneToOne
    private Candidature candidature;
}
