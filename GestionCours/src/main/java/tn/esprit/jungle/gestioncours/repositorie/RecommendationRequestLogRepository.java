package tn.esprit.jungle.gestioncours.repositorie;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.jungle.gestioncours.entites.RecommendationRequestLog;

public interface RecommendationRequestLogRepository extends JpaRepository<RecommendationRequestLog, Long> {
}
