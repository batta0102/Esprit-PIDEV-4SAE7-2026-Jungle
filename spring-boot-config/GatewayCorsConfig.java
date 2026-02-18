package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * CORS Configuration for Spring Cloud Gateway (Reactive)
 * 
 * Use this configuration if your API Gateway uses Spring Cloud Gateway.
 * This is for REACTIVE applications (WebFlux).
 * 
 * If you're using Spring MVC (non-reactive), use CorsConfig.java instead.
 * 
 * IMPORTANT: Add this to your API Gateway project (port 8085)
 * After adding, restart the Gateway.
 */
@Configuration
public class GatewayCorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Allow Angular dev servers
        corsConfig.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:4300"
        ));
        
        // Cache pre-flight response for 1 hour
        corsConfig.setMaxAge(3600L);
        
        // Allow all HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList(
            "GET", 
            "POST", 
            "PUT", 
            "DELETE", 
            "OPTIONS", 
            "PATCH"
        ));
        
        // Allow all headers
        corsConfig.addAllowedHeader("*");
        
        // Allow credentials
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
