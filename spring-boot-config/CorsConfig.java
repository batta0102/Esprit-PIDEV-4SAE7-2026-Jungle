package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * CORS Configuration for Angular Frontend
 * 
 * This configuration allows requests from:
 * - Angular Frontend (http://localhost:4200)
 * - Angular Backend Admin (http://localhost:4300)
 * 
 * IMPORTANT: Add this file to your Spring Boot projects:
 * 1. API Gateway (port 8085)
 * 2. Product Service (port 8089)
 * 3. Any other services that Angular calls
 * 
 * After adding this file, restart your Spring Boot services.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Allow Angular dev servers
        // Add your production domains here when deploying
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",  // Angular Frontend
            "http://localhost:4300"   // Angular Backend Admin
        ));
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow all standard HTTP methods
        config.setAllowedMethods(Arrays.asList(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
            "PATCH",
            "HEAD"
        ));
        
        // How long the response from a pre-flight request can be cached (1 hour)
        config.setMaxAge(3600L);
        
        // Apply CORS configuration to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
