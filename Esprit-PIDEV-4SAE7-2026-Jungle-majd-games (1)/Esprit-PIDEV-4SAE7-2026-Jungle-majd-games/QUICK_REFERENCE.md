# QUICK REFERENCE CARD

## 📋 ESSENTIAL FILES (Copy These First)

```
TIER 1: Configuration
├─ src/Frontend/app/environments/environment.ts
├─ src/Frontend/app/shared/utils/url.helper.ts
└─ src/Frontend/app/core/api.service.ts

TIER 2: Products & Recommendations
├─ src/Frontend/app/shared/product/product.ts
├─ src/Frontend/app/core/recommendations/recommendation.model.ts
└─ src/Frontend/app/core/recommendations/recommendation.service.ts

TIER 3: Orders & Deliveries
├─ src/Backend/app/services/order.service.ts
├─ src/Backend/app/services/delivery.service.ts
├─ src/Backend/app/models/delivery.model.ts
└─ src/Frontend/app/shared/order/order.ts

TIER 4: Authentication (MUST HAVE)
├─ src/Frontend/app/core/auth/auth.service.ts
└─ src/Frontend/app/core/auth/keycloak.interceptor.ts
```

## 🔑 API ENDPOINTS

| Endpoint | Method | Auth | Returns |
|----------|--------|------|---------|
| `/api/products/allProducts` | GET | ❌ | Product[] |
| `/api/recommendations/me?limit=3` | GET | ✅ | RecommendationProduct[] |
| `/api/orders/allOrders` | GET | ✅ | Order[] |
| `/api/orders/getOrder/{id}` | GET | ✅ | Order |
| `/api/deliveries/Alldelivery` | GET | ✅ | Delivery[] |
| `/api/deliveries/getDelivery/{id}` | GET | ✅ | Delivery |
| `/api/orders/create` | POST | ✅ | Order |
| `/api/deliveries/create` | POST | ✅ | Delivery |

## ⚙️ CONFIGURATION CHECKLIST

```typescript
// 1. environment.ts
export const environment = {
  apiBaseUrl: '/api',  // ← CRITICAL
  gatewayUrl: 'http://localhost:8085'
};

// 2. proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8085",
    "secure": false,
    "pathRewrite": { "^/api": "/api" }
  }
}

// 3. app.config.ts
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: KeycloakInterceptor,
    multi: true
  }
]

// 4. Run with proxy
ng serve --proxy-config proxy.conf.json
```

## 📦 DEPENDENCIES

```json
{
  "@angular/common": "^21.1.0",
  "@angular/core": "^21.1.0",
  "@angular/forms": "^21.1.0",
  "@angular/platform-browser": "^21.1.0",
  "@angular/router": "^21.1.0",
  "keycloak-angular": "^21.0.0",
  "keycloak-js": "^26.2.3",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0"
}
```

## 🚀 INTEGRATION IN 5 STEPS

1. **Copy Files** (Tiers 1-4)
   ```bash
   # See COMPLETE_FILE_PATHS.md for exact commands
   ```

2. **Update Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Set `apiBaseUrl: '/api'` in environment.ts

4. **Setup Proxy**
   - Create proxy.conf.json with target: http://localhost:8085

5. **Test**
   ```bash
   ng serve --proxy-config proxy.conf.json
   # API calls should reach http://localhost:8085
   ```

## 🔍 VERIFY SETUP

```typescript
// Test Product Loading
constructor(private productService: ProductService) {
  this.productService.getAllProducts().subscribe(
    products => console.log('✅ Products loaded:', products),
    error => console.error('❌ Error:', error)
  );
}

// Test Recommendations (User must be logged in)
constructor(private recommendationService: RecommendationService) {
  this.recommendationService.getRecommendationsForMe(3).subscribe(
    recs => console.log('✅ Recommendations:', recs),
    error => {
      if (error.status === 401) 
        console.error('❌ User not authenticated');
      else
        console.error('❌ Error:', error);
    }
  );
}

// Test in DevTools
// 1. Open Network tab
// 2. Look for GET /api/products/allProducts
// 3. Verify status 200 (not 404 or CORS error)
// 4. Verify Authorization header has Bearer token
```

## ⚠️ CRITICAL NOTES

### ✅ Uses env.apiBaseUrl
```typescript
// All services do this:
const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
// Results in: /api/products/allProducts
// NOT: http://localhost:8085/api/...
```

### ✅ Recommendations Display
```typescript
// Shows ONLY:
// - Product title
// - Category badge
// - "View Product" button
// 
// Does NOT show:
// ❌ Order count
// ❌ Rating
// ❌ Price
```

### ✅ Authentication
```typescript
// RecommendationService checks:
if (this.auth.isLoggedIn()) {
  // Fetch recommendations
} else {
  // Skip recommendations
}

// KeycloakInterceptor adds:
headers = {
  'Authorization': 'Bearer {token}'
}
```

### ✅ Proxy Required
```bash
# ❌ WRONG
ng serve  # CORS errors!

# ✅ RIGHT
ng serve --proxy-config proxy.conf.json  # Success!
```

## 📊 FEATURE CHECKLIST

```
PRODUCTS
[✅] List all products
[✅] Filter by price
[✅] Search functionality
[✅] 5 sort modes
[✅] Pagination

RECOMMENDATIONS
[✅] Top 3 products by ordersCount
[✅] Display: title + category
[✅] Link to detail page
[✅] NO order count shown
[✅] Fallback to mock data
[✅] User auth required

ORDERS
[✅] List user orders
[✅] Order status
[✅] Create order
[✅] Payment method

DELIVERIES
[✅] Track status
[✅] Address info
[✅] Order integration
```

## 🔧 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| CORS Error | `ng serve --proxy-config proxy.conf.json` |
| 404 on API | API Gateway must run on http://localhost:8085 |
| 401 on Recommendations | User must login first |
| Double slashes in URL | Use `buildApiUrl()` function |
| No DEV Tools Network | Use `ng serve`, not `npm start` |

## 📄 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| **INTEGRATION_SUMMARY.md** | Overview (start here) |
| **INTEGRATION_GUIDE.md** | Complete guide with steps |
| **COMPLETE_FILE_PATHS.md** | Exact file paths + copy commands |
| **FILES_FOR_INTEGRATION.md** | Detailed inventory |
| **QUICK_REFERENCE.md** | This file (quick lookup) |

## 🎯 KEY METRICS

- **Files to Copy**: 15 essential
- **Setup Time**: ~20 minutes
- **Angular Version**: 21.1.4+
- **API Gateway**: http://localhost:8085
- **Proxy Path**: /api
- **Auth Method**: JWT + Keycloak
- **Status**: Production Ready ✅

## 💡 PRO TIPS

1. **Always use proxy in development**
   ```bash
   ng serve --proxy-config proxy.conf.json
   ```

2. **Check DevTools Network tab**
   - Verify `/api/...` requests succeed
   - Check Authorization header exists
   - Look for Bearer token

3. **Test without login first**
   - Products load without auth ✅
   - Recommendations need login ✅

4. **Use `buildApiUrl()` helper**
   - Prevents double slashes
   - Already implemented everywhere

5. **Copy in tiers**
   - Tier 1-4 first (essential)
   - Then Tier 5-6 (optional UI)

## 🚀 NEXT ACTION

1. Read **INTEGRATION_GUIDE.md** fully
2. Review **COMPLETE_FILE_PATHS.md** for your setup
3. Follow integration steps in order
4. Use this reference for quick lookup

---

**Quick Ref v1.0** | March 5, 2026 | Angular 21.1.4 | ✅ Production Ready
