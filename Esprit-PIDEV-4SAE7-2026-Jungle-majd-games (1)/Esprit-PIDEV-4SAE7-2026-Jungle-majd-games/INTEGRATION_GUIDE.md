# Angular Frontend Integration Guide

## Overview
This document provides a complete guide to integrate the product management, recommendations, orders, and deliveries features from this Angular frontend into another teammate's project.

---

## 1. FOLDER STRUCTURE FOR INTEGRATION

### Recommended Clean Structure for Sharing:
```
src/app/
├── core/
│   ├── api-config/
│   │   └── environment.ts                          # API configuration
│   ├── models/
│   │   ├── product.model.ts
│   │   ├── order.model.ts
│   │   ├── delivery.model.ts
│   │   └── recommendation.model.ts
│   ├── services/
│   │   ├── api.service.ts                          # Base API service
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── delivery.service.ts
│   │   ├── recommendation.service.ts
│   │   └── review.service.ts
│   └── auth/
│       └── auth.service.ts                         # For JWT token support
│
├── shared/
│   ├── utils/
│   │   └── url.helper.ts                           # URL building utility
│   ├── models/
│   │   ├── product.ts
│   │   └── order.ts
│   └── components/
│       ├── product/
│       ├── order/
│       └── recommendation-card/                     # Optional: recommendation display component
│
└── features/
    ├── products/
    │   ├── products.page.ts
    │   ├── products.page.html
    │   ├── products.page.scss
    │   └── product-detail.page.ts/.html/.scss
    ├── orders/
    │   └── orders.page.ts/.html/.scss
    └── recommendations/
        └── recommendations.component.ts/.html/.scss
```

---

## 2. COMPLETE FILES LIST FOR INTEGRATION

### CORE SERVICES (Use environment.apiBaseUrl for all APIs)

#### A. Environment Configuration
- **Path**: `src/Frontend/app/environments/environment.ts`
- **Purpose**: Defines API base URL
- **Key Config**: `apiBaseUrl: '/api'` (proxy to http://localhost:8085)

#### B. API Services

| File | Purpose | Endpoint | Notes |
|------|---------|----------|-------|
| `src/Frontend/app/core/api.service.ts` | Base API service gateway | N/A | Optional (for multi-backend support) |
| `src/Frontend/app/shared/product/product.ts` | Product service & model | `/api/products/allProducts` | Uses environment.apiBaseUrl |
| `src/Backend/app/services/order.service.ts` | Order management | `/api/orders/allOrders` | Located in Backend folder |
| `src/Backend/app/services/delivery.service.ts` | Delivery tracking | `/api/deliveries/Alldelivery` | Located in Backend folder |
| `src/Frontend/app/core/recommendations/recommendation.service.ts` | Product recommendations | `/api/recommendations/me?limit=3` | Returns top 3 products |

#### C. Models

| File | Purpose | Required Fields |
|------|---------|-----------------|
| `src/Frontend/app/shared/product/product.ts` | Product interface | idProduct, name, category, description, price, stock |
| `src/Backend/app/models/delivery.model.ts` | Delivery interface | idDelivery, deliveryAddress, deliveryStatus |
| `src/Frontend/app/core/recommendations/recommendation.model.ts` | Recommendation interface | id, title, category, ordersCount |
| `src/Backend/app/services/order.service.ts` | Order interface | idOrder, totalAmount, status, paymentMethod, address |

#### D. Shared Utilities
- **Path**: `src/Frontend/app/shared/utils/url.helper.ts`
- **Function**: `buildApiUrl()` - Safely constructs API URLs without double slashes
- **Usage**: `buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts')`

#### E. Authentication (Required for token support)
- **Path**: `src/Frontend/app/core/auth/auth.service.ts`
- **Purpose**: Manages JWT tokens, login/logout
- **Interceptor**: KeycloakInterceptor automatically adds Bearer token to all HTTP requests

### PAGES/FEATURES

| Path | Component | Includes Recommendations |
|------|-----------|------------------------|
| `src/Frontend/app/pages/products/products.page.ts/.html/.scss` | Products listing with filters | YES (top 3) |
| `src/Frontend/app/pages/products/product-detail.page.ts/.html/.scss` | Single product detail | NO |
| `src/Frontend/app/pages/orders/orders.page.ts/.html/.scss` | Orders listing | NO |

### SHARED COMPONENTS (Optional but helpful)

| Path | Purpose |
|------|---------|
| `src/Frontend/app/shared/product/product.ts` | Product model and service |
| `src/Frontend/app/shared/order/order.ts` | Order model |
| `src/Frontend/app/shared/take-order-dialog/take-order-dialog.component.ts` | Order creation dialog |

---

## 3. API ENDPOINTS USED

All endpoints use the proxy configuration and environment.apiBaseUrl:

```typescript
// Development (with proxy):
GET  /api/products/allProducts              → http://localhost:8085/api/products/allProducts
GET  /api/recommendations/me?limit=3        → http://localhost:8085/api/recommendations/me?limit=3
GET  /api/orders/allOrders                  → http://localhost:8085/api/orders/allOrders
GET  /api/deliveries/Alldelivery            → http://localhost:8085/api/deliveries/Alldelivery
POST /api/orders/                           → http://localhost:8085/api/orders/
POST /api/deliveries/                       → http://localhost:8085/api/deliveries/
```

---

## 4. DEPENDENCIES REQUIRED

### Core Angular Dependencies
```json
{
  "@angular/common": "^21.1.0",
  "@angular/core": "^21.1.0",
  "@angular/forms": "^21.1.0",
  "@angular/platform-browser": "^21.1.0",
  "@angular/router": "^21.1.0",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0"
}
```

### Authentication (If using Keycloak)
```json
{
  "keycloak-angular": "^21.0.0",
  "keycloak-js": "^26.2.3"
}
```

### Dev Dependencies
```json
{
  "@angular/cli": "^21.1.4",
  "@angular/compiler-cli": "^21.1.0",
  "typescript": "~5.9.2"
}
```

---

## 5. INTEGRATION STEPS

### Step 1: Copy Core Services
```bash
# Copy service files
cp -r src/Frontend/app/core/services/* <teammate-project>/src/app/core/services/
cp -r src/Frontend/app/core/models/* <teammate-project>/src/app/core/models/
cp src/Frontend/app/core/recommendations/* <teammate-project>/src/app/core/recommendations/
```

### Step 2: Copy Shared Utilities
```bash
# Copy utility files
cp -r src/Frontend/app/shared/utils/* <teammate-project>/src/app/shared/utils/
cp src/Frontend/app/shared/product/product.ts <teammate-project>/src/app/shared/models/
cp src/Frontend/app/shared/order/order.ts <teammate-project>/src/app/shared/models/
```

### Step 3: Copy API Models
```bash
# From Backend folder
cp src/Backend/app/models/* <teammate-project>/src/app/core/models/
cp src/Backend/app/services/* <teammate-project>/src/app/core/services/
```

### Step 4: Update Environment Configuration
- Ensure `environment.ts` has: `apiBaseUrl: '/api'`
- Configure proxy in `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:8085",
    "secure": false,
    "pathRewrite": { "^/api": "/api" }
  }
}
```

### Step 5: Setup Proxy Configuration
```bash
# Create proxy.conf.json in project root
cat > proxy.conf.json << 'EOF'
{
  "/api": {
    "target": "http://localhost:8085",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": "/api"
    }
  }
}
EOF
```

### Step 6: Import Services in App Configuration
```typescript
// app.config.ts or main.ts
import { HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakInterceptor } from './core/auth/keycloak.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakInterceptor,
      multi: true
    }
  ]
};
```

---

## 6. KEY FEATURES EXTRACTED

### Products Management
- ✅ List all products with filtering
- ✅ Sort by: Most Popular, Newest, Price (Low→High, High→Low), Top Rated
- ✅ Product detail view
- ✅ Search functionality
- ✅ Pagination (6 products per page)

### Recommendations System
- ✅ Displays top 3 recommended products (based on ordersCount)
- ✅ Shows: Product title, category badge
- ✅ "View Product" link to product detail
- ✅ Falls back to mock data if API returns empty
- ✅ Endpoint: `GET /api/recommendations/me?limit=3`

### Orders Management
- ✅ List user orders
- ✅ Order creation
- ✅ Order status tracking
- ✅ Payment method selection

### Deliveries
- ✅ Delivery address tracking
- ✅ Delivery status monitoring
- ✅ Integration with orders

---

## 7. CRITICAL NOTES FOR INTEGRATION

### ✅ Already Using environment.apiBaseUrl
All services already use `environment.apiBaseUrl` for API calls:
```typescript
// Example from ProductService
const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
```

### ✅ Clean Code Standards
- ❌ No unused imports
- ✅ Strong typing with interfaces
- ✅ Proper error handling
- ✅ Service injection using `inject()`
- ✅ OnPush change detection
- ✅ RxJS best practices with `takeUntilDestroyed()`

### ⚠️ Authentication Required
- Recommendations API requires JWT token (user must be logged in)
- Token automatically added via KeycloakInterceptor
- Service checks `auth.isLoggedIn()` before fetching recommendations

### ⚠️ Proxy Configuration Required
All API calls use `/api` proxy path (not direct URLs) to avoid CORS issues:
- Development: `/api` → `http://localhost:8085/api`
- Production: Update proxy target or use direct API gateway URL

### ⚠️ Optional Fields in Recommendation Model
```typescript
interface RecommendationProduct {
  id: number;
  title: string;
  category: string;
  ordersCount: number;
  // Optional - may not be returned by backend:
  avgRating?: number;
  ratingCount?: number;
  score?: number;
}
```

---

## 8. COMPONENTS & PAGES TO COPY

### Minimal Integration (Just Services)
```
✅ Core Services
✅ Models
✅ Utilities (url.helper.ts)
✅ Environment config
```

### Full Integration (With UI)
```
✅ core/services/
✅ core/models/
✅ shared/utils/
✅ shared/product/
✅ shared/order/
✅ pages/products/
✅ pages/orders/
```

---

## 9. TESTING THE INTEGRATION

### Test Product Loading
```typescript
// In component
constructor(private productService: ProductService) {
  this.productService.getAllProducts().subscribe(products => {
    console.log('Products loaded:', products);
  });
}
```

### Test Recommendations
```typescript
// In component
constructor(private recommendationService: RecommendationService) {
  this.recommendationService.getRecommendationsForMe(3).subscribe(recs => {
    console.log('Recommendations:', recs);
  });
}
```

### Verify API Calls
- Open DevTools Network tab
- Check that requests go to `/api/...` 
- Verify proxy forwards to `http://localhost:8085/api/...`

---

## 10. TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| CORS errors | Verify proxy.conf.json is configured and running with `--proxy-config` |
| 401 Unauthorized on recommendations | Ensure user is logged in and JWT token is valid |
| 404 on API endpoints | Check API Gateway is running on http://localhost:8085 |
| Recommendation returns empty | Service falls back to mock data; check console logs |
| Double slashes in URLs | `url.helper.ts` handles this; verify buildApiUrl() usage |

---

## 11. FILES CHECKLIST FOR SHARING

### Core Service Files (MUST HAVE)
- [ ] `src/Frontend/app/environments/environment.ts`
- [ ] `src/Frontend/app/core/api.service.ts`
- [ ] `src/Frontend/app/shared/utils/url.helper.ts`

### Product Management (MUST HAVE)
- [ ] `src/Frontend/app/shared/product/product.ts`
- [ ] `src/Frontend/app/core/recommendations/recommendation.model.ts`
- [ ] `src/Frontend/app/core/recommendations/recommendation.service.ts`

### Order & Delivery (MUST HAVE)
- [ ] `src/Backend/app/services/order.service.ts`
- [ ] `src/Backend/app/services/delivery.service.ts`
- [ ] `src/Backend/app/models/delivery.model.ts`
- [ ] `src/Frontend/app/shared/order/order.ts`

### Pages (OPTIONAL - for UI)
- [ ] `src/Frontend/app/pages/products/products.page.ts/.html/.scss`
- [ ] `src/Frontend/app/pages/products/product-detail.page.ts/.html/.scss`
- [ ] `src/Frontend/app/pages/orders/orders.page.ts/.html/.scss`

### Support Files (RECOMMENDED)
- [ ] `src/Frontend/app/core/auth/auth.service.ts`
- [ ] `src/Frontend/app/core/auth/keycloak.interceptor.ts`

---

## 12. SUMMARY

**To successfully integrate:**

1. ✅ Copy all files from the MUST HAVE list
2. ✅ Install Angular 21.1+ and RxJS 7.8+
3. ✅ Configure environment.apiBaseUrl
4. ✅ Setup proxy.conf.json
5. ✅ Import services in app config
6. ✅ Verify API Gateway running on http://localhost:8085

**Result:** Fully functional product management, recommendations, orders, and deliveries system.

---

**Last Updated**: March 5, 2026  
**Angular Version**: 21.1.4  
**TypeScript Version**: 5.9.2
