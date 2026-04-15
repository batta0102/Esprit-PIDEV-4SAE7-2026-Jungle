package tn.esprit.jungledraft.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")  // Applique à tous les endpoints /api/**
                .allowedOrigins("http://localhost:4200")  // Frontend Angular
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Méthodes HTTP
                .allowedHeaders("*")  // Tous les headers
                .allowCredentials(true)  // Cookies/credentials
                .maxAge(3600);  // Cache preflight pour 1 heure
    }
}
