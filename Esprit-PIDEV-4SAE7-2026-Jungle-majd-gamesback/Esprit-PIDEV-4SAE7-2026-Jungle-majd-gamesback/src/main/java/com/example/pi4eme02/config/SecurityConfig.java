package com.example.pi4eme02.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/error", "/error/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/games", "/api/games/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/badges", "/api/badges/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/games", "/api/games/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/games", "/api/games/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/games", "/api/games/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/badges", "/api/badges/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/badges", "/api/badges/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/badges", "/api/badges/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/avatars", "/api/avatars/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/skins", "/api/skins/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();
        scopesConverter.setAuthorityPrefix("SCOPE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            java.util.Collection<org.springframework.security.core.GrantedAuthority> authorities =
                new java.util.ArrayList<>(scopesConverter.convert(jwt));

            Object realmAccessObj = jwt.getClaims().get("realm_access");
            if (realmAccessObj instanceof java.util.Map<?, ?> realmAccess) {
                Object rolesObj = realmAccess.get("roles");
                if (rolesObj instanceof java.util.List<?> roles) {
                    for (Object role : roles) {
                        if (role instanceof String roleName && !roleName.isBlank()) {
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase()));
                        }
                    }
                }
            }

            return authorities;
        });
        return converter;
    }
}
