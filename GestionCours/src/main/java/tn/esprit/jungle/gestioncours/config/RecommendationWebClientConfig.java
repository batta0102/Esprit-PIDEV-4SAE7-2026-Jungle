package tn.esprit.jungle.gestioncours.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class RecommendationWebClientConfig {

    @Bean
    @Qualifier("recommendationWebClient")
    public WebClient recommendationWebClient(
            WebClient.Builder builder,
            @Value("${app.ml.recommendation.base-url:http://localhost:8000}") String baseUrl,
            @Value("${app.ml.recommendation.timeout-seconds:30}") int timeoutSeconds) {

        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(timeoutSeconds));

        return builder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
