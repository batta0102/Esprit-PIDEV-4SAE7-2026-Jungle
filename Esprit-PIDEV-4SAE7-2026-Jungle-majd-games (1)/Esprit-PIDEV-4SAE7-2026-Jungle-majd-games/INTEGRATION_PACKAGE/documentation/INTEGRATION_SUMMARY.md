# Integration Summary

## Overview

This Angular 21 frontend includes a complete integration with an API Gateway for managing products, recommendations, orders, and deliveries. The architecture uses:

- **Frontend**: Angular 21.1.4 with standalone components
- **API Gateway**: http://localhost:8085/api (accessed via proxy)
- **Authentication**: Keycloak SSO with JWT tokens
- **Build Tool**: ng serve with proxy configuration

## Architecture

### Request Flow

```
Browser → Angular App (localhost:4200)
         ↓
         Angular Services (ProductService, OrderService, etc.)
         ↓
         HttpClient + Interceptor (Adds JWT token)
         ↓
         Proxy (localhost:4200/api → localhost:8085/api)
         ↓
         API Gateway (localhost:8085)
         ↓
         Microservices (Products, Orders, Deliveries, etc.)
```

### Key Services

1. **ProductService** - Get/Create/Update/Delete products
2. **RecommendationService** - Fetch recommendations based on user or product
3. **OrderService** - Manage orders (requires JWT)
4. **DeliveryService** - Manage deliveries (requires JWT)
5. **ReviewService** - Handle product reviews
6. **AuthService** - Keycloak authentication & token management

### URL Utility

All services use `buildApiUrl()` helper to prevent double slashes:
```typescript
buildApiUrl('/api', 'products', 'allProducts')
// Result: /api/products/allProducts

buildApiUrl('/api', '/api/orders')
// Result: /api/orders (removes duplicate /api)
```

## Configuration Files

### environment.ts
```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api',  // All services use this base URL
  gatewayUrl: 'http://localhost:8085'  // Reference only
};
```

### proxy.conf.json
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

Startup command:
```bash
ng serve --proxy-config proxy.conf.json
```

## Authentication Flow

1. **App Initialization**
   - AuthService initializes Keycloak
   - Checks for existing SSO session
   - Falls back to guest mode if no session

2. **User Login**
   - Call `authService.login()` → Keycloak login page
   - JWT token stored in browser
   - AuthService.currentUser signals update

3. **API Requests**
   - KeycloakInterceptor captures outgoing requests
   - Checks if request is to `/api/*`
   - Adds `Authorization: Bearer <token>` header
   - Request forwards to API Gateway

4. **Token Refresh**
   - Keycloak automatically refreshes expired tokens
   - Interceptor waits for token refresh before retrying

## API Endpoints

### Products (No Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/allProducts` | GET | All products |
| `/api/products/getProduct/{id}` | GET | Single product |
| `/api/products/addProduct` | POST | Create product |
| `/api/products/updateProduct/{id}` | PUT | Update product |
| `/api/products/deleteProduct/{id}` | DELETE | Delete product |

### Recommendations (No Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recommendations/me?limit=3` | GET | User recommendations |
| `/api/recommendations/product/{id}?limit=6` | GET | Similar products |

### Orders (Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders/allOrders` | GET | All orders |
| `/api/orders/create` | POST | Create order |

### Deliveries (Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/deliveries/Alldelivery` | GET | All deliveries |
| `/api/deliveries/create` | POST | Create delivery |

### Reviews (Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reviews/create` | POST | Create review |
| `/api/reviews/product/{id}` | GET | Product reviews |

## File Structure

Essential files for integration:

```
src/Frontend/app/
├── core/
│   ├── api.service.ts          # Main API service
│   ├── auth/
│   │   ├── auth.service.ts     # Keycloak integration
│   │   └── keycloak.interceptor.ts
│   ├── recommendations/
│   │   ├── recommendation.model.ts
│   │   └── recommendation.service.ts
│   └── user/
│       └── user-context.service.ts
├── shared/
│   ├── utils/
│   │   └── url.helper.ts       # URL building utility
│   ├── models/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── delivery.model.ts
│   └── product/ (or renamed to shared/)
│       └── product.ts          # Product service
├── environments/
│   ├── environment.ts          # Dev config
│   ├── environment.prod.ts     # Prod config
│   └── environment.development.ts
└── pages/
    ├── products/               # Products & recommendations
    ├── orders/                 # Order management
    └── ...
```

## Important Notes

1. **Environment Variables**: All services read from `environment.apiBaseUrl` - never hardcode URLs
2. **JWT Tokens**: KeycloakInterceptor handles token injection automatically
3. **URL Helper**: Always use `buildApiUrl()` to prevent double slashes
4. **Recommendations**: Limited to 3 items, shows title + category only (no order count)
5. **CORS**: Handled via proxy - requests never expose CORS issues to browser

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on `/api/products` | Check proxy.conf.json is in root; start with `--proxy-config proxy.conf.json` |
| 401 Unauthorized | Token not added? Check KeycloakInterceptor; is Keycloak running on localhost:8180? |
| 502 Bad Gateway | Is API Gateway running on localhost:8085? Check proxy target URL |
| CORS errors | Should not happen with proxy - check dev server startup command |
| Double slashes in URLs | Always use `buildApiUrl()` instead of string concatenation |

## Next Steps

1. Copy all files from INTEGRATION_PACKAGE to your project
2. Install dependencies: `npm install`
3. Start API Gateway on localhost:8085
4. Start Keycloak on localhost:8180 (if not already running)
5. Run: `npm start` (starts dev server with proxy)
6. Navigate to http://localhost:4200
