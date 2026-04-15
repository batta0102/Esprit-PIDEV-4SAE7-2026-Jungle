# INTEGRATION_PACKAGE - Quick Reference

## What's Included

This integration package contains all essential files needed to integrate the frontend code with your Angular project.

### Folder Structure

```
INTEGRATION_PACKAGE/
├── core/
│   ├── api.service.ts           # Main API service (multi-backend support)
│   ├── auth/
│   │   ├── auth.service.ts      # Keycloak authentication service
│   │   └── keycloak.interceptor.ts  # JWT token injection
│   ├── models/
│   │   └── recommendation.model.ts  # Product recommendation interface
│   └── recommendations/
│       └── recommendation.service.ts # Recommendation API calls
├── shared/
│   ├── utils/
│   │   └── url.helper.ts        # Safe URL building utility
│   ├── product.service.ts       # Product CRUD operations
│   └── models/
│       └── (place product, order models here)
├── environments/
│   └── environment.ts           # API configuration (apiBaseUrl: '/api')
├── config/
│   └── proxy.conf.json          # Dev server proxy configuration
└── documentation/
    ├── INTEGRATION_SUMMARY.md
    ├── INTEGRATION_GUIDE.md
    ├── COMPLETE_FILE_PATHS.md
    └── FILES_FOR_INTEGRATION.md
```

## Key Files

| File | Purpose | Location |
|------|---------|----------|
| `environment.ts` | API configuration with apiBaseUrl | `environments/` |
| `url.helper.ts` | Prevents double slashes in URLs | `shared/utils/` |
| `auth.service.ts` | Keycloak authentication | `core/auth/` |
| `keycloak.interceptor.ts` | Adds JWT token to requests | `core/auth/` |
| `recommendation.service.ts` | Fetch recommendations API | `core/recommendations/` |
| `product.service.ts` | Product CRUD operations | `shared/` |
| `proxy.conf.json` | Dev server proxy: `/api -> localhost:8085` | `config/` |

## Quick Start

### 1. Install Dependencies

All packages are in `package.json`:

```bash
npm install
```

### 2. Copy Files to Your Project

Copy each file to its corresponding location in your Angular project:

```
INTEGRATION_PACKAGE/core/auth/auth.service.ts 
  → your-project/src/Frontend/app/core/auth/auth.service.ts

INTEGRATION_PACKAGE/core/auth/keycloak.interceptor.ts 
  → your-project/src/Frontend/app/core/auth/keycloak.interceptor.ts

INTEGRATION_PACKAGE/core/recommendations/recommendation.service.ts 
  → your-project/src/Frontend/app/core/recommendations/recommendation.service.ts

INTEGRATION_PACKAGE/shared/product.service.ts 
  → your-project/src/Frontend/app/shared/product.service.ts

INTEGRATION_PACKAGE/shared/utils/url.helper.ts 
  → your-project/src/Frontend/app/shared/utils/url.helper.ts

INTEGRATION_PACKAGE/environments/environment.ts 
  → your-project/src/Frontend/app/environments/environment.ts

INTEGRATION_PACKAGE/config/proxy.conf.json 
  → your-project/proxy.conf.json
```

### 3. Update App Config

In your `app.config.ts`, provide the interceptor:

```typescript
import { KeycloakInterceptor } from './core/auth/keycloak.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([/* your interceptors */]),
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakInterceptor,
      multi: true
    }
  ]
};
```

### 4. Start Dev Server

```bash
npm start
# or
npm run dev
```

This starts the dev server with proxy:
- Requests to `/api/*` are forwarded to `http://localhost:8085/api/*`
- Run your API Gateway on `http://localhost:8085`

## API Endpoints

### Products
- **Get All**: `GET /api/products/allProducts`
- **Get One**: `GET /api/products/getProduct/{id}`
- **Create**: `POST /api/products/addProduct`
- **Update**: `PUT /api/products/updateProduct/{id}`
- **Delete**: `DELETE /api/products/deleteProduct/{id}`

### Recommendations
- **For User**: `GET /api/recommendations/me?limit=3`
- **For Product**: `GET /api/recommendations/product/{id}?limit=6`

### Orders (requires JWT)
- **Get All**: `GET /api/orders/allOrders`
- **Create**: `POST /api/orders/create`

### Deliveries (requires JWT)
- **Get All**: `GET /api/deliveries/Alldelivery`
- **Create**: `POST /api/deliveries/create`

## Important Notes

1. **Environment Configuration**
   - All services use `environment.apiBaseUrl` ('/api')
   - Gateway URL is 'http://localhost:8085' (reference only, don't hardcode)

2. **JWT Authentication**
   - KeycloakInterceptor automatically adds Bearer tokens
   - Only adds tokens to `/api/*` requests
   - Skips Keycloak endpoints (localhost:8180)

3. **API URL Building**
   - Always use `buildApiUrl()` from `url.helper.ts`
   - Prevents double slashes and duplicate path segments
   - Example: `buildApiUrl('/api', 'products', 'allProducts')`

4. **Recommendations**
   - Limited to 3 items in recommendations display
   - Shows only: title + category badge
   - Includes fallback to mock data for demo

## Troubleshooting

### CORS Errors
- Make sure proxy.conf.json is in root directory
- Start dev server with: `ng serve --proxy-config proxy.conf.json`

### 401 Unauthorized
- Token not being added? Check KeycloakInterceptor logs
- Is Keycloak running on localhost:8180?

### 502 Bad Gateway
- Is API Gateway running on localhost:8085?
- Check proxy.conf.json target URL

## Related Documentation

- See `INTEGRATION_GUIDE.md` for detailed setup instructions
- See `COMPLETE_FILE_PATHS.md` for exact file paths in the original project
- See `FILES_FOR_INTEGRATION.md` for list of all integration files
