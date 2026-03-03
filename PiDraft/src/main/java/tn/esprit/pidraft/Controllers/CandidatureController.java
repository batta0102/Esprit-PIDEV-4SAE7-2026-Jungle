package tn.esprit.pidraft.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pidraft.Services.CandidatureService;
import tn.esprit.pidraft.entities.Candidature;
import tn.esprit.pidraft.entities.StatutCandidature;

import java.util.List;

@RestController
@RequestMapping({"/candidature", "/api/candidature"})
@RequiredArgsConstructor
public class CandidatureController {

    private final CandidatureService service;

    @PostMapping("/add")
    public Candidature add(
            @RequestBody Candidature c){

        return service.add(c);
    }

    @GetMapping("/all")
    public List<Candidature> getAll(){
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Candidature getById(
            @PathVariable Long id){

        return service.getById(id);
    }

    @PutMapping("/update/{id}")
    public Candidature update(
            @PathVariable Long id,
            @RequestBody Candidature c){

        return service.update(id,c);
    }

    @PutMapping("/statut/{id}")
    public Candidature updateStatut(
            @PathVariable Long id,
            @RequestParam StatutCandidature statut){

        return service.updateStatut(id,statut);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(
            @PathVariable Long id){

        service.delete(id);
    }
}
