# Spring Boot CORS Configuration Files

## 📁 Files in This Directory

This directory contains ready-to-use CORS configuration files for your Spring Boot backend services.

### Java Configuration Files

1. **`CorsConfig.java`** - For Spring MVC applications (non-reactive)
   - Use in: Product Service (port 8089) or any Spring Boot REST API
   - Framework: Spring Web MVC

2. **`GatewayCorsConfig.java`** - For Spring Cloud Gateway (reactive)
   - Use in: API Gateway (port 8085)
   - Framework: Spring WebFlux / Spring Cloud Gateway

### YAML Configuration File

3. **`application-cors.yml`** - YAML-based CORS configuration
   - Alternative to Java configuration
   - Sections for both Gateway and MVC
   - Copy to your `application.yml`

---

## 🚀 Quick Start

### Step 1: Identify Your Architecture

Your setup likely looks like this:
```
Angular Frontend (port 4200)
    ↓
Angular Backend Admin (port 4300)
    ↓
API Gateway (port 8085) ← Add CORS here!
    ↓
Product Service (port 8089) ← And here!
```

### Step 2: Add CORS to API Gateway

**Option A: Java Configuration (Recommended)**
1. Copy `GatewayCorsConfig.java` to your Gateway project
2. Place it in: `src/main/java/com/yourpackage/config/`
3. Update package name to match your project
4. Restart Gateway

**Option B: YAML Configuration**
1. Open your Gateway's `application.yml`
2. Copy the `spring.cloud.gateway.globalcors` section from `application-cors.yml`
3. Paste into your `application.yml`
4. Restart Gateway

### Step 3: Add CORS to Product Service

**Option A: Java Configuration (Recommended)**
1. Copy `CorsConfig.java` to your Product Service project
2. Place it in: `src/main/java/com/yourpackage/config/`
3. Update package name to match your project
4. Restart Product Service

**Option B: YAML Configuration**
1. Open your Product Service's `application.yml`
2. Copy the `spring.mvc.cors` section from `application-cors.yml`
3. Paste into your `application.yml`
4. Restart Product Service

---

## 📝 How to Use

### Using Java Configuration

1. **Create the config directory** (if it doesn't exist):
   ```
   src/main/java/com/yourpackage/config/
   ```

2. **Copy the appropriate file**:
   - Gateway → `GatewayCorsConfig.java`
   - Product Service → `CorsConfig.java`

3. **Update package declaration**:
   ```java
   package com.yourpackage.config;  // Change to match your project
   ```

4. **Restart the service**:
   ```bash
   mvn spring-boot:run
   # or
   ./mvnw spring-boot:run
   ```

### Using YAML Configuration

1. **Open `application.yml`** in your Spring Boot project

2. **Add the appropriate CORS configuration**:
   - For Gateway: Copy `spring.cloud.gateway.globalcors` section
   - For Product Service: Copy `spring.mvc.cors` section

3. **Save and restart**

---

## ✅ Verification

After adding CORS configuration, test your Angular app:

1. Start all services:
   ```bash
   # Terminal 1: API Gateway (port 8085)
   cd api-gateway
   mvn spring-boot:run

   # Terminal 2: Product Service (port 8089)
   cd product-service
   mvn spring-boot:run

   # Terminal 3: Angular apps
   cd jungle
   npm run start:both
   ```

2. Open Angular Admin: `http://localhost:4300/backend/products-management`

3. Try adding a product - it should work!

4. Check browser console for success logs:
   ```
   [ProductService] Product added successfully: {...}
   ```

5. Check Network tab for CORS headers:
   ```
   Access-Control-Allow-Origin: http://localhost:4300
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   ```

---

## 🔧 Troubleshooting

### Still getting CORS errors?

1. **Verify services are running**:
   - API Gateway on port 8085 ✓
   - Product Service on port 8089 ✓

2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - Clear "Cached images and files"

3. **Check configuration was applied**:
   - Restart Spring Boot services completely
   - Check console for errors during startup

4. **Verify ports in configuration**:
   - Make sure `localhost:4200` and `localhost:4300` are in allowed origins

5. **Check for conflicts**:
   - Only use ONE CORS configuration method (Java OR YAML, not both)
   - Don't mix `@CrossOrigin` annotations with global config

### Working for GET but not POST/PUT/DELETE?

Make sure you have:
- `OPTIONS` method in allowed methods
- `allowCredentials: true` set
- All headers allowed with `*`

---

## 🔒 Production Deployment

Before deploying to production:

1. **Replace localhost with your actual domains**:
   ```java
   config.setAllowedOrigins(Arrays.asList(
       "https://your-frontend.com",
       "https://admin.your-frontend.com"
   ));
   ```

2. **Never use wildcard with credentials**:
   ```java
   // ❌ DON'T DO THIS - Won't work!
   config.setAllowedOrigins(Arrays.asList("*"));
   config.setAllowCredentials(true);
   
   // ✅ DO THIS
   config.setAllowedOrigins(Arrays.asList("https://your-domain.com"));
   config.setAllowCredentials(true);
   ```

3. **Use environment variables**:
   ```java
   @Value("${cors.allowed.origins}")
   private String allowedOrigins;
   
   config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
   ```

---

## 📚 Additional Resources

- [Spring CORS Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors)
- [Spring Cloud Gateway CORS](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#cors-configuration)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 💡 Tips

- **Development**: Use `http://localhost` explicitly (don't use IP addresses)
- **Production**: Use HTTPS with proper domain names
- **Testing**: Use browser DevTools Network tab to inspect CORS headers
- **Debugging**: Check Spring Boot console for CORS-related errors

---

## ✨ Expected Behavior After Fix

✅ No CORS errors in browser console  
✅ Add Product works  
✅ Update Product works  
✅ Delete Product works  
✅ Network tab shows CORS headers in responses  
✅ Angular console shows success logs  

---

Need more help? Check `CORS_FIX_GUIDE.md` in the project root for detailed troubleshooting!
