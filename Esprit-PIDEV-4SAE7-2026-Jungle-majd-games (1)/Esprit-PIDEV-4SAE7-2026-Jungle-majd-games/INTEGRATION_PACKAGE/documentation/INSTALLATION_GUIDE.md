# Installation & Setup Guide

## Prerequisites

- Node.js 18+ and npm 10+
- Angular CLI 21+
- API Gateway running on localhost:8085
- Keycloak SSO server on localhost:8180 (optional for guest mode)

## Step-by-Step Installation

### 1. Prepare Your Project

Copy all files from `INTEGRATION_PACKAGE` to your Angular project:

```bash
# Create directories if they don't exist
mkdir -p src/app/core/{auth,recommendations,models}
mkdir -p src/app/shared/{utils,models}

# Copy authentication files
cp INTEGRATION_PACKAGE/core/auth/auth.service.ts src/app/core/auth/
cp INTEGRATION_PACKAGE/core/auth/keycloak.interceptor.ts src/app/core/auth/

# Copy recommendation files
cp INTEGRATION_PACKAGE/core/recommendations/recommendation.service.ts src/app/core/recommendations/
cp INTEGRATION_PACKAGE/core/models/recommendation.model.ts src/app/core/models/

# Copy shared utilities
cp INTEGRATION_PACKAGE/shared/product.service.ts src/app/shared/
cp INTEGRATION_PACKAGE/shared/utils/url.helper.ts src/app/shared/utils/

# Copy environment configuration
cp INTEGRATION_PACKAGE/environments/environment.ts src/app/environments/

# Copy proxy and API service
cp INTEGRATION_PACKAGE/core/api.service.ts src/app/core/
cp INTEGRATION_PACKAGE/config/proxy.conf.json .
```

### 2. Install Dependencies

```bash
npm install
```

Key dependencies that should be installed:
- `@angular/core` ^21.1.0
- `@angular/common` ^21.1.0
- `@angular/forms` ^21.1.0
- `keycloak-js` ^24.0.0

### 3. Configure app.config.ts

Update your `app.config.ts` to include the KeycloakInterceptor:

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { appRoutes } from './app.routes';
import { KeycloakInterceptor } from './core/auth/keycloak.interceptor';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakInterceptor,
      multi: true
    }
  ]
};
```

### 4. Initialize Auth Service

In your `main.ts` or app initialization component:

```typescript
import { AuthService } from './app/core/auth/auth.service';

async function initializeApp(authService: AuthService) {
  await authService.init();
}

bootstrapApplication(App, {
  providers: [
    appConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ]
});
```

### 5. Configure Proxy

Your `proxy.conf.json` should look like:

```json
{
  "/api": {
    "target": "http://localhost:8085",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### 6. Start Development Server

```bash
# Start with proxy configuration
ng serve --proxy-config proxy.conf.json

# Or using npm script (if configured in package.json)
npm run dev
```

The app will be available at: **http://localhost:4200**

## Verify Integration

### 1. Check Environment Configuration

In browser console:
```javascript
// Should work without errors
fetch('/api/products/allProducts').then(r => r.json()).then(console.log)
```

### 2. Check Axios Interceptor

Make any API call and check console for:
```
[Interceptor] Bearer token attached to: GET /api/products/allProducts
```

### 3. Verify Services Are Loaded

```typescript
// In any component
import { ProductService } from './shared/product.service';
import { RecommendationService } from './core/recommendations/recommendation.service';

constructor(private products: ProductService, private recommendations: RecommendationService) {
  this.products.getAllProducts().subscribe(console.log);
  this.recommendations.getRecommendationsForMe(3).subscribe(console.log);
}
```

## Configuration

### Environment Variables

Edit `src/app/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api',  // Keep as /api for proxy
  gatewayUrl: 'http://localhost:8085'  // Reference only
};
```

Edit `src/app/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'http://your-api-gateway.com/api',  // Direct URL in production
  gatewayUrl: 'http://your-api-gateway.com'
};
```

### Keycloak Configuration

Edit `src/app/core/auth/auth.service.ts`:

```typescript
const keycloakConfig = {
  url: 'http://your-keycloak-server:8180',  // Change this
  realm: 'your-realm',  // Change this
  clientId: 'your-angular-client'  // Change this
};
```

## Testing Integration

### Test Product Service

```typescript
// In component
constructor(private productService: ProductService) {}

ngOnInit() {
  this.productService.getAllProducts().subscribe(
    products => console.log('Products:', products),
    error => console.error('Error:', error)
  );
}
```

Expected output:
```
[ProductService] Fetching all products: /api/products/allProducts
[ProductService] Loaded 5 products
[ProductService] First product: {idProduct: 1, name: "Product 1", ...}
```

### Test Recommendations

```typescript
constructor(private recommendationService: RecommendationService) {}

ngOnInit() {
  this.recommendationService.getRecommendationsForMe(3).subscribe(
    recommendations => console.log('Recommendations:', recommendations),
    error => console.error('Error:', error)
  );
}
```

Expected output:
```
[RecommendationService] Fetching recommendations for current user: /api/recommendations/me?limit=3
[RecommendationService] Loaded 3 recommendations for current user
```

### Test Authentication

```typescript
constructor(private authService: AuthService) {}

ngOnInit() {
  // Check if user is logged in
  console.log('Is logged in:', this.authService.isLoggedIn());
  
  // Access current user
  console.log('Current user:', this.authService.currentUser());
}

login() {
  this.authService.login();
}

logout() {
  this.authService.logout();
}
```

## Troubleshooting

### Issue: 404 Not Found on /api/products

**Problem**: Proxy not working
**Solution**:
1. Verify `proxy.conf.json` is in project root
2. Start dev server with: `ng serve --proxy-config proxy.conf.json`
3. Check dev server console for: `[Proxy] GET /api/products → http://localhost:8085/api/products`

### Issue: 502 Bad Gateway

**Problem**: API Gateway not running
**Solution**:
1. Check API Gateway is running on http://localhost:8085
2. Test directly: `curl http://localhost:8085/api/products/allProducts`
3. Update proxy.conf.json target URL if gateway is on different port

### Issue: 401 Unauthorized on Protected Routes

**Problem**: JWT token not being added
**Solution**:
1. Check browser console logs for `[Interceptor] Bearer token attached to: ...`
2. Verify Keycloak server is running on localhost:8180
3. Check if user is logged in: `authService.isLoggedIn()`
4. Manually test token: Check Network tab → Request Headers → Authorization

### Issue: CORS Errors

**Problem**: Requests blocked by CORS
**Solution**:
- CORS should not happen when using proxy
- If still occurring, check:
  1. Are you using proxy in development? `ng serve --proxy-config proxy.conf.json`
  2. For production, API Gateway must have CORS headers enabled

### Issue: Token Not Refreshing

**Problem**: Getting 401 after token expires
**Solution**:
1. Keycloak should auto-refresh tokens
2. Check Keycloak server is running
3. Verify `check-sso` is working: Should request `silent-check-sso.html`
4. Check browser Network tab for Keycloak refresh requests

## Next Steps

1. ✅ Install dependencies
2. ✅ Copy all files to your project
3. ✅ Configure AuthService with your Keycloak details
4. ✅ Start API Gateway on localhost:8085
5. ✅ Start dev server: `ng serve --proxy-config proxy.conf.json`
6. ✅ Test API calls in browser console
7. ✅ Implement login/logout UI
8. ✅ Build components that use services

## Support

For issues, check:
- `INTEGRATION_SUMMARY.md` - Architecture overview
- `COMPLETE_FILE_PATHS.md` - Original file locations in project
- Console logs with `[Service]` or `[Interceptor]` prefixes
- Network tab in browser DevTools for request/response details
