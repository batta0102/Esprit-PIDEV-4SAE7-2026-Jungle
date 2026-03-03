package tn.esprit.pidraft.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.pidraft.Services.CertificationService;

@RestController
@RequestMapping("/certification")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService service;

    @PostMapping("/traiter/{resultatId}")
    public String traiter(@PathVariable Long resultatId) {

        service.traiterResultat(resultatId);

        return "Certification traitée avec succès";
    }
}
