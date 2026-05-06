package tn.esprit.ressources.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class FeignAuthForwardingInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        String token = resolveAccessToken();
        if (token != null && !token.isBlank()) {
            template.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
    }

    private String resolveAccessToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return null;
        }

        Object credentials = authentication.getCredentials();
        if (credentials instanceof String token && !token.isBlank() && !"N/A".equals(token)) {
            return token;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            return jwt.getTokenValue();
        }

        return null;
    }
}
