package tn.esprit.jungle.gestioncours.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import tn.esprit.jungle.gestioncours.entites.RecommendationRequestLog;
import tn.esprit.jungle.gestioncours.exception.InvalidInputException;
import tn.esprit.jungle.gestioncours.repositorie.RecommendationRequestLogRepository;
import tn.esprit.jungle.gestioncours.service.interfaces.RecommendationService;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.time.Duration;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Service
public class RecommendationServiceImpl implements RecommendationService {

    private static final String RECOMMEND_PATH = "/recommend";

    private final WebClient recommendationWebClient;
    private final ObjectMapper objectMapper;
    private final Duration requestTimeout;
    private final RecommendationRequestLogRepository recommendationRequestLogRepository;

    public RecommendationServiceImpl(
            @Qualifier("recommendationWebClient") WebClient recommendationWebClient,
            ObjectMapper objectMapper,
            RecommendationRequestLogRepository recommendationRequestLogRepository,
            @Value("${app.ml.recommendation.timeout-seconds:30}") int timeoutSeconds) {
        this.recommendationWebClient = recommendationWebClient;
        this.objectMapper = objectMapper;
        this.recommendationRequestLogRepository = recommendationRequestLogRepository;
        this.requestTimeout = Duration.ofSeconds(timeoutSeconds);
    }

    @Override
    public ResponseEntity<JsonNode> recommend(JsonNode requestBody) {
        if (requestBody == null || requestBody.isNull()) {
            throw new InvalidInputException("Request body is required");
        }

        try {
            ResponseEntity<JsonNode> mlResponse = recommendationWebClient.post()
                    .uri(RECOMMEND_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .exchangeToMono(clientResponse ->
                            clientResponse.bodyToMono(byte[].class)
                                    .defaultIfEmpty(new byte[0])
                                    .flatMap(bytes -> {
                                        try {
                                            JsonNode node = parseBody(bytes);
                                            return Mono.just(
                                                    ResponseEntity.status(clientResponse.statusCode())
                                                            .contentType(MediaType.APPLICATION_JSON)
                                                            .body(node));
                                        } catch (IOException e) {
                                            return Mono.error(new InvalidInputException(
                                                    "Réponse ML invalide (JSON attendu): " + e.getMessage()));
                                        }
                                    }))
                    .timeout(requestTimeout)
                    .block();
            saveLog(requestBody, mlResponse, null);
            return mlResponse;
        } catch (WebClientRequestException e) {
            saveLog(requestBody, null, e.getMessage());
            log.warn("ML service unreachable: {}", e.getMessage());
            throw new InvalidInputException("Service ML indisponible (vérifiez FastAPI sur le port 8000): "
                    + e.getMessage());
        } catch (WebClientException e) {
            saveLog(requestBody, null, e.getMessage());
            log.warn("ML client error: {}", e.getMessage());
            throw new InvalidInputException("Erreur d’appel au service ML: " + e.getMessage());
        }
    }

    private JsonNode parseBody(byte[] bytes) throws IOException {
        if (bytes == null || bytes.length == 0) {
            return NullNode.getInstance();
        }
        return objectMapper.readTree(bytes);
    }

    private void saveLog(JsonNode requestBody, ResponseEntity<JsonNode> response, String errorMessage) {
        try {
            RecommendationRequestLog logEntity = new RecommendationRequestLog();
            logEntity.setRequestJson(toJson(requestBody));
            logEntity.setUserId(readLong(requestBody, "user_id"));
            logEntity.setCourseIdsCsv(readCourseIdsCsv(requestBody));
            logEntity.setTopK(readInteger(requestBody, "top_k"));
            logEntity.setPriorScore(readDouble(requestBody, "prior_score"));
            logEntity.setTimeSpentMin(readInteger(requestBody, "time_spent_min"));
            logEntity.setCompletionRatePct(readDouble(requestBody, "completion_rate_pct"));
            logEntity.setResourcesConsultedCount(readInteger(requestBody, "resources_consulted_count"));
            logEntity.setExplicitRating(readInteger(requestBody, "explicit_rating"));
            logEntity.setDifficultyLevel(readText(requestBody, "difficulty_level"));
            logEntity.setLearningStyle(readText(requestBody, "learning_style"));
            logEntity.setSubjectName(readText(requestBody, "subject"));
            logEntity.setResponseJson(response != null && response.getBody() != null ? toJson(response.getBody()) : null);
            logEntity.setHttpStatus(response != null ? response.getStatusCode().value() : null);
            logEntity.setSuccess(response != null && response.getStatusCode().is2xxSuccessful());
            logEntity.setErrorMessage(errorMessage);
            recommendationRequestLogRepository.save(logEntity);
        } catch (Exception e) {
            log.error("Failed to persist recommendation request log", e);
        }
    }

    private String toJson(JsonNode node) {
        try {
            return node == null ? "{}" : objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            return node == null ? "{}" : node.toString();
        }
    }

    private Long readLong(JsonNode node, String fieldName) {
        JsonNode value = node != null ? node.get(fieldName) : null;
        if (value == null || value.isNull() || !value.isNumber()) {
            return null;
        }
        return value.longValue();
    }

    private Integer readInteger(JsonNode node, String fieldName) {
        JsonNode value = node != null ? node.get(fieldName) : null;
        if (value == null || value.isNull() || !value.isNumber()) {
            return null;
        }
        return value.intValue();
    }

    private Double readDouble(JsonNode node, String fieldName) {
        JsonNode value = node != null ? node.get(fieldName) : null;
        if (value == null || value.isNull() || !value.isNumber()) {
            return null;
        }
        return value.doubleValue();
    }

    private String readText(JsonNode node, String fieldName) {
        JsonNode value = node != null ? node.get(fieldName) : null;
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return text == null || text.isBlank() ? null : text;
    }

    private String readCourseIdsCsv(JsonNode node) {
        JsonNode courseIdsNode = node != null ? node.get("course_ids") : null;
        if (courseIdsNode == null || !courseIdsNode.isArray()) {
            return null;
        }
        return StreamSupport.stream(courseIdsNode.spliterator(), false)
                .filter(JsonNode::isNumber)
                .map(JsonNode::asText)
                .collect(Collectors.joining(","));
    }
}
