# API & CORS – Configuration (port 8098)

L’app Angular tourne sur **http://localhost:4200** et appelle l’API sur **http://localhost:8098** (préfixe `/api/v1/`).

## 1. Utiliser le proxy (recommandé)

- Démarrer l’app avec : **`npm start`** (et non `ng serve` sans proxy).
- Le proxy redirige toutes les requêtes `http://localhost:4200/api/*` vers `http://localhost:8098/api/*`.
- Ainsi, le navigateur ne fait que des requêtes vers 4200 → pas de CORS.

Si vous voyez des erreurs CORS vers `http://localhost:8098`, soit le proxy n’est pas actif (relancer avec `npm start`), soit une requête utilise une URL absolue vers 8098 (à corriger côté front).

## 2. CORS côté backend (port 8098)

Si des requêtes partent quand même vers **8098** (ou pour les appels directs en dev), le serveur doit autoriser l’origine **http://localhost:4200**.

Exemple Spring Boot :

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

Ou avec un filtre :

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }
}
```

## 3. Endpoints attendus par le front

- `GET /api/v1/onlinecourses/all`
- `GET /api/v1/onsitecourses/all`
- `GET /api/v1/classrooms/all`
- `GET /api/v1/online-sessions/getAll`
- `GET /api/v1/onsite-sessions/all` (si utilisé)
- `GET /api/v1/online-bookings/getAll`
- `GET /api/v1/onsite-bookings/all`

Les réponses 404 sur `http://localhost:4200/api/...` indiquent en général que le proxy ne s’applique pas (relancer avec `npm start`) ou que le backend 8098 n’est pas démarré.
