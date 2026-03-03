package tn.esprit.apigatway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.cloud.gateway.route.RouteLocator;

@SpringBootApplication
public class ApiGatwayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatwayApplication.class, args);
	}

	@Bean
	public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
		return builder.routes()

				// User Service (must be before generic /api/**)
				.route(r -> r.path("/api/users/**")
						.uri("lb://user-service"))

				// Candidature
				.route(r -> r.path("/candidature/**")
						.uri("lb://pidraft"))

				// Certificat
				.route(r -> r.path("/certificat/**")
						.uri("lb://pidraft"))

				// Certification
				.route(r -> r.path("/certification/**")
						.uri("lb://pidraft"))

				// Interview
				.route(r -> r.path("/interview/**")
						.uri("lb://pidraft"))

				// Poste
				.route(r -> r.path("/poste/**")
						.uri("lb://pidraft"))

				// API routes (qcms, questions, reponses, resultats, session-tests, choix-reponses)
				.route(r -> r.path("/api/**")
						.uri("lb://pidraft"))

				.build();
	}
}
