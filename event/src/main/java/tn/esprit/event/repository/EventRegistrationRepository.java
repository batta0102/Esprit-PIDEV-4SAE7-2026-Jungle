package tn.esprit.event.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.event.model.EventRegistration;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

	boolean existsByEventIdAndAttendeeEmailIgnoreCase(Long eventId, String attendeeEmail);

	Optional<EventRegistration> findByEventIdAndAttendeeEmailIgnoreCase(Long eventId, String attendeeEmail);

	List<EventRegistration> findByEventIdOrderByCreatedAtDesc(Long eventId);

	void deleteByEventId(Long eventId);

	void deleteByEventIdIn(List<Long> eventIds);

	long countByEventId(Long eventId);
}
