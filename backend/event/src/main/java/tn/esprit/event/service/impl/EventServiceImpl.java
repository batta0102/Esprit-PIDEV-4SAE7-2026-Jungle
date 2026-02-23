package tn.esprit.event.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.event.model.Event;
import tn.esprit.event.model.OnlineEvent;
import tn.esprit.event.model.OnsiteEvent;
import tn.esprit.event.model.Venue;
import tn.esprit.event.model.enums.EventStatus;
import tn.esprit.event.model.enums.EventType;
import tn.esprit.event.repository.EventRepository;
import tn.esprit.event.repository.VenueRepository;
import tn.esprit.event.service.EventService;
import tn.esprit.event.web.dto.CreateOnlineEventRequest;
import tn.esprit.event.web.dto.CreateOnsiteEventRequest;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Override
    public OnlineEvent createOnlineEvent(CreateOnlineEventRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        OnlineEvent event = new OnlineEvent();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setMeetingUrl(request.getMeetingUrl());
        event.setStatus(EventStatus.ACTIVE);
        event.setType(EventType.ONLINE);
        event.setEventDiscriminator(OnlineEvent.class.getSimpleName());
        return eventRepository.save(event);
    }

    @Override
    public OnlineEvent updateOnlineEvent(Long id, CreateOnlineEventRequest request) {
        Event baseEvent = getEventById(id);
        if (!(baseEvent instanceof OnlineEvent)) {
            throw new RuntimeException("Event is not an online event");
        }
        OnlineEvent event = (OnlineEvent) baseEvent;
        validateDates(request.getStartDate(), request.getEndDate());

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setMeetingUrl(request.getMeetingUrl());
        event.setType(EventType.ONLINE);
        event.setEventDiscriminator(OnlineEvent.class.getSimpleName());

        return eventRepository.save(event);
    }

    @Override
    public OnsiteEvent createOnsiteEvent(CreateOnsiteEventRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        OnsiteEvent event = new OnsiteEvent();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setVenueName(request.getVenueName());
        event.setVenueAddress(request.getVenueAddress());
        event.setCapacity(request.getCapacity());
        event.setStatus(EventStatus.ACTIVE);
        event.setType(EventType.ONSITE);
        event.setEventDiscriminator(OnsiteEvent.class.getSimpleName());

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found"));
            event.setVenue(venue);
        }

        return eventRepository.save(event);
    }

    @Override
    public OnsiteEvent updateOnsiteEvent(Long id, CreateOnsiteEventRequest request) {
        Event baseEvent = getEventById(id);
        if (!(baseEvent instanceof OnsiteEvent)) {
            throw new RuntimeException("Event is not an onsite event");
        }
        OnsiteEvent event = (OnsiteEvent) baseEvent;
        validateDates(request.getStartDate(), request.getEndDate());

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setVenueName(request.getVenueName());
        event.setVenueAddress(request.getVenueAddress());
        event.setCapacity(request.getCapacity());
        event.setType(EventType.ONSITE);
        event.setEventDiscriminator(OnsiteEvent.class.getSimpleName());

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found"));
            event.setVenue(venue);
        } else {
            event.setVenue(null);
        }

        return eventRepository.save(event);
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    @Override
    public Event cancelEvent(Long eventId) {
        return updateStatus(eventId, EventStatus.CANCELED);
    }

    @Override
    public Event updateStatus(Long eventId, EventStatus status) {
        Event event = getEventById(eventId);
        event.setStatus(status);
        return eventRepository.save(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getEventsByStatus(EventStatus status) {
        return eventRepository.findByStatus(status);
    }

    @Override
    public List<Event> getEventsByType(EventType type) {
        return eventRepository.findByType(type);
    }

    private void validateDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            throw new RuntimeException("startDate and endDate are required");
        }
        if (!endDate.isAfter(startDate)) {
            throw new RuntimeException("endDate must be after startDate");
        }
    }
}
