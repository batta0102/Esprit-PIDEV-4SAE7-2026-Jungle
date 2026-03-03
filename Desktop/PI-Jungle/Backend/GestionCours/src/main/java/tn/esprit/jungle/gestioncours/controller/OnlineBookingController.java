package tn.esprit.jungle.gestioncours.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.jungle.gestioncours.dto.OnlineBookingRequestDto;
import tn.esprit.jungle.gestioncours.dto.OnlineBookingResponseDto;
import tn.esprit.jungle.gestioncours.entites.OnlineBooking;
import tn.esprit.jungle.gestioncours.mapper.OnlineBookingMapper;
import tn.esprit.jungle.gestioncours.response.ApiResponse;
import tn.esprit.jungle.gestioncours.service.interfaces.OnlineBookingService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/online-bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OnlineBookingController {

    @Autowired
    private OnlineBookingService onlineBookingService;

    @Autowired
    private OnlineBookingMapper onlineBookingMapper;

    /**
     * Add a new online booking
     * POST /api/v1/online-bookings/add
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<OnlineBookingResponseDto>> addBooking(
            @Valid @RequestBody OnlineBookingRequestDto requestDto) {

        OnlineBooking booking = onlineBookingMapper.toEntity(requestDto);
        OnlineBooking createdBooking = onlineBookingService.addBooking(booking);
        OnlineBookingResponseDto responseDto = onlineBookingMapper.toResponseDto(createdBooking);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(responseDto, "Booking created successfully"));
    }

    /**
     * Get all bookings
     * GET /api/v1/online-bookings/getAll
     */
    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<OnlineBookingResponseDto>>> getAllBookings() {

        List<OnlineBooking> bookings = onlineBookingService.getAllBookings();
        List<OnlineBookingResponseDto> responseDtos = onlineBookingMapper.toResponseDtoList(bookings);

        return ResponseEntity.ok(ApiResponse.success(responseDtos, "Bookings retrieved successfully"));
    }

    /**
     * Get booking by ID
     * GET /api/v1/online-bookings/getById/{id}
     */
    @GetMapping("/getById/{id}")
    public ResponseEntity<ApiResponse<OnlineBookingResponseDto>> getBookingById(
            @PathVariable Long id) {

        OnlineBooking booking = onlineBookingService.getBookingById(id);
        OnlineBookingResponseDto responseDto = onlineBookingMapper.toResponseDto(booking);

        return ResponseEntity.ok(ApiResponse.success(responseDto, "Booking retrieved successfully"));
    }

    /**
     * Update booking
     * PUT /api/v1/online-bookings/update/{id}
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<OnlineBookingResponseDto>> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody OnlineBookingRequestDto requestDto) {

        OnlineBooking booking = onlineBookingMapper.toEntity(requestDto);
        OnlineBooking updatedBooking = onlineBookingService.updateBooking(id, booking);
        OnlineBookingResponseDto responseDto = onlineBookingMapper.toResponseDto(updatedBooking);

        return ResponseEntity.ok(ApiResponse.success(responseDto, "Booking updated successfully"));
    }

    /**
     * Delete booking
     * DELETE /api/v1/online-bookings/delete/{id}
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable Long id) {

        onlineBookingService.deleteBooking(id);

        return ResponseEntity.ok(ApiResponse.success(null, "Booking deleted successfully"));
    }

    /**
     * Get bookings by session
     * GET /api/v1/online-bookings/session/{sessionId}
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<OnlineBookingResponseDto>>> getBookingsBySession(
            @PathVariable Long sessionId) {

        List<OnlineBooking> bookings = onlineBookingService.getBookingsBySession(sessionId);
        List<OnlineBookingResponseDto> responseDtos = onlineBookingMapper.toResponseDtoList(bookings);

        return ResponseEntity.ok(ApiResponse.success(responseDtos, "Bookings retrieved successfully"));
    }

    /**
     * Get bookings by student
     * GET /api/v1/online-bookings/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<OnlineBookingResponseDto>>> getBookingsByStudent(
            @PathVariable Long studentId) {

        List<OnlineBooking> bookings = onlineBookingService.getBookingsByStudent(studentId);
        List<OnlineBookingResponseDto> responseDtos = onlineBookingMapper.toResponseDtoList(bookings);

        return ResponseEntity.ok(ApiResponse.success(responseDtos, "Bookings retrieved successfully"));
    }

    /**
     * Get bookings by status
     * GET /api/v1/online-bookings/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<OnlineBookingResponseDto>>> getBookingsByStatus(
            @PathVariable String status) {

        List<OnlineBooking> bookings = onlineBookingService.getBookingsByStatus(status);
        List<OnlineBookingResponseDto> responseDtos = onlineBookingMapper.toResponseDtoList(bookings);

        return ResponseEntity.ok(ApiResponse.success(responseDtos, "Bookings retrieved successfully"));
    }
}
