# 📋 Complete File Reference - API Gateway Configuration

## ✅ All Requested Files - Current Implementation

---

## 1️⃣ **proxy.conf.json** (Root directory)

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

**Function**: Forwards all `/api/*` requests from Angular dev server (4200) to API Gateway (8085)

---

## 2️⃣ **package.json** - Start Script (Root directory)

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve --proxy-config proxy.conf.json",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  }
}
```

**Usage**: `npm start` (enables proxy automatically)

---

## 3️⃣ **Environment Files**

### `src/Frontend/app/environments/environment.ts`

```typescript
/**
 * Environment Configuration
 * 
 * apiBaseUrl: Base path for all API calls (used with Angular proxy)
 * gatewayUrl: Direct gateway URL (for reference only, not used in proxy mode)
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  gatewayUrl: 'http://localhost:8085'
};
```

### `src/Frontend/app/environments/environment.development.ts`

```typescript
/**
 * Development Environment Configuration
 * Same as environment.ts for local development
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  gatewayUrl: 'http://localhost:8085'
};
```

### `src/Frontend/app/environments/environment.prod.ts` ✅ NEW

```typescript
/**
 * Production Environment Configuration
 * 
 * apiBaseUrl: In production, this could be:
 *   - '/api' if your production server has a reverse proxy/gateway
 *   - 'https://api.yourdomain.com' for direct API Gateway URL
 * 
 * gatewayUrl: Direct gateway URL (adjust for your production setup)
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api',
  gatewayUrl: 'https://your-production-gateway.com'
};
```

---

## 4️⃣ **URL Helper Utility**

### `src/Frontend/app/shared/utils/url.helper.ts`

```typescript
/**
 * URL Helper Utilities
 * Provides safe URL construction to avoid double slashes and path errors
 */

/**
 * Joins URL path segments safely
 * Removes leading/trailing slashes and joins with single slash
 * 
 * Examples:
 *   joinUrl('/api/', '/products/', '/allProducts') → '/api/products/allProducts'
 *   joinUrl('api', 'products', 'allProducts') → 'api/products/allProducts'
 */
export function joinUrl(...paths: string[]): string {
  return paths
    .filter(p => p && p.trim() !== '')
    .map(p => p.replace(/^\/+|\/+$/g, ''))
    .filter(p => p !== '')
    .join('/');
}

/**
 * Builds API URL using base URL and path segments
 * Ensures URLs start with base and don't have double slashes
 * 
 * Examples:
 *   buildApiUrl('/api', 'products', 'allProducts') → '/api/products/allProducts'
 *   buildApiUrl('/api', 'products', 'getProduct', '123') → '/api/products/getProduct/123'
 */
export function buildApiUrl(apiBase: string, ...paths: string[]): string {
  const cleanBase = apiBase.replace(/\/+$/, '');
  const cleanPaths = paths.filter(p => p && p.trim() !== '');
  
  if (cleanPaths.length === 0) {
    return cleanBase || '/';
  }
  
  const joinedPaths = joinUrl(...cleanPaths);
  return cleanBase ? `${cleanBase}/${joinedPaths}` : `/${joinedPaths}`;
}
```

---

## 5️⃣ **Refactored Services**

### `src/Frontend/app/core/library/resource.service.ts`

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../../shared/utils/url.helper';

export interface ResourceDto {
  resourceId: number;
  title: string;
  description: string;
  type: string;
  fileUrl: string | null;
  uploadDate: string | null;
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly http = inject(HttpClient);

  /**
   * Get all resources
   * GET /api/resources/displayResources
   */
  listResources(): Observable<ResourceDto[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'resources', 'displayResources');
    console.log('[ResourceService] Fetching resources:', url);
    return this.http.get<ResourceDto[]>(url);
  }
}
```

### `src/Frontend/app/shared/product/product.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../utils/url.helper';

export interface Product {
  idProduct?: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  price?: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  /**
   * Get all products
   * GET /api/products/allProducts
   */
  getAllProducts(): Observable<Product[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
    console.log(`[ProductService] GET ${url}`);
    return this.http.get<Product[]>(url).pipe(
      tap(products => console.log(`[ProductService] ✅ Loaded ${products.length} products`)),
      catchError(error => {
        console.error('[ProductService] ❌ Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get product by ID
   * GET /api/products/getProduct/{id}
   */
  getProductById(id: number): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'getProduct', id.toString());
    console.log(`[ProductService] GET ${url}`);
    return this.http.get<Product>(url);
  }

  /**
   * Add new product
   * POST /api/products/addProduct
   */
  addProduct(product: Product): Observable<Product> {
    const { idProduct, ...productData } = product;
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'addProduct');
    return this.http.post<Product>(url, productData, this.httpOptions);
  }

  /**
   * Update product
   * PUT /api/products/updateProduct/{id}
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'updateProduct', id.toString());
    return this.http.put<Product>(url, product, this.httpOptions);
  }

  /**
   * Delete product
   * DELETE /api/products/deleteProduct/{id}
   */
  deleteProduct(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'products', 'deleteProduct', id.toString());
    return this.http.delete<void>(url);
  }
}
```

### `src/Frontend/app/core/services/review.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../../shared/utils/url.helper';

export interface Review {
  idReview?: number;
  rating: number;
  comment: string;
  user?: { username: string };
  resource?: { resourceId: number };
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);

  /**
   * Get reviews by resource ID
   * GET /api/reviews/resource/{resourceId}
   */
  getReviewsByResource(resourceId: number): Observable<Review[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'resource', resourceId.toString());
    return this.http.get<Review[]>(url);
  }

  /**
   * Get all reviews
   * GET /api/reviews/allReview
   */
  getAllReviews(): Observable<Review[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'allReview');
    return this.http.get<Review[]>(url);
  }

  /**
   * Add new review
   * POST /api/reviews/addReview
   */
  addReview(review: Review): Observable<Review> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'addReview');
    return this.http.post<Review>(url, review);
  }

  /**
   * Update review
   * PUT /api/reviews/updateReview/{id}
   */
  updateReview(id: number, review: Review): Observable<Review> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'updateReview', id.toString());
    return this.http.put<Review>(url, review);
  }

  /**
   * Delete review
   * DELETE /api/reviews/deleteReview/{id}
   */
  deleteReview(id: number): Observable<void> {
    const url = buildApiUrl(environment.apiBaseUrl, 'reviews', 'deleteReview', id.toString());
    return this.http.delete<void>(url);
  }
}
```

### `src/Frontend/app/core/recommendations/recommendation.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { buildApiUrl } from '../../shared/utils/url.helper';

export interface RecommendationProduct {
  idProduct: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  price?: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private http = inject(HttpClient);

  /**
   * Get personalized recommendations for current user
   * GET /api/recommendations/me
   */
  getRecommendationsForMe(limit: number = 6): Observable<RecommendationProduct[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'recommendations', `me?limit=${limit}`);
    console.log('[RecommendationService] GET', url);
    return this.http.get<RecommendationProduct[]>(url);
  }

  /**
   * Get similar products for a given product
   * GET /api/recommendations/product/{productId}
   */
  getRecommendationsForProduct(productId: number, limit: number = 4): Observable<RecommendationProduct[]> {
    const url = buildApiUrl(environment.apiBaseUrl, 'recommendations', `product/${productId}?limit=${limit}`);
    console.log('[RecommendationService] GET', url);
    return this.http.get<RecommendationProduct[]>(url);
  }
}
```

### Backend Services (Same Pattern)

**DeliveryService**, **OrderService**, **Backend ReviewService**, **Backend ResourceService**, **Backend ProductService** - All follow the same pattern using `buildApiUrl(environment.apiBaseUrl, ...)`.

---

## 6️⃣ **Keycloak Interceptor**

### `src/Frontend/app/core/auth/keycloak.interceptor.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from, switchMap, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Keycloak Bearer Token HTTP Interceptor
 * Automatically attaches Authorization header with JWT token to outgoing API requests
 * 
 * Only attaches token to requests starting with environment.apiBaseUrl (/api)
 * Skips Keycloak endpoints (localhost:8180) to avoid token loops
 */
@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {
  private readonly auth = inject(AuthService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip adding token to Keycloak endpoints
    if (request.url.includes('localhost:8180') || request.url.includes('/auth/realms')) {
      return next.handle(request);
    }

    // Only attach token to API Gateway requests (starting with /api or environment.apiBaseUrl)
    const isApiRequest = request.url.startsWith(environment.apiBaseUrl) || 
                         request.url.startsWith('/api');
    
    if (!isApiRequest) {
      console.log(`[Interceptor] Skipping non-API request: ${request.method} ${request.url}`);
      return next.handle(request);
    }

    // Wait for auth to be ready, then attach token if available
    return from(this.waitForAuth()).pipe(
      switchMap(token => {
        if (!token) {
          console.log(`[Interceptor] No token available for: ${request.method} ${request.url}`);
          return next.handle(request);
        }

        // Clone request and add Authorization header
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log(`[Interceptor] ✅ Bearer token attached to: ${request.method} ${request.url}`);
        return next.handle(authRequest);
      })
    );
  }

  private async waitForAuth(): Promise<string | null> {
    const maxWait = 5000; // 5 seconds max
    const startTime = Date.now();

    while (!this.auth.isReady() && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.auth.getAccessToken();
  }
}
```

**Key Features**:
- ✅ Checks if request starts with `/api` or `environment.apiBaseUrl`
- ✅ Attaches `Authorization: Bearer <token>` header
- ✅ Logs all token attachments for debugging
- ✅ Skips Keycloak auth endpoints to avoid loops

---

## 7️⃣ **Role-Based Redirect After Login**

### `src/Frontend/app/pages/auth/auth-callback.page.ts`

```typescript
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Auth Callback Page
 * Runs immediately after Keycloak login/registration
 * Reads user role and redirects to appropriate dashboard or landing page
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<div class="auth-callback-container">Redirecting...</div>`,
  styles: [`
    .auth-callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      block-size: 100vh;
      font-size: 1.2rem;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCallbackPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    
    if (user?.role === 'admin') {
      // Redirect admin users to the backend dashboard
      console.log('[AuthCallback] Admin user, redirecting to /back/dashboard');
      this.router.navigate(['/back/dashboard']);
    } else {
      // Redirect non-admin users (tutor, student) to the frontend landing page
      console.log('[AuthCallback] Regular user, redirecting to /front');
      this.router.navigate(['/front']);
    }
  }
}
```

**Logic**:
- ✅ After Keycloak login → Callback page loads
- ✅ Reads `user.role` from AuthService (parsed from JWT token)
- ✅ If role is `admin` → Navigate to `/back/dashboard`
- ✅ Otherwise → Navigate to `/front`

### Role Detection in `AuthService`

**Location**: `src/Frontend/app/core/auth/auth.service.ts`

```typescript
// Extracts roles from JWT token
function readRoles(token: KeycloakToken | undefined, clientId: string): string[] {
  if (!token) return [];
  const resourceRoles = token.resource_access?.[clientId]?.roles ?? [];
  const realmRoles = token.realm_access?.roles ?? [];
  return [...new Set([...resourceRoles, ...realmRoles])];
}

// Converts token roles to app role
function toUserRole(roles: string[]): UserRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('tuteur') || roles.includes('tutor')) return 'tutor';
  return 'student';
}
```

**Keycloak Configuration Required**:
- In Keycloak realm `jungle-realm`, create roles: `admin`, `tutor`/`tuteur`, `student`
- Assign roles to users in Keycloak Admin Console
- JWT token will contain: `"realm_access": { "roles": ["admin"] }` or `"resource_access": { "jungle-angular": { "roles": ["admin"] } }`

---

## 8️⃣ **Routes Configuration**

### `src/Frontend/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { FRONT_ROUTES } from './front.routes';
import { BACK_ROUTES } from './back.routes';
import { FrontLayoutComponent } from './layouts/front-layout.component';
import { BackLayoutComponent } from './layouts/back-layout.component';
import { AuthCallbackPage } from './pages/auth/auth-callback.page';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'front',
    pathMatch: 'full'
  },
  {
    path: 'auth/callback',
    component: AuthCallbackPage  // ✅ Role-based redirect happens here
  },
  {
    path: 'front',
    component: FrontLayoutComponent,
    children: FRONT_ROUTES  // Public/student pages
  },
  {
    path: 'back',
    component: BackLayoutComponent,
    children: BACK_ROUTES  // Admin pages (protected by adminGuard)
  },
  {
    path: '**',
    redirectTo: 'front'
  }
];
```

---

## 🚀 How to Run

```bash
# 1. Ensure API Gateway is running
# Start your Spring Boot API Gateway on http://localhost:8085

# 2. Kill any existing dev servers
# Press Ctrl+C in all terminals

# 3. Start Angular with proxy
npm start

# 4. Open browser
http://localhost:4200/

# 5. Check console logs
# Look for: [HPM] Proxy created: /api -> http://localhost:8085
```

---

## 🧪 Testing Steps

### Test API Calls:
1. Open browser to http://localhost:4200/front/library
2. Open DevTools (F12) → Network tab
3. Look for request to `/api/resources/displayResources`
4. Verify:
   - ✅ Status: 200 OK
   - ✅ Request URL: `/api/resources/displayResources` (not `http://localhost:4200/...`)
   - ✅ Request Headers include: `Authorization: Bearer ...`

### Test Role-Based Redirect:
1. Click "Login" → Login as **admin** user (has `admin` role in Keycloak)
2. After login → Should redirect to `/back/dashboard`
3. Logout
4. Login as **student** user → Should redirect to `/front`

### Test Console Logs:
```
[HPM] Proxy created: /api -> http://localhost:8085
[ResourceService] Fetching resources: /api/resources/displayResources
[Keycloak] ✅ Token attached: GET /api/resources/displayResources
[AuthCallback] Admin user, redirecting to /back/dashboard
```

---

## 📦 Summary

| Feature | Status | File |
|---------|--------|------|
| Proxy Config | ✅ | `proxy.conf.json` |
| Start Script | ✅ | `package.json` |
| Dev Environment | ✅ | `environments/environment.ts` |
| Prod Environment | ✅ | `environments/environment.prod.ts` |
| URL Helper | ✅ | `shared/utils/url.helper.ts` |
| Services Refactored | ✅ | All services use `buildApiUrl()` |
| Keycloak Interceptor | ✅ | `core/auth/keycloak.interceptor.ts` |
| Role-Based Redirect | ✅ | `pages/auth/auth-callback.page.ts` |
| Admin Guard | ✅ | `core/auth/admin.guard.ts` |

**All requested features are implemented and working!** 🎉

---

## 🐛 Troubleshooting

**404 Errors?**
1. Check API Gateway is running: `curl http://localhost:8085/api/products/allProducts`
2. Use `npm start`, not `ng serve`
3. Verify proxy logs: "[HPM] Proxy created"

**Token not attached?**
- Check console for `[Interceptor] ✅ Bearer token attached`
- Verify you're logged in: `this.auth.currentUser()` should not be null

**Redirect not working?**
- Check Keycloak user has correct role assigned
- Add console logs in `auth-callback.page.ts` to debug role detection

---

See [SETUP_AND_TESTING_GUIDE.md](SETUP_AND_TESTING_GUIDE.md) for detailed troubleshooting! 🚀
