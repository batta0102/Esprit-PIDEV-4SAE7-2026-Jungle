package tn.esprit.jungle.gestioncours.controller;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.annotation.PostConstruct;
import tn.esprit.jungle.gestioncours.service.interfaces.RecommendationService;

import java.util.Map;

/**
 * Passerelle REST vers le microservice ML FastAPI ({@code POST /recommend}).
 * <p>Deux chemins MVC sont exposés : {@code /api/recommend} (sans context-path servlet)
 * et {@code /recommend} (utile si {@code server.servlet.context-path=/api} — l’URL complète reste alors {@code .../api/recommend}).</p>
 */
@Slf4j
@RestController
@RequestMapping({"/api/recommend", "/recommend"})
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Passerelle vers le service ML FastAPI")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostConstruct
    void logRegistered() {
        log.info("Recommendation gateway active — paths /api/recommend and /recommend (POST forwards to ML)");
    }

    /**
     * Sans mapping GET, une requête GET sur {@code /api/recommend} tombe sur le handler des ressources statiques
     * et produit « No static resource api/recommend ». On répond explicitement 405 avec {@code Allow: POST}.
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> recommendGetNotAllowed() {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .header(HttpHeaders.ALLOW, HttpMethod.POST.name())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "error", "Method Not Allowed",
                        "hint", "Use POST /api/recommend with Content-Type: application/json"));
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Transmettre une requête de recommandation au service ML (FastAPI)")
    public ResponseEntity<JsonNode> recommend(@RequestBody JsonNode body) {
        log.debug("Forwarding POST /api/recommend to ML service");
        return recommendationService.recommend(body);
    }
}
