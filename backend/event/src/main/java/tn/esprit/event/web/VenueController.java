package tn.esprit.event.web;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.event.model.Venue;
import tn.esprit.event.repository.OnsiteEventRepository;
import tn.esprit.event.repository.VenueRepository;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueRepository venueRepository;
    private final OnsiteEventRepository onsiteEventRepository;

    @PostMapping
    public Venue create(@RequestBody Venue venue) {
        venue.setId(null);
        return venueRepository.save(venue);
    }

    @GetMapping
    public List<Venue> list() {
        return venueRepository.findAll();
    }

    @GetMapping("/{id}")
    public Venue getById(@PathVariable Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    @PutMapping("/{id}")
    public Venue update(@PathVariable Long id, @RequestBody Venue venue) {
        Venue existing = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        existing.setName(venue.getName());
        existing.setAddress(venue.getAddress());
        existing.setCity(venue.getCity());
        existing.setCountry(venue.getCountry());
        existing.setPostalCode(venue.getPostalCode());
        existing.setCapacity(venue.getCapacity());

        return venueRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if (!venueRepository.existsById(id)) {
            throw new RuntimeException("Venue not found");
        }

        onsiteEventRepository.deleteByVenueId(id);
        venueRepository.deleteById(id);
    }
}
