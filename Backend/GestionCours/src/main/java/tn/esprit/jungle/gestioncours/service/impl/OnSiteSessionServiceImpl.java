package tn.esprit.jungle.gestioncours.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.jungle.gestioncours.entites.OnSiteSession;
import tn.esprit.jungle.gestioncours.entites.OnSiteCourse;
import tn.esprit.jungle.gestioncours.entites.Classroom;
import tn.esprit.jungle.gestioncours.exception.InvalidInputException;
import tn.esprit.jungle.gestioncours.exception.ResourceNotFoundException;
import tn.esprit.jungle.gestioncours.repositorie.OnSiteSessionRepository;
import tn.esprit.jungle.gestioncours.repositorie.OnSiteCourseRepository;
import tn.esprit.jungle.gestioncours.repositorie.ClassroomRepository;
import tn.esprit.jungle.gestioncours.service.interfaces.OnSiteSessionService;

import java.util.List;

/**
 * OnSiteSessionService Implementation
 * Contains business logic for on-site session operations
 * Handles validation, mapping, and persistence coordination
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OnSiteSessionServiceImpl implements OnSiteSessionService {

    private final OnSiteSessionRepository repository;
    private final OnSiteCourseRepository courseRepository;
    private final ClassroomRepository classroomRepository;

    @Override
    public OnSiteSession addSession(OnSiteSession session) {
        log.info("Attempting to add new on-site session with date: {}, capacity: {}", 
                 session.getDate(), session.getCapacity());
        
        validateInput(session);
        OnSiteSession savedSession = repository.save(session);
        
        log.info("✅ On-site session successfully saved to database with ID: {} | Date: {} | Capacity: {} | Course ID: {} | Classroom ID: {}", 
                 savedSession.getId(), savedSession.getDate(), savedSession.getCapacity(), 
                 savedSession.getCourse() != null ? savedSession.getCourse().getId() : null,
                 savedSession.getClassroom() != null ? savedSession.getClassroom().getId() : null);
        
        return savedSession;
    }

    @Override
    public List<OnSiteSession> getAllSessions() {
        log.info("Fetching all on-site sessions from database...");
        List<OnSiteSession> sessions = repository.findAll();
        log.info("✅ Retrieved {} on-site session(s) from database", sessions.size());
        return sessions;
    }

    @Override
    public OnSiteSession getSessionById(Long id) {
        log.info("Fetching on-site session with ID: {}", id);
        validateId(id);

        OnSiteSession session = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("❌ On-site session with ID {} not found in database", id);
                    return new ResourceNotFoundException(
                            "OnSiteSession with id " + id + " not found");
                });
        
        log.info("✅ On-site session found: ID={}, Date={}, Capacity={}", 
                 session.getId(), session.getDate(), session.getCapacity());
        return session;
    }

    @Override
    public OnSiteSession updateSession(Long id, OnSiteSession session) {
        log.info("Attempting to update on-site session with ID: {}", id);
        validateId(id);
        validateInput(session);

        OnSiteSession existingSession = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("❌ Update failed: On-site session with ID {} not found", id);
                    return new ResourceNotFoundException(
                            "OnSiteSession with id " + id + " not found");
                });

        log.debug("Existing on-site session before update: Date={}, Capacity={}",
                 existingSession.getDate(), existingSession.getCapacity());
        
        if (session.getDate() != null) {
            existingSession.setDate(session.getDate());
        }
        if (session.getCapacity() > 0) {
            existingSession.setCapacity(session.getCapacity());
        }
        if (session.getCourse() != null) {
            existingSession.setCourse(session.getCourse());
        }
        if (session.getClassroom() != null) {
            existingSession.setClassroom(session.getClassroom());
        }

        OnSiteSession updatedSession = repository.save(existingSession);
        log.info("✅ On-site session with ID {} successfully updated in database | New Date: {} | New Capacity: {}", 
                 id, updatedSession.getDate(), updatedSession.getCapacity());
        
        return updatedSession;
    }

    @Override
    public void deleteSession(Long id) {
        log.info("Attempting to delete on-site session with ID: {}", id);
        validateId(id);

        OnSiteSession existingSession = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("❌ Delete failed: On-site session with ID {} not found", id);
                    return new ResourceNotFoundException(
                            "OnSiteSession with id " + id + " not found");
                });

        log.debug("On-site session to be deleted: ID={}, Date={}, Capacity={}", 
                 existingSession.getId(), existingSession.getDate(), existingSession.getCapacity());
        
        repository.deleteById(id);
        log.info("✅ On-site session with ID {} successfully deleted from database", id);
    }

    @Override
    public List<OnSiteSession> getSessionsByCourse(Long courseId) {
        log.info("Fetching on-site sessions for course ID: {}", courseId);
        validateId(courseId);

        // Verify course exists
        courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.error("❌ Course with ID {} not found", courseId);
                    return new ResourceNotFoundException("OnSiteCourse with id " + courseId + " not found");
                });

        List<OnSiteSession> sessions = repository.findByCourseId(courseId);
        log.info("✅ Retrieved {} on-site session(s) for course ID: {}", sessions.size(), courseId);
        return sessions;
    }

    /**
     * Validates if the provided on-site session has required fields
     * 
     * @param session the on-site session to validate
     * @throws InvalidInputException if validation fails
     */
    private void validateInput(OnSiteSession session) {
        if (session == null) {
            log.warn("⚠️ Validation failed: On-site session object is null");
            throw new InvalidInputException("On-site session cannot be null");
        }
        if (session.getDate() == null) {
            log.warn("⚠️ Validation failed: On-site session date is null");
            throw new InvalidInputException("On-site session date is required");
        }
        if (session.getCapacity() <= 0) {
            log.warn("⚠️ Validation failed: On-site session capacity is invalid");
            throw new InvalidInputException("Capacity must be a positive number");
        }
        if (session.getCourse() == null || session.getCourse().getId() == null) {
            log.warn("⚠️ Validation failed: On-site session course is missing or invalid");
            throw new InvalidInputException("Course is required for the session");
        }
        if (session.getClassroom() == null || session.getClassroom().getId() == null) {
            log.warn("⚠️ Validation failed: On-site session classroom is missing or invalid");
            throw new InvalidInputException("Classroom is required for the session");
        }
        log.debug("✅ On-site session validation passed");
    }

    /**
     * Validates if the provided ID is valid (positive)
     * 
     * @param id the ID to validate
     * @throws InvalidInputException if ID is invalid
     */
    private void validateId(Long id) {
        if (id == null || id <= 0) {
            log.warn("⚠️ Validation failed: Invalid ID provided: {}", id);
            throw new InvalidInputException("ID must be a positive number");
        }
    }
}
