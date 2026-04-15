# Complete Folder Tree & File Paths for Integration

## SOURCE FOLDER STRUCTURE (CURRENT PROJECT)

```
src/
├── Frontend/
│   └── app/
│       ├── app.config.ts
│       ├── app.routes.ts
│       ├── environments/
│       │   ├── environment.ts                    ✅ COPY (API config)
│       │   ├── environment.development.ts
│       │   └── environment.prod.ts
│       ├── core/
│       │   ├── api.service.ts                    ✅ COPY (Base service)
│       │   ├── auth/
│       │   │   ├── auth.service.ts               ✅ COPY (Token management)
│       │   │   ├── auth.guard.ts
│       │   │   ├── keycloak.interceptor.ts       ✅ COPY (JWT interceptor)
│       │   │   └── ...auth related files
│       │   ├── recommendations/
│       │   │   ├── recommendation.model.ts       ✅ COPY (Model)
│       │   │   └── recommendation.service.ts     ✅ COPY (Service)
│       │   ├── services/
│       │   │   ├── review.service.ts             ⚠️ OPTIONAL
│       │   │   └── ...other services
│       │   ├── data/
│       │   ├── gamification/
│       │   ├── i18n/
│       │   ├── library/
│       │   └── user/
│       ├── shared/
│       │   ├── utils/
│       │   │   ├── url.helper.ts                 ✅ COPY (URL building)
│       │   │   └── download.ts
│       │   ├── product/
│       │   │   └── product.ts                    ✅ COPY (Product service & model)
│       │   ├── order/
│       │   │   └── order.ts                      ✅ COPY (Order model)
│       │   ├── take-order-dialog/
│       │   │   ├── take-order-dialog.component.ts
│       │   │   ├── take-order-dialog.component.html
│       │   │   └── take-order-dialog.component.scss
│       │   ├── admin-nav-tabs/
│       │   ├── modal/
│       │   ├── navbar/
│       │   ├── resource-review-section/
│       │   ├── resource-reviews/
│       │   ├── review-modal/
│       │   └── ...other components
│       ├── pages/
│       │   ├── products/
│       │   │   ├── products.page.ts              ⚠️ OPTIONAL (UI)
│       │   │   ├── products.page.html            ⚠️ OPTIONAL (UI)
│       │   │   ├── products.page.scss            ⚠️ OPTIONAL (UI)
│       │   │   ├── product-detail.page.ts        ⚠️ OPTIONAL (UI)
│       │   │   ├── product-detail.page.html      ⚠️ OPTIONAL (UI)
│       │   │   └── product-detail.page.scss      ⚠️ OPTIONAL (UI)
│       │   ├── orders/
│       │   │   ├── orders.page.ts                ⚠️ OPTIONAL (UI)
│       │   │   ├── orders.page.html              ⚠️ OPTIONAL (UI)
│       │   │   └── orders.page.scss              ⚠️ OPTIONAL (UI)
│       │   ├── auth/
│       │   ├── clubs/
│       │   ├── evaluations/
│       │   ├── events/
│       │   ├── gamification/
│       │   ├── landing/
│       │   ├── library/
│       │   ├── profile/
│       │   ├── qcm/
│       │   └── trainings/
│       └── layouts/
├── Backend/
│   └── app/
│       ├── models/
│       │   ├── delivery.model.ts                 ✅ COPY (Delivery model)
│       │   └── resource.model.ts
│       ├── services/
│       │   ├── order.service.ts                  ✅ COPY (Order service)
│       │   ├── delivery.service.ts               ✅ COPY (Delivery service)
│       │   ├── product.service.ts
│       │   ├── resource.service.ts
│       │   └── review.service.ts                 ⚠️ OPTIONAL
│       └── ...other files
└── assets/
```

---

## EXACT FILE PATHS TO COPY

### ✅ TIER 1: ESSENTIAL - Core Configuration

```
FROM:  src/Frontend/app/environments/environment.ts
TO:    src/app/environments/environment.ts
TYPE:  Configuration File
SIZE:  ~200 bytes
PURPOSE: Define API base URL (/api)

FROM:  src/Frontend/app/shared/utils/url.helper.ts
TO:    src/app/shared/utils/url.helper.ts
TYPE:  Utility Function
SIZE:  ~1.5 KB
PURPOSE: Build API URLs safely (handles duplicate slashes)

FROM:  src/Frontend/app/core/api.service.ts
TO:    src/app/core/api.service.ts
TYPE:  Service Class
SIZE:  ~500 bytes
PURPOSE: Base API Gateway service (optional but included)
```

---

### ✅ TIER 2: CRITICAL - Product Management

```
FROM:  src/Frontend/app/shared/product/product.ts
TO:    src/app/shared/models/product.ts
TYPE:  Service + Interface
SIZE:  ~2 KB
PURPOSE: ProductService and Product interface
METHODS:
  - getAllProducts(): Observable<Product[]>
ENDPOINT: GET /api/products/allProducts

FROM:  src/Frontend/app/core/recommendations/recommendation.model.ts
TO:    src/app/core/models/recommendation.model.ts
TYPE:  TypeScript Interface
SIZE:  ~400 bytes
PURPOSE: RecommendationProduct interface definition
INTERFACE:
  interface RecommendationProduct {
    id: number;
    title: string;
    category: string;
    ordersCount: number;
    avgRating?: number;
    ratingCount?: number;
    score?: number;
  }

FROM:  src/Frontend/app/core/recommendations/recommendation.service.ts
TO:    src/app/core/services/recommendation.service.ts
TYPE:  Service Class
SIZE:  ~4 KB
PURPOSE: Fetch product recommendations
METHOD: getRecommendationsForMe(limit=10): Observable<RecommendationProduct[]>
ENDPOINT: GET /api/recommendations/me?limit=3
IMPORTANT: Requires JWT token (user must be logged in)
FALLBACK: Returns MOCK_RECOMMENDATIONS if API empty
```

---

### ✅ TIER 3: IMPORTANT - Order & Delivery

```
FROM:  src/Backend/app/services/order.service.ts
TO:    src/app/core/services/order.service.ts
TYPE:  Service Class
SIZE:  ~3.5 KB
PURPOSE: Order management API calls
METHODS:
  - getAllOrders(): Observable<Order[]>
  - getOrderById(id): Observable<Order>
  - createOrder(order): Observable<Order>
ENDPOINTS:
  - GET /api/orders/allOrders
  - GET /api/orders/getOrder/{id}
  - POST /api/orders/create
AUTHENTICATION: ✅ Requires JWT token

FROM:  src/Backend/app/services/delivery.service.ts
TO:    src/app/core/services/delivery.service.ts
TYPE:  Service Class
SIZE:  ~3.5 KB
PURPOSE: Delivery tracking API calls
METHODS:
  - getAllDeliveries(): Observable<Delivery[]>
  - getDeliveryById(id): Observable<Delivery>
  - createDelivery(delivery): Observable<Delivery>
ENDPOINTS:
  - GET /api/deliveries/Alldelivery
  - GET /api/deliveries/getDelivery/{id}
  - POST /api/deliveries/create
AUTHENTICATION: ✅ Requires JWT token

FROM:  src/Backend/app/models/delivery.model.ts
TO:    src/app/core/models/delivery.model.ts
TYPE:  TypeScript Interfaces
SIZE:  ~1 KB
PURPOSE: Delivery and related interfaces

FROM:  src/Frontend/app/shared/order/order.ts
TO:    src/app/shared/models/order.ts
TYPE:  Service + Interface
SIZE:  ~2 KB
PURPOSE: OrderService and Order interface
```

---

### ✅ TIER 4: REQUIRED - Authentication

```
FROM:  src/Frontend/app/core/auth/auth.service.ts
TO:    src/app/core/auth/auth.service.ts
TYPE:  Service Class
SIZE:  ~3 KB
PURPOSE: User authentication and JWT token management
METHODS:
  - login(username, password)
  - logout()
  - isLoggedIn(): boolean
  - getToken(): string
IMPORTANT: Called by RecommendationService.getRecommendationsForMe()

FROM:  src/Frontend/app/core/auth/keycloak.interceptor.ts
TO:    src/app/core/auth/keycloak.interceptor.ts
TYPE:  HTTP Interceptor
SIZE:  ~2 KB
PURPOSE: Automatically add JWT Bearer token to HTTP headers
IMPORTANT: Must register in app.config.ts providers
USAGE:
  {
    provide: HTTP_INTERCEPTORS,
    useClass: KeycloakInterceptor,
    multi: true
  }
```

---

### ⚠️ TIER 5: OPTIONAL - Reviews (Nice to have)

```
FROM:  src/Frontend/app/core/services/review.service.ts
TO:    src/app/core/services/review.service.ts
TYPE:  Service Class
SIZE:  ~1.5 KB
PURPOSE: Product review management
OPTIONAL: Not required for basic product/orders/recommendations
```

---

### ⚠️ TIER 6: OPTIONAL - UI Components (For Full Integration)

```
FROM:  src/Frontend/app/pages/products/products.page.ts
TO:    src/app/pages/products/products.page.ts
TYPE:  Angular Component
SIZE:  ~8 KB
PURPOSE: Products listing page with recommendations
FEATURES:
  ✅ Product grid (6 per page)
  ✅ Filtering by price range
  ✅ Search functionality
  ✅ 5 sort modes
  ✅ Pagination
  ✅ Display 3 recommendations
SIGNATURE: @Component({displayName: 'ProductsPage'})
IMPORTS: ProductService, RecommendationService, DeliveryService

FROM:  src/Frontend/app/pages/products/products.page.html
TO:    src/app/pages/products/products.page.html
TYPE:  Angular Template
SIZE:  ~12 KB
PURPOSE: Products page HTML markup
SECTIONS:
  ✅ Filter sidebar (price range selector)
  ✅ Recommendations section (3 products)
  ✅ Search bar
  ✅ Sort dropdown
  ✅ Products grid
  ✅ Pagination controls

FROM:  src/Frontend/app/pages/products/products.page.scss
TO:    src/app/pages/products/products.page.scss
TYPE:  SCSS Stylesheet
SIZE:  ~20 KB
PURPOSE: Products page styling
RESPONSIVE: 3-col (desktop) → 2-col (tablet) → 1-col (mobile)
USES: SCSS variables, grid-template-columns, media queries

FROM:  src/Frontend/app/pages/products/product-detail.page.ts
TO:    src/app/pages/products/product-detail.page.ts
TYPE:  Angular Component
SIZE:  ~3 KB
PURPOSE: Single product detail view
OPTIONAL: Only if you need product detail page

FROM:  src/Frontend/app/pages/products/product-detail.page.html
TO:    src/app/pages/products/product-detail.page.html
TYPE:  Angular Template
SIZE:  ~5 KB
PURPOSE: Product detail HTML

FROM:  src/Frontend/app/pages/products/product-detail.page.scss
TO:    src/app/pages/products/product-detail.page.scss
TYPE:  SCSS Stylesheet
SIZE:  ~8 KB
PURPOSE: Product detail styling

FROM:  src/Frontend/app/pages/orders/orders.page.ts
TO:    src/app/pages/orders/orders.page.ts
TYPE:  Angular Component
SIZE:  ~3 KB
PURPOSE: Orders listing page
OPTIONAL: Only if you need orders management

FROM:  src/Frontend/app/pages/orders/orders.page.html
TO:    src/app/pages/orders/orders.page.html
TYPE:  Angular Template
SIZE:  ~4 KB
PURPOSE: Orders page HTML

FROM:  src/Frontend/app/pages/orders/orders.page.scss
TO:    src/app/pages/orders/orders.page.scss
TYPE:  SCSS Stylesheet
SIZE:  ~6 KB
PURPOSE: Orders page styling
```

---

## PACKAGE.JSON DEPENDENCIES

### Add to your package.json

```json
{
  "dependencies": {
    "@angular/common": "^21.1.0",
    "@angular/core": "^21.1.0",
    "@angular/forms": "^21.1.0",
    "@angular/platform-browser": "^21.1.0",
    "@angular/platform-browser-dynamic": "^21.1.0",
    "@angular/router": "^21.1.0",
    "@angular/animations": "^21.1.0",
    "keycloak-angular": "^21.0.0",
    "keycloak-js": "^26.2.3",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.15.0"
  },
  "devDependencies": {
    "@angular/build": "^21.1.4",
    "@angular/cli": "^21.1.4",
    "@angular/compiler-cli": "^21.1.0",
    "typescript": "~5.9.2"
  }
}
```

---

## PROXY CONFIGURATION

### File: proxy.conf.json (Create in project root)

```json
{
  "/api": {
    "target": "http://localhost:8085",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": "/api"
    },
    "logLevel": "debug"
  }
}
```

### Run with proxy:
```bash
ng serve --proxy-config proxy.conf.json
```

---

## TSCONFIG PATHS (Optional but recommended)

### Add to tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@pages/*": ["src/app/pages/*"],
      "@models/*": ["src/app/core/models/*"],
      "@services/*": ["src/app/core/services/*"],
      "@utils/*": ["src/app/shared/utils/*"]
    }
  }
}
```

Then import like:
```typescript
import { ProductService } from '@services/product.service';
import { buildApiUrl } from '@utils/url.helper';
```

---

## MIGRATION CHECKLIST

### Phase 1: Core Services (Day 1)
- [ ] Copy Tier 1 files (environment, url.helper, api.service)
- [ ] Copy Tier 2 files (product service, recommendation service/model)
- [ ] Copy Tier 3 files (order, delivery services/models)
- [ ] Copy Tier 4 files (auth service, interceptor)
- [ ] Update package.json with dependencies
- [ ] Run `npm install`
- [ ] Test: `ng serve --proxy-config proxy.conf.json`

### Phase 2: Configuration (Day 1)
- [ ] Verify environment.ts has apiBaseUrl: '/api'
- [ ] Create proxy.conf.json
- [ ] Register KeycloakInterceptor in app.config.ts
- [ ] Test API calls in browser DevTools

### Phase 3: UI Components (Day 2-3)
- [ ] Copy Tier 6 files (products page)
- [ ] Copy optional orders page
- [ ] Add routing to pages
- [ ] Test UI rendering

### Phase 4: Testing & Verification (Day 3)
- [ ] Test product loading
- [ ] Test recommendations API (need logged-in user)
- [ ] Test order creation
- [ ] Test delivery tracking
- [ ] Verify no console errors

---

## FILE COUNT SUMMARY

| Category | Files | Size | Required |
|----------|-------|------|----------|
| Configuration | 3 | ~1 KB | ✅ YES |
| Services | 7 | ~20 KB | ✅ YES |
| Models/Interfaces | 4 | ~4 KB | ✅ YES |
| Authentication | 2 | ~5 KB | ✅ YES |
| UI Pages | 6 | ~50 KB | ⚠️ OPTIONAL |
| **TOTAL** | **22** | **~80 KB** | **~15 KB essential** |

---

## QUICK COPY COMMANDS

### Minimal Integration (Services Only)
```bash
# Create directories
mkdir -p src/app/core/{auth,services,models,recommendations}
mkdir -p src/app/shared/{utils,models}
mkdir -p src/app/environments

# Copy files
cp src/Frontend/app/environments/environment.ts src/app/environments/
cp src/Frontend/app/core/api.service.ts src/app/core/
cp src/Frontend/app/core/auth/auth.service.ts src/app/core/auth/
cp src/Frontend/app/core/auth/keycloak.interceptor.ts src/app/core/auth/
cp src/Frontend/app/core/recommendations/recommendation.* src/app/core/recommendations/
cp src/Frontend/app/shared/utils/url.helper.ts src/app/shared/utils/
cp src/Frontend/app/shared/product/product.ts src/app/shared/models/
cp src/Frontend/app/shared/order/order.ts src/app/shared/models/
cp src/Backend/app/services/order.service.ts src/app/core/services/
cp src/Backend/app/services/delivery.service.ts src/app/core/services/
cp src/Backend/app/models/delivery.model.ts src/app/core/models/
```

### Full Integration (Services + UI)
```bash
# All from minimal, plus:
mkdir -p src/app/pages/{products,orders}
cp -r src/Frontend/app/pages/products/* src/app/pages/products/
cp -r src/Frontend/app/pages/orders/* src/app/pages/orders/
```

---

**Last Updated**: March 5, 2026  
**Total Files**: 22 essential files  
**Angular Version**: 21.1.4  
**Delivery Format**: File paths and copy commands
