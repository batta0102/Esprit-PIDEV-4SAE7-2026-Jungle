# Configuration CORS pour Spring Boot

## Ajoute ces annotations à ton Controller Spring:

```java
@RestController
@RequestMapping("/api/memberships")
@CrossOrigin(
    origins = {"http://localhost:4200", "http://localhost:4201", "http://localhost:57060"},
    allowedHeaders = {"Content-Type", "Authorization", "Accept"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "false"
)
public class ClubMembershipController {
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClubMembership>> getMembershipsByUser(@PathVariable Long userId) {
        // Logique pour récupérer les adhésions d'un utilisateur
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<ClubMembership>> getAllMemberships() {
        // Logique pour récupérer toutes les adhésions
    }
}
```

## Ou ajoute un WebConfig global:

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        CorsConfiguration config = new CorsConfiguration();
        
        // Autoriser plusieurs origines
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:4201", 
            "http://localhost:57060"
        ));
        
        // Autoriser tous les headers nécessaires
        config.setAllowedHeaders(Arrays.asList(
            "Content-Type",
            "Authorization",
            "Accept",
            "X-Requested-With"
        ));
        
        // Autoriser toutes les méthodes HTTP
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        
        // Ne pas envoyer les credentials
        config.setAllowCredentials(false);
        
        registry.addMapping("/api/**", config);
    }
}
```

## Test après modification:

1. Redémarre ton backend Spring
2. Teste l'endpoint: curl http://localhost:9090/api/memberships/all
3. Vérifie que tu as les headers CORS dans la réponse
