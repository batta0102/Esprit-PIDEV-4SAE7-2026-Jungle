package tn.esprit.pidraft.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pidraft.Repositories.CandidatureRepository;
import tn.esprit.pidraft.Repositories.CertificatRepository;
import tn.esprit.pidraft.Repositories.ResultatRepository;
import tn.esprit.pidraft.entities.Candidature;
import tn.esprit.pidraft.entities.Certificat;
import tn.esprit.pidraft.entities.Resultat;
import tn.esprit.pidraft.entities.StatutCandidature;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificationService {

    private final ResultatRepository resultatRepository;
    private final CertificatRepository certificatRepository;
    private final CandidatureRepository candidatureRepository;

    private static final double SEUIL_REUSSITE = 70.0;

    public void traiterResultat(Long resultatId) {

        Resultat resultat = resultatRepository
                .findById(resultatId)
                .orElseThrow();

        double pourcentage = resultat.getPourcentage();

        // Récupérer candidature liée (à adapter selon ta relation)
        Candidature candidature =
                candidatureRepository
                        .findById(resultatId)
                        .orElseThrow();

        if (pourcentage >= SEUIL_REUSSITE) {

            // Générer certificat
            Certificat certificat = new Certificat();
            certificat.setNumeroCertificat(
                    UUID.randomUUID().toString());
            certificat.setScoreFinal(pourcentage);
            certificat.setMatiere(
                    resultat.getSession()
                            .getQcm()
                            .getTitre());
            certificat.setDateDelivrance(
                    LocalDate.now());
            certificat.setResultat(resultat);

            certificatRepository.save(certificat);

            // Mettre statut candidature
            candidature.setStatut(
                    StatutCandidature.CERTIFIE);

        } else {

            candidature.setStatut(
                    StatutCandidature.REFUSE);
        }

        candidatureRepository.save(candidature);
    }
}
