# 🔒 CORS Error Fix Guide

## ❌ Error You're Seeing

```
Access to XMLHttpRequest at 'http://localhost:8085/products/deleteProduct/2' 
from origin 'http://localhost:4300' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Translation**: Your Spring Boot backend/API Gateway is blocking requests from your Angular frontend because they're on different ports.

---

## ✅ Solution: Configure CORS in Spring Boot

You need to add CORS configuration to your Spring Boot project(s).

### Option 1: Global CORS Configuration (Recommended)

Create a CORS configuration class in your Spring Boot project:

**File**: `src/main/java/com/yourpackage/config/CorsConfig.java`

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Allow Angular dev servers
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:4300"
        ));
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Apply to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### Option 2: WebMvcConfigurer (Alternative)

**File**: `src/main/java/com/yourpackage/config/WebConfig.java`

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:4200",
                    "http://localhost:4300"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Option 3: Controller-Level (Quick Fix)

Add `@CrossOrigin` annotation to your controller:

```java
package com.yourpackage.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4300"})
public class ProductController {

    @GetMapping("/allProducts")
    public List<Product> getAllProducts() {
        // your code
    }
    
    @PostMapping("/addProduct")
    public Product addProduct(@RequestBody Product product) {
        // your code
    }
    
    @PutMapping("/updateProduct/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        // your code
    }
    
    @DeleteMapping("/deleteProduct/{id}")
    public void deleteProduct(@PathVariable Long id) {
        // your code
    }
}
```

---

## 🌐 API Gateway CORS Configuration

If you're using **Spring Cloud Gateway**, you need CORS configuration there too:

**File**: `application.yml` or `application.properties`

### YAML Configuration:
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins:
              - "http://localhost:4200"
              - "http://localhost:4300"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
              - PATCH
            allowedHeaders:
              - "*"
            allowCredentials: true
            maxAge: 3600
```

### Properties Configuration:
```properties
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-origins=http://localhost:4200,http://localhost:4300
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-headers=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allow-credentials=true
spring.cloud.gateway.globalcors.cors-configurations.[/**].max-age=3600
```

### Java Configuration for Gateway:
```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class GatewayCorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:4300"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
```

---

## 🔧 Where to Apply CORS Configuration

Based on your architecture:

1. **✅ API Gateway (Port 8085)** - Most important! Apply CORS here
2. **✅ Product Service (Port 8089)** - Apply CORS here too
3. **✅ Any other microservices** - Apply CORS configuration

---

## 📝 Step-by-Step Instructions

### Step 1: Add CORS to API Gateway
1. Open your API Gateway project (port 8085)
2. Create `CorsConfig.java` or add to `application.yml`
3. Add the CORS configuration from above
4. Restart the Gateway

### Step 2: Add CORS to Product Service
1. Open your Product Service project (port 8089)
2. Create `CorsConfig.java` configuration
3. Restart the service

### Step 3: Test
1. Start API Gateway: `mvn spring-boot:run` (port 8085)
2. Start Product Service: `mvn spring-boot:run` (port 8089)
3. Start Angular Frontend: `npm run start:frontend` (port 4200)
4. Start Angular Backend: `npm run start:backend` (port 4300)
5. Try adding/updating/deleting products

---

## ✅ Verification

After adding CORS configuration, you should see in browser Network tab:

**Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:4300
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
```

**Console Logs (should work without errors):**
```
[ProductService] Adding new product: {...}
[ProductService] Product added successfully: {...}
```

---

## 🚨 Common Issues

### Issue 1: Still getting CORS error after configuration
**Solution**: 
- Make sure you've restarted the Spring Boot services
- Clear browser cache (Ctrl+Shift+Delete)
- Check if you're using the correct port (8085 for Gateway)

### Issue 2: CORS works for GET but not POST/PUT/DELETE
**Solution**: 
- Add "OPTIONS" to allowed methods
- Make sure `allowCredentials(true)` is set

### Issue 3: Multiple CORS configurations conflict
**Solution**: 
- Remove `@CrossOrigin` from controllers if using global config
- Only configure CORS once (preferably globally)

---

## 🔒 Production Configuration

For production, replace `localhost` with your actual domain:

```java
config.setAllowedOrigins(Arrays.asList(
    "https://your-frontend-domain.com",
    "https://your-admin-domain.com"
));
```

**Never use** `*` (wildcard) with `allowCredentials(true)` - it won't work!

```java
// ❌ DON'T DO THIS
config.setAllowedOrigins(Arrays.asList("*"));
config.setAllowCredentials(true);

// ✅ DO THIS
config.setAllowedOrigins(Arrays.asList("http://localhost:4300"));
config.setAllowCredentials(true);
```

---

## 🎯 Quick Fix Checklist

- [ ] Create `CorsConfig.java` in API Gateway project
- [ ] Add allowed origins: `http://localhost:4200`, `http://localhost:4300`
- [ ] Add allowed methods: `GET, POST, PUT, DELETE, OPTIONS`
- [ ] Set `allowCredentials(true)`
- [ ] Restart Spring Boot services
- [ ] Clear browser cache
- [ ] Test add/update/delete operations
- [ ] Check browser console for success logs
- [ ] Check Network tab for CORS headers

---

## 📞 Need More Help?

If CORS errors persist:

1. Check Spring Boot console for errors
2. Verify ports are correct (4300 → 8085 → 8089)
3. Ensure all services are running
4. Check if API Gateway is properly routing to Product Service
5. Test Product Service directly (without Gateway) to isolate issue

---

## ✨ Expected Result

After fixing CORS, your Angular app should successfully:
- ✅ Add new products
- ✅ Update existing products  
- ✅ Delete products
- ✅ Load products list

Console logs will show:
```
[ProductService] Product added successfully: {...}
[ProductService] Product updated successfully: {...}
[ProductService] Product deleted successfully
```

No more CORS errors! 🎉
