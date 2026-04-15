# Complete File Paths Reference

## Original Project Structure

All source files are located in the following paths within the original project:

### Authentication Files

```
src/Frontend/app/core/auth/
├── auth.service.ts           # Main authentication service
├── auth.guard.ts             # Route protection guard
├── auth.interceptor.ts       # Token injection interceptor  
├── keycloak.interceptor.ts   # (Optional) Alternative interceptor
├── user-context.service.ts   # User role/context management
└── callback.component.ts      # OAuth callback handler
```

### Service Files

```
src/Frontend/app/core/
├── api.service.ts            # Base API gateway service
├── notifications/
│   └── notification.service.ts
├── recommendations/
│   ├── recommendation.service.ts    # Fetch user/product recommendations
│   ├── recommendation.model.ts      # RecommendationProduct interface
│   └── recommendations-effect.ts
└── library/
    └── library.data.service.ts
```

```
src/Frontend/app/shared/
├── product/
│   └── product.ts             # Product service & interface
├── order/
│   ├── order.service.ts       # Order CRUD operations
│   ├── order-list/
│   └── order-shell/
├── delivery/
│   └── (delivery service files)
├── review/
│   ├── review.service.ts      # Review operations  
│   └── review.model.ts
├── utils/
│   ├── url.helper.ts          # buildApiUrl() utility
│   └── (other utilities)
└── models/
    ├── product.ts            # Product interface
    ├── order.ts              # Order interface
    ├── delivery.model.ts     # Delivery interface
    └── (other models)
```

### Configuration Files

```
src/Frontend/app/
├── environments/
│   ├── environment.ts         # Development config (apiBaseUrl: '/api')
│   ├── environment.prod.ts    # Production config
│   └── environment.development.ts
├── app.config.ts              # Angular app configuration
└── app.routes.ts              # Route definitions
```

```
Root project directory:
├── proxy.conf.json            # Dev server proxy configuration
├── angular.json               # Angular CLI configuration
├── package.json               # Dependencies & scripts
└── tsconfig.json              # TypeScript configuration
```

### Page Components (Optional but Recommended)

```
src/Frontend/app/pages/
├── products/
│   ├── products.page.ts       # Products listing with recommendations
│   ├── products.page.html
│   ├── products.page.scss
│   ├── product-detail.page.ts # Single product detail
│   ├── product-detail.page.html
│   └── product-detail.page.scss
│
├── orders/
│   ├── orders.page.ts         # Order management
│   ├── orders.page.html
│   └── orders.page.scss
│
├── deliveries/
│   ├── deliveries.page.ts     # Delivery tracking
│   ├── deliveries.page.html
│   └── deliveries.page.scss
│
└── (other pages)
```

## Files for Integration (Summary)

### Critical Files (MUST COPY)

These files are essential for API integration:

| File | Source Path | Integration Path | Purpose |
|------|-------------|------------------|---------|
| `environment.ts` | `src/Frontend/app/environments/environment.ts` | `src/app/environments/environment.ts` | API base URL config |
| `url.helper.ts` | `src/Frontend/app/shared/utils/url.helper.ts` | `src/app/shared/utils/url.helper.ts` | URL building utility |
| `api.service.ts` | `src/Frontend/app/core/api.service.ts` | `src/app/core/api.service.ts` | Base API service |
| `auth.service.ts` | `src/Frontend/app/core/auth/auth.service.ts` | `src/app/core/auth/auth.service.ts` | Keycloak auth |
| `keycloak.interceptor.ts` | `src/Frontend/app/core/auth/keycloak.interceptor.ts` | `src/app/core/auth/keycloak.interceptor.ts` | JWT injection |
| `product.service.ts` | `src/Frontend/app/shared/product/product.ts` | `src/app/shared/product.service.ts` | Product API |
| `recommendation.service.ts` | `src/Frontend/app/core/recommendations/recommendation.service.ts` | `src/app/core/recommendations/recommendation.service.ts` | Recommendations API |
| `recommendation.model.ts` | `src/Frontend/app/core/recommendations/recommendation.model.ts` | `src/app/core/models/recommendation.model.ts` | Recommendation type |
| `proxy.conf.json` | `proxy.conf.json` (root) | `proxy.conf.json` (root) | Dev proxy config |

### Additional Service Files (Recommended)

| File | Source Path | Purpose |
|------|-------------|---------|
| `order.service.ts` | `src/Frontend/app/shared/order/order.service.ts` | Order operations |
| `delivery.service.ts` | `src/Frontend/app/core/services/delivery.service.ts` | Delivery operations |
| `review.service.ts` | `src/Frontend/app/core/services/review.service.ts` | Product reviews |

### Model/Interface Files (Recommended)

| File | Source Path | Purpose |
|------|-------------|---------|
| `product.ts` | `src/Frontend/app/shared/models/product.ts` | Product interface |
| `order.ts` | `src/Frontend/app/shared/models/order.ts` | Order interface |
| `delivery.model.ts` | `src/Frontend/app/shared/models/delivery.model.ts` | Delivery interface |

### Page Components (Optional - for reference only)

| Component | Source Path | Purpose |
|-----------|-------------|---------|
| Products Page | `src/Frontend/app/pages/products/products.page.ts` | Product listing with recommendations |
| Product Detail | `src/Frontend/app/pages/products/product-detail.page.ts` | Single product view |
| Orders Page | `src/Frontend/app/pages/orders/orders.page.ts` | Order management UI |

## Mapping Guide

### How to locate files in your IDE

**To find any file in VS Code:**

1. **By Service Name**:
   - Product Service: `Ctrl+P` → type `product.service`
   - Auth Service: `Ctrl+P` → type `auth.service`
   - Recommendation Service: `Ctrl+P` → type `recommendation.service`

2. **By File Name**:
   - URL Helper: `Ctrl+P` → type `url.helper.ts`
   - Environment Config: `Ctrl+P` → type `environment.ts`
   - Proxy Config: `Ctrl+P` → type `proxy.conf.json`

3. **By Directory**:
   - Services: Open file explorer → `src/Frontend/app/core/` and `src/Frontend/app/shared/`
   - Environment: Open file explorer → `src/Frontend/app/environments/`
   - Config: Open file explorer → root directory for `proxy.conf.json`

## File Dependencies

### Service Dependencies Tree

```
ProductService
    └── url.helper.ts
    └── environment.ts
    └── HttpClient (Angular built-in)

RecommendationService
    └── url.helper.ts
    └── environment.ts
    └── recommendation.model.ts
    └── HttpClient (Angular built-in)

OrderService
    └── url.helper.ts
    └── environment.ts
    └── HttpClient (Angular built-in)

DeliveryService
    └── url.helper.ts
    └── environment.ts
    └── delivery.model.ts
    └── HttpClient (Angular built-in)

KeycloakInterceptor
    └── auth.service.ts
    └── environment.ts
    └── HttpClient (Angular built-in)

AuthService
    └── user-context.service.ts
    └── @keycloak/keycloak-js (npm package)
```

### Components Dependencies

```
ProductsPage
    └── ProductService
    └── RecommendationService (optional)
    └── environment.ts

ProductDetailPage
    └── ProductService

OrdersPage
    └── OrderService
    └── AuthService (for user context)
```

## Integration Checklist

Use this checklist to ensure all files are properly copied:

- [ ] Core > Auth Files
  - [ ] `auth.service.ts`
  - [ ] `keycloak.interceptor.ts`
  
- [ ] Core > API Service
  - [ ] `api.service.ts`
  
- [ ] Core > Recommendations
  - [ ] `recommendation.service.ts`
  - [ ] `recommendation.model.ts`
  
- [ ] Shared > Utils
  - [ ] `url.helper.ts`
  
- [ ] Shared > Services
  - [ ] `product.service.ts`
  - [ ] `order.service.ts` (optional)
  - [ ] `delivery.service.ts` (optional)
  
- [ ] Shared > Models
  - [ ] `product.ts`
  - [ ] `order.ts` (optional)
  - [ ] `delivery.model.ts` (optional)
  
- [ ] Environments
  - [ ] `environment.ts`
  
- [ ] Config
  - [ ] `proxy.conf.json`

## Verification Commands

After copying files, verify they're in place:

```bash
# Check environment file
ls src/app/environments/environment.ts

# Check utility
ls src/app/shared/utils/url.helper.ts

# Check services
ls src/app/core/auth/auth.service.ts
ls src/app/core/recommendations/recommendation.service.ts
ls src/app/shared/product.service.ts

# Check proxy config
ls proxy.conf.json

# Should show all files without errors
```

## Notes

- All paths use `src/Frontend/` for source (original project) and `src/app/` for target (integration project)
- Some projects may use different folder structures - adjust paths accordingly
- Environment.ts location may vary - check your `angular.json` for `sourceRoot`
- Keep directory structure consistent between source and target for easier maintenance
