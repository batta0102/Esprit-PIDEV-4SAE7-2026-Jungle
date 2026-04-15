package com.example.pi4eme02.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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

            java.util.Set<String> roles = new java.util.HashSet<>();

            Object realmAccessObj = jwt.getClaims().get("realm_access");
            if (realmAccessObj instanceof java.util.Map<?, ?> realmAccess) {
                Object rolesObj = realmAccess.get("roles");
                if (rolesObj instanceof java.util.List<?> roleList) {
                    for (Object role : roleList) {
                        if (role instanceof String roleName && !roleName.isBlank()) {
                            roles.add(roleName.toUpperCase());
                        }
                    }
                }
            }

            Object resourceAccessObj = jwt.getClaims().get("resource_access");
            if (resourceAccessObj instanceof java.util.Map<?, ?> resourceAccess) {
                for (Object clientValue : resourceAccess.values()) {
                    if (clientValue instanceof java.util.Map<?, ?> clientMap) {
                        Object rolesObj = clientMap.get("roles");
                        if (rolesObj instanceof java.util.List<?> roleList) {
                            for (Object role : roleList) {
                                if (role instanceof String roleName && !roleName.isBlank()) {
                                    roles.add(roleName.toUpperCase());
                                }
                            }
                        }
                    }
                }
            }

            for (String role : roles) {
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
            }

            // Backward compatibility: student tokens may carry ETUDIANT/STUDENT instead of USER.
            if (roles.contains("ETUDIANT") || roles.contains("STUDENT")) {
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
            }

            return authorities;
        });
        return converter;
    }
}
