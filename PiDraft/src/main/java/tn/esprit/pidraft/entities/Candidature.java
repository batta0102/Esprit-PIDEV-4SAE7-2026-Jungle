package tn.esprit.pidraft.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import jakarta.persistence.Id;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Entity

@Getter
@Setter
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateSoumission;
    private String nom;
    private String email;
    private String cv;

    @Enumerated(EnumType.STRING)
    private StatutCandidature statut;
    private String commentaireAdmin;
    @OneToOne
    private Resultat resultat;

    @ManyToOne
    @JoinColumn(name = "poste_id")
    @JsonIgnoreProperties({"candidatures"})
    private Poste poste;
}
