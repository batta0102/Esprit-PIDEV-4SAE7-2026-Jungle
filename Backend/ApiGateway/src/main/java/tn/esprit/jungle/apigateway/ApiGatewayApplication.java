package tn.esprit.jungle.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

/**
 * API Gateway Application
 * 
 * This is the central entry point for all client requests.
 * Routes are configured to automatically use Eureka service discovery with load balancing.
 * 
 * Gateway Port: 8087
 * Eureka: http://localhost:8761
 * 
 * Routes configured:
 * - /onlinecourses/** -> GestionCours microservice
 * - /onsitecourses/** -> GestionCours microservice
 * 
 * CRUD Operations supported:
 * Online Courses:
 *   GET    /onlinecourses/all          - Get all online courses
 *   GET    /onlinecourses/{id}         - Get online course by ID
 *   POST   /onlinecourses/add          - Add new online course
 *   PUT    /onlinecourses/update/{id}  - Update online course
 *   DELETE /onlinecourses/delete/{id}  - Delete online course
 * 
 * On-Site Courses:
 *   GET    /onsitecourses/all          - Get all on-site courses
 *   GET    /onsitecourses/{id}         - Get on-site course by ID
 *   POST   /onsitecourses/add          - Add new on-site course
 *   PUT    /onsitecourses/update/{id}  - Update on-site course
 *   DELETE /onsitecourses/delete/{id}  - Delete on-site course
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    /**
     * Configure gateway routes with Eureka service discovery
     * 'lb://' prefix enables client-side load balancing via Eureka
     */
    @Bean
    public RouteLocator gatewayroutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Route all online courses endpoints to GestionCours microservice
                .route(r -> r.path("/onlinecourses/**")
                        .uri("lb://GestionCours"))
                
                // Route all on-site courses endpoints to GestionCours microservice
                .route(r -> r.path("/onsitecourses/**")
                        .uri("lb://GestionCours"))
                
                .build();
    }
}
