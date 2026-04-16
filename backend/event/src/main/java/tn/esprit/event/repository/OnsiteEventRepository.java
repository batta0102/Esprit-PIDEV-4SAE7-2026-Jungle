package tn.esprit.event.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.event.model.OnsiteEvent;

public interface OnsiteEventRepository extends JpaRepository<OnsiteEvent, Long> {

    void deleteByVenueId(Long venueId);
}
