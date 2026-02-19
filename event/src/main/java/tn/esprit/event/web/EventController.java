package tn.esprit.event.web;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import tn.esprit.event.model.Event;
import tn.esprit.event.model.EventRegistration;
import tn.esprit.event.model.OnlineEvent;
import tn.esprit.event.model.OnsiteEvent;
import tn.esprit.event.model.enums.EventStatus;
import tn.esprit.event.model.enums.EventType;
import tn.esprit.event.repository.EventRegistrationRepository;
import tn.esprit.event.service.EventService;
import tn.esprit.event.web.dto.CreateOnlineEventRequest;
import tn.esprit.event.web.dto.CreateOnsiteEventRequest;
import tn.esprit.event.web.dto.EventRegistrationRequest;
import tn.esprit.event.web.dto.EventRegistrationResponse;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    private final EventRegistrationRepository eventRegistrationRepository;

    @PostMapping("/online")
    public OnlineEvent createOnlineEvent(@RequestBody CreateOnlineEventRequest request) {
        return eventService.createOnlineEvent(request);
    }

    @PutMapping("/online/{id}")
    public OnlineEvent updateOnlineEvent(@PathVariable Long id, @RequestBody CreateOnlineEventRequest request) {
        return eventService.updateOnlineEvent(id, request);
    }

    @PutMapping("/onsite/{id}")
    public OnsiteEvent updateOnsiteEvent(@PathVariable Long id, @RequestBody CreateOnsiteEventRequest request) {
        return eventService.updateOnsiteEvent(id, request);
    }

    @PostMapping("/onsite")
    public OnsiteEvent createOnsiteEvent(@RequestBody CreateOnsiteEventRequest request) {
        return eventService.createOnsiteEvent(request);
    }

    @GetMapping("/{id}")
    public Event getById(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @PutMapping("/{eventId}/cancel")
    public Event cancelEvent(@PathVariable Long eventId) {
        return eventService.cancelEvent(eventId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }

    @PutMapping("/{eventId}/status/{status}")
    public Event updateStatus(@PathVariable Long eventId, @PathVariable EventStatus status) {
        return eventService.updateStatus(eventId, status);
    }

    @GetMapping
    public List<Event> listEvents(
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) EventType type
    ) {
        if (status != null) {
            return eventService.getEventsByStatus(status);
        }
        if (type != null) {
            return eventService.getEventsByType(type);
        }
        return eventService.getAllEvents();
    }

    @PostMapping("/{eventId}/registrations")
    public EventRegistrationResponse register(
            @PathVariable Long eventId,
            @Valid @RequestBody EventRegistrationRequest request
    ) {
        // Ensure event exists
        Event event = eventService.getEventById(eventId);

        return eventRegistrationRepository
                .findByEventIdAndAttendeeEmailIgnoreCase(eventId, request.getEmail())
                .map(existing -> new EventRegistrationResponse(
                        existing.getId(),
                        eventId,
                        existing.getAttendeeName(),
                        existing.getAttendeeEmail(),
                        existing.getCreatedAt()
                ))
                .orElseGet(() -> {
                    EventRegistration reg = new EventRegistration();
                    reg.setEvent(event);
                    reg.setAttendeeName(request.getName());
                    reg.setAttendeeEmail(request.getEmail());
                    reg.setCreatedAt(LocalDateTime.now());

                    EventRegistration saved = eventRegistrationRepository.save(reg);

                    return new EventRegistrationResponse(
                            saved.getId(),
                            eventId,
                            saved.getAttendeeName(),
                            saved.getAttendeeEmail(),
                            saved.getCreatedAt()
                    );
                });
    }

    @GetMapping("/{eventId}/registrations")
    public List<EventRegistrationResponse> listRegistrations(@PathVariable Long eventId) {
        // Ensure event exists
        eventService.getEventById(eventId);

        return eventRegistrationRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .map(r -> new EventRegistrationResponse(
                        r.getId(),
                        eventId,
                        r.getAttendeeName(),
                        r.getAttendeeEmail(),
                        r.getCreatedAt()
                ))
                .toList();
    }

}
