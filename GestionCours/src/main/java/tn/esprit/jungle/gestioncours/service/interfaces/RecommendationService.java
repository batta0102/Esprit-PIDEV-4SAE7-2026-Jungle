package tn.esprit.jungle.gestioncours.service.interfaces;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;

public interface RecommendationService {

    ResponseEntity<JsonNode> recommend(JsonNode requestBody);
}
