package tn.esprit.jungledraft.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import tn.esprit.jungledraft.Entities.Club;

@Data
@AllArgsConstructor
public class CreateMessageRequest {
    private String contenu;
    private Long userId;
    private Club club;
}
