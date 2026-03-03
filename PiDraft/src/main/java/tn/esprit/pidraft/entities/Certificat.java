package tn.esprit.pidraft.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToOne;
import lombok.Data;
import jakarta.persistence.Id;

import java.time.LocalDate;

@Entity
@Data
public class Certificat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroCertificat;
    private String matiere;
    private Double scoreFinal;
    private LocalDate dateDelivrance;

    @OneToOne
    private Resultat resultat;
}
