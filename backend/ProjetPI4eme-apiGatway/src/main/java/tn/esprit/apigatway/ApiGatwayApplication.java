package tn.esprit.apigatway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ApiGatwayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatwayApplication.class, args);
	}



	@Bean
	public RouteLocator gatewayroutes(RouteLocatorBuilder builder) {
		return builder.routes()
				.route("event-service", r -> r
						.path("/api/**")
						.uri("http://localhost:8082"))
				.route("resources-service", r -> r
						.path("/resources/**")
						.uri("lb://ressources"))
				.build();
	}

}
