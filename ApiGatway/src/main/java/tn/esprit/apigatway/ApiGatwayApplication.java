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
		public RouteLocator gatewayroutes(RouteLocatorBuilder builder) {
			return builder.routes()

					.route("resources_route", r -> r.path("/api/resources/**")
							.uri("lb://ressources"))
					// Route pour products

					.route("products_route", r -> r.path("/api/products/**")
							.uri("lb://ressources"))
					// Route pour reviews

					.route("reviews_route", r -> r.path("/api/reviews/**")
							.uri("lb://ressources"))

					.route("order_route", r -> r.path("/api/orders/**")
					.uri("lb://ressources"))
					.route("delivery_route", r -> r.path("/api/deliveries/**")
							.uri("lb://ressources"))
					.route("user_route", r -> r.path("/api/users/**")
							.uri("lb://user-service"))
					.route("recommondation_route", r -> r.path("/api/recommendations/**")
							.uri("lb://ressources"))

					.route(r -> r.path("/onlinecourses/**")
							.uri("lb://GestionCours"))
					.route(r -> r.path("/onsitecourses/**")
							.uri("lb://GestionCours"))
					.route("livreur_route", r -> r.path("/api/livreurs/**")
							.uri("lb://ressources"))


					.build();
		}

	}
