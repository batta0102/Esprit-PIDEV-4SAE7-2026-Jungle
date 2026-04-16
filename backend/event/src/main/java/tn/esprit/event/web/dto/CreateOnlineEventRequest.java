package tn.esprit.event.web.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOnlineEventRequest {

    private String title;

    private String description;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String meetingUrl;
}
