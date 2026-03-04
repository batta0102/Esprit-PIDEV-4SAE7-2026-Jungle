package tn.esprit.jungledraft.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungledraft.Entities.Club;
import tn.esprit.jungledraft.Services.ClubService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;


    @PostMapping
    public ResponseEntity<Club> create(@RequestBody Club club) {
        return ResponseEntity.ok(clubService.create(club));
    }


    @GetMapping
    public ResponseEntity<List<Club>> getAll() {
        return ResponseEntity.ok(clubService.getAll());
    }


    @GetMapping("/{id}")
    public ResponseEntity<Club> getById(@PathVariable Long id) {
        Optional<Club> club = clubService.getById(id);
        return club.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/all/By-Owner/{id}")
    public List<Club> getAllClubsByOwner(@PathVariable Long owner){
        return clubService.getAllClubsByOwner(owner);
    }

    @PutMapping
    public ResponseEntity<Club> update(@RequestBody Club club) {
        try {
            return ResponseEntity.ok(clubService.update(club));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
            clubService.delete(id);
            return ResponseEntity.ok().build();
    }
}
