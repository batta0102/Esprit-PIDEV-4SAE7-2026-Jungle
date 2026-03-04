package tn.esprit.jungledraft.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateCommentDTO {
    private String comment;
    private Long userId;
    private Long messageId;
}
