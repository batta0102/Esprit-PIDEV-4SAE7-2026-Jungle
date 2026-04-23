package tn.esprit.ressources.Entites;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReview;

    @Min(value = 0, message = "Rating must be at least 1")
    @Max(value = 6, message = "Rating must be at most 5")
    private int rating;

    @NotBlank(message = "Comment cannot be empty")
    @Size(min = 5, max = 500, message = "Comment must be between 5 and 500 characters")
    private String comment;

    @ManyToOne
    @NotNull(message = "Resource must be specified")
    @JsonBackReference
    private Resource resource;
}