# Complete Files List for Integration

## CRITICAL: FILES MUST COPY (In Order of Priority)

### TIER 1: Core Configuration & API Services (ESSENTIAL)

#### Environment Configuration
```
src/Frontend/app/environments/environment.ts
  Purpose: API base URL configuration
  Required Fields: apiBaseUrl: '/api'
  Status: ✅ Uses environment.apiBaseUrl
```

#### URL Building Utility
```
src/Frontend/app/shared/utils/url.helper.ts
  Purpose: Safe URL construction without double slashes
  Key Function: buildApiUrl(apiBase, ...paths)
  Used By: All services
  Status: ✅ All services depend on this
```

#### Base API Service
```
src/Frontend/app/core/api.service.ts
  Purpose: Gateway for multi-backend support
  Methods: getBackend1Data(), postBackend1Data(), getBackend2Data(), postBackend2Data()
  Status: Optional (not used in main flow)
```

---

### TIER 2: Product Management Services & Models

#### Product Model & Service
```
src/Frontend/app/shared/product/product.ts
  ├── Interface: Product
  │   Fields: idProduct, name, category, description, imageUrl, price, stock
  └── Service: ProductService
      Method: getAllProducts()
      Endpoint: GET /api/products/allProducts
      Status: ✅ Uses environment.apiBaseUrl & buildApiUrl()
      Authentication: NO token required
```

#### Recommendation Service
```
src/Frontend/app/core/recommendations/recommendation.service.ts
  ├── Interface: RecommendationProduct
  │   Fields: id, title, category, ordersCount
  │   Optional: avgRating?, ratingCount?, score?
  └── Service: RecommendationService
      Method: getRecommendationsForMe(limit=10)
      Endpoint: GET /api/recommendations/me?limit={limit}
      Status: ✅ Uses environment.apiBaseUrl & buildApiUrl()
      Authentication: ✅ Requires JWT token (bearer token in header)
      Fallback: Returns MOCK_RECOMMENDATIONS if API returns empty
      IMPORTANT: Service checks auth.isLoggedIn()
```

#### Recommendation Model
```
src/Frontend/app/core/recommendations/recommendation.model.ts
  ├── Only Required Fields: id, title, category, ordersCount
  └── Optional Fields: avgRating?, ratingCount?, score?
```

---

### TIER 3: Order & Delivery Services (Backend Folder)

```
src/Backend/app/services/order.service.ts
  ├── Interface: Order
  │   Fields: idOrder, product, totalAmount, status, orderDate, paymentMethod, address, productName
  └── Service: OrderService
      Methods: 
        - getAllOrders()           → GET /api/orders/allOrders
        - getOrderById(id)         → GET /api/orders/getOrder/{id}
        - createOrder(order)       → POST /api/orders/create
      Status: ✅ Uses environment.apiBaseUrl & buildApiUrl()
      Authentication: ✅ Requires JWT token
```

```
src/Backend/app/services/delivery.service.ts
  ├── Interface: Delivery
  │   Fields: idDelivery, deliveryAddress, deliveryStatus
  └── Service: DeliveryService
      Methods:
        - getAllDeliveries()       → GET /api/deliveries/Alldelivery
        - getDeliveryById(id)      → GET /api/deliveries/getDelivery/{id}
        - createDelivery(delivery) → POST /api/deliveries/create
      Status: ✅ Uses environment.apiBaseUrl & buildApiUrl()
      Authentication: ✅ Requires JWT token
```

```
src/Backend/app/models/delivery.model.ts
  ├── Interface: Delivery
  ├── Interface: DeliveryOrder
  ├── Interface: CreateDeliveryRequest
  └── Interface: UpdateDeliveryRequest
```

---

### TIER 4: Order Model

```
src/Frontend/app/shared/order/order.ts
  ├── Interface: OrderProduct
  │   Fields: idProduct?, name?, price?
  ├── Interface: Order
  │   Fields: idOrder, product, totalAmount, status, orderDate, paymentMethod, address, productName
  └── Service: OrderService (same as Backend folder)
```

---

### TIER 5: Authentication Services (REQUIRED for token management)

```
src/Frontend/app/core/auth/auth.service.ts
  ├── Purpose: User authentication, JWT token management
  ├── Methods: login(), logout(), isLoggedIn(), getToken()
  └── Status: ✅ Required for recommendations API
```

```
src/Frontend/app/core/auth/keycloak.interceptor.ts
  ├── Purpose: Automatically adds Bearer token to HTTP headers
  ├── Modified Headers: 'Authorization': 'Bearer {token}'
  └── Status: ✅ Required for all authenticated API calls
```

---

### TIER 6: Review Service (Optional but useful)

```
src/Frontend/app/core/services/review.service.ts
  ├── Purpose: Product review management
  └── Status: Optional for basic integration
```

---

### TIER 7: Page Components (Optional - for UI)

```
PRODUCTS PAGE:
src/Frontend/app/pages/products/products.page.ts
  ├── Features:
  │   ✅ List products with loading spinner
  │   ✅ Filter by price range
  │   ✅ Search functionality
  │   ✅ Sort options (5 modes)
  │   ✅ Pagination (6 per page)
  │   ✅ Display 3 recommendations (top ordered products)
  │   ✅ Use ProductService & RecommendationService
  └── Status: ✅ All services use environment.apiBaseUrl
  
src/Frontend/app/pages/products/products.page.html
  ├── Sections:
  │   ✅ Filter sidebar (price range)
  │   ✅ Recommendations section (3 items)
  │   ✅ Search bar
  │   ✅ Sort dropdown
  │   ✅ Products grid
  │   ✅ Pagination controls
  └── Recommendations Format: title, category badge, "View Product" button

src/Frontend/app/pages/products/products.page.scss
  ├── Responsive Design:
  │   ✅ Desktop: 3-column grid
  │   ✅ Tablet: 2-column grid
  │   ✅ Mobile: 1-column
  └── Status: ✅ Uses SCSS modules
```

```
PRODUCT DETAIL PAGE:
src/Frontend/app/pages/products/product-detail.page.ts/.html/.scss
  ├── Features:
  │   ✅ Display single product details
  │   ✅ Show product image
  │   ✅ Price, stock, rating
  │   ✅ Related products
  └── Status: Optional for minimal integration
```

```
ORDERS PAGE:
src/Frontend/app/pages/orders/orders.page.ts/.html/.scss
  ├── Features:
  │   ✅ List user orders
  │   ✅ Order status tracking
  │   ✅ Delivery address
  │   ✅ Total amount
  └── Status: Optional for minimal integration
```

---

## COMPLETE FILE STRUCTURE FOR COPY

### Minimal Integration (Services Only)
```
Integration Package - Minimal/
├── core/
│   ├── api.service.ts
│   ├── recommendations/
│   │   ├── recommendation.model.ts
│   │   └── recommendation.service.ts
│   ├── services/
│   │   └── review.service.ts
│   └── auth/
│       ├── auth.service.ts
│       └── keycloak.interceptor.ts
├── environments/
│   └── environment.ts
├── shared/
│   ├── utils/
│   │   └── url.helper.ts
│   ├── product/
│   │   └── product.ts
│   └── order/
│       └── order.ts
└── Backend_Services/
    ├── models/
    │   └── delivery.model.ts
    └── services/
        ├── order.service.ts
        └── delivery.service.ts
```

### Full Integration (Services + UI)
```
Integration Package - Full/
├── [All files from Minimal package]
├── pages/
│   ├── products/
│   │   ├── products.page.ts
│   │   ├── products.page.html
│   │   ├── products.page.scss
│   │   ├── product-detail.page.ts
│   │   ├── product-detail.page.html
│   │   └── product-detail.page.scss
│   └── orders/
│       ├── orders.page.ts
│       ├── orders.page.html
│       └── orders.page.scss
└── shared/
    ├── components/
    │   └── [Product & Order related components]
    └── [All from minimal]
```

---

## DEPENDENCY SUMMARY

### Required Angular Packages
```json
{
  "@angular/common": "^21.1.0",
  "@angular/core": "^21.1.0",
  "@angular/forms": "^21.1.0",
  "@angular/platform-browser": "^21.1.0",
  "@angular/platform-browser-dynamic": "^21.1.0",
  "@angular/router": "^21.1.0",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0"
}
```

### Required for Authentication
```json
{
  "keycloak-angular": "^21.0.0",
  "keycloak-js": "^26.2.3"
}
```

### Dev Dependencies
```json
{
  "@angular/build": "^21.1.4",
  "@angular/cli": "^21.1.4",
  "@angular/compiler-cli": "^21.1.0",
  "typescript": "~5.9.2"
}
```

---

## API ENDPOINTS SUMMARY

### Development (with proxy)
```
GET  /api/products/allProducts              (no auth needed)
GET  /api/recommendations/me?limit=3        (✅ REQUIRES JWT token)
GET  /api/orders/allOrders                  (✅ REQUIRES JWT token)
GET  /api/orders/getOrder/{id}              (✅ REQUIRES JWT token)
GET  /api/deliveries/Alldelivery            (✅ REQUIRES JWT token)
GET  /api/deliveries/getDelivery/{id}       (✅ REQUIRES JWT token)
POST /api/orders/create                     (✅ REQUIRES JWT token)
POST /api/deliveries/create                 (✅ REQUIRES JWT token)
```

### Production
- Update apiBaseUrl in environment.prod.ts
- Update proxy target or use direct API Gateway URL

---

## VERIFICATION CHECKLIST

### Configuration ✅
- [ ] Verify `environment.ts` has `apiBaseUrl: '/api'`
- [ ] Verify `proxy.conf.json` exists with correct target
- [ ] Verify all services import from environment
- [ ] Verify all services use `buildApiUrl()`

### Services ✅
- [ ] ProductService uses environment.apiBaseUrl
- [ ] RecommendationService uses environment.apiBaseUrl
- [ ] OrderService uses environment.apiBaseUrl
- [ ] DeliveryService uses environment.apiBaseUrl
- [ ] All services have proper error handling

### Authentication ✅
- [ ] KeycloakInterceptor adds Bearer token
- [ ] RecommendationService checks auth.isLoggedIn()
- [ ] OrderService has authentication guard
- [ ] DeliveryService has authentication guard

### Data Display ✅
- [ ] Recommendations show only: title, category, order button
- [ ] No order count displayed in recommendations
- [ ] Products display correctly with filters/sorting
- [ ] Orders display with status and delivery info

---

## QUICK START FOR TEAMMATE

1. Copy all TIER 1-5 files first (core services)
2. Update `environment.ts` with your API base URL
3. Setup `proxy.conf.json` to proxy `/api` to your API Gateway
4. Install dependencies: `npm install`
5. Test with: `ng serve --proxy-config proxy.conf.json`
6. Add Tier 6-7 files as needed for UI

---

**Generated**: March 5, 2026  
**Angular Version**: 21.1.4  
**Use**: Integration with another frontend project
