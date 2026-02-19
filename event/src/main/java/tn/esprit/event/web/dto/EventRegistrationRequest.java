package tn.esprit.event.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EventRegistrationRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;
}
