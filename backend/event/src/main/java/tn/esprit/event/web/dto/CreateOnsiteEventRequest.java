package tn.esprit.event.web.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOnsiteEventRequest {

    private String title;

    private String description;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String venueName;

    private String venueAddress;

    private Integer capacity;

    /**
     * Optional: link this onsite event to an existing Venue.
     */
    private Long venueId;
}
