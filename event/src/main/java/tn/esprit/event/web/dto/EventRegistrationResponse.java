package tn.esprit.event.web.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EventRegistrationResponse {

    private Long id;

    private Long eventId;

    private String name;

    private String email;

    private LocalDateTime createdAt;
}
