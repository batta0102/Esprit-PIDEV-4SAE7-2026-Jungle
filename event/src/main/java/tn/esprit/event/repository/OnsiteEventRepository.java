package tn.esprit.event.repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.event.model.OnsiteEvent;

public interface OnsiteEventRepository extends JpaRepository<OnsiteEvent, Long> {

    @Query("select e.id from OnsiteEvent e where e.venue.id = ?1")
    List<Long> findIdsByVenueId(Long venueId);

    void deleteByVenueId(Long venueId);
}
