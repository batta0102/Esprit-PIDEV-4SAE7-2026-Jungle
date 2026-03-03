package tn.esprit.jungle.gestioncours.service.interfaces;

import tn.esprit.jungle.gestioncours.entites.OnSiteBooking;

import java.util.List;

/**
 * OnSiteBookingService Interface
 * Defines the business logic contract for on-site booking operations
 */
public interface OnSiteBookingService {
    OnSiteBooking addBooking(OnSiteBooking booking);
    List<OnSiteBooking> getAllBookings();
    OnSiteBooking getBookingById(Long id);
    OnSiteBooking updateBooking(Long id, OnSiteBooking booking);
    void deleteBooking(Long id);
    List<OnSiteBooking> getBookingsBySession(Long sessionId);
    List<OnSiteBooking> getBookingsByStudent(Long studentId);
    List<OnSiteBooking> getBookingsByStatus(String status);
}
