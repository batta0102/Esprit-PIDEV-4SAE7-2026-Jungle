package tn.esprit.jungle.gestioncours.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_request_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_json", nullable = false, columnDefinition = "TEXT")
    private String requestJson;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "course_ids_csv", length = 1000)
    private String courseIdsCsv;

    @Column(name = "top_k")
    private Integer topK;

    @Column(name = "prior_score")
    private Double priorScore;

    @Column(name = "time_spent_min")
    private Integer timeSpentMin;

    @Column(name = "completion_rate_pct")
    private Double completionRatePct;

    @Column(name = "resources_consulted_count")
    private Integer resourcesConsultedCount;

    @Column(name = "explicit_rating")
    private Integer explicitRating;

    @Column(name = "difficulty_level", length = 100)
    private String difficultyLevel;

    @Column(name = "learning_style", length = 100)
    private String learningStyle;

    @Column(name = "subject_name", length = 150)
    private String subjectName;

    @Column(name = "response_json", columnDefinition = "TEXT")
    private String responseJson;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Column(name = "success", nullable = false)
    private boolean success;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
