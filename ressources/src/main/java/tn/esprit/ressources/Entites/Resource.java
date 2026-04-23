package tn.esprit.ressources.Entites;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceId;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must contain at least 10 characters")
    private String description;

    @NotNull(message = "Resource type is required")
    @Enumerated(EnumType.STRING)
    private ResourceType type;

    @NotBlank(message = "File URL is required")

    private String fileUrl;

    @PastOrPresent(message = "Upload date cannot be in the future")
    private LocalDateTime uploadDate;

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Review> reviews = new ArrayList<>();

}