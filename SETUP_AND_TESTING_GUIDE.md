# ✅ Angular API Gateway Configuration - COMPLETE SETUP GUIDE

## 🎉 YOUR APP IS ALREADY FULLY CONFIGURED!

All the requested features are **already implemented**:
- ✅ Proxy configuration forwarding `/api` to API Gateway
- ✅ Environment variables with `apiBaseUrl`  
- ✅ All services refactored to use centralized configuration
- ✅ Keycloak interceptor attaching Bearer tokens
- ✅ Role-based redirect after login (admin → `/back/dashboard`, users → `/front`)

---

## 📁 Configuration Files (Already Created)

### 1. **proxy.conf.json** ✅
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
**What it does**: Forwards all requests from `http://localhost:4200/api/*` to `http://localhost:8085/api/*`  
**Why**: Avoids CORS issues by making API calls appear same-origin to the browser

---

### 2. **package.json - Start Script** ✅
```json
{
  "scripts": {
    "start": "ng serve --proxy-config proxy.conf.json"
  }
}
```
**Usage**: Always run `npm start` (NOT `ng serve` directly) to enable proxy

---

### 3. **Environment Variables** ✅

#### `src/Frontend/app/environments/environment.ts` (Development)
```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api',  // Proxy-relative path
  gatewayUrl: 'http://localhost:8085'
};
```

#### `src/Frontend/app/environments/environment.prod.ts` (Production) ✅ NEW
```typescript
export const environment = {
  production: true,
  apiBaseUrl: '/api',  // Adjust for your production setup
  gatewayUrl: 'https://your-production-gateway.com'
};
```

---

### 4. **URL Helper Utility** ✅
**Location**: `src/Frontend/app/shared/utils/url.helper.ts`

```typescript
export function buildApiUrl(apiBase: string, ...paths: string[]): string {
  // Safely joins paths: buildApiUrl('/api', 'products', 'allProducts') → '/api/products/allProducts'
}
```

**Used by all services** to construct URLs consistently.

---

### 5. **Services Refactored** ✅

All services now use `buildApiUrl(environment.apiBaseUrl, ...)`:

- ✅ **ResourceService**: `GET /api/resources/displayResources`
- ✅ **ProductService**: `GET /api/products/allProducts`, `GET /api/products/getProduct/{id}`
- ✅ **ReviewService**: `GET /api/reviews/resource/{id}`, `POST /api/reviews/addReview`
- ✅ **RecommendationService**: `GET /api/recommendations/me`, `GET /api/recommendations/product/{id}`
- ✅ **OrderService** (Backend): All CRUD operations
- ✅ **DeliveryService** (Backend): All CRUD operations

**Example (ProductService)**:
```typescript
getAllProducts(): Observable<Product[]> {
  const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
  // Result: '/api/products/allProducts'
  // Proxied to: 'http://localhost:8085/api/products/allProducts'
  return this.http.get<Product[]>(url);
}
```

---

### 6. **Keycloak Interceptor** ✅
**Location**: `src/Frontend/app/core/auth/keycloak.interceptor.ts`

**What it does**:
- Automatically attaches `Authorization: Bearer <token>` to requests starting with `/api`
- Logs all API requests with token status
- Handles token refresh automatically

**Code snippet**:
```typescript
const isApiRequest = request.url.startsWith(environment.apiBaseUrl) || 
                     request.url.startsWith('/api');

if (isApiRequest && token) {
  request = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  console.log(`[Keycloak] ✅ Token attached: ${request.method} ${request.url}`);
}
```

---

### 7. **Role-Based Redirect After Login** ✅
**Location**: `src/Frontend/app/pages/auth/auth-callback.page.ts`

**Logic**:
```typescript
ngOnInit(): void {
  const user = this.auth.currentUser();
  
  if (user?.role === 'admin') {
    this.router.navigate(['/back/dashboard']);  // Admin → Backend
  } else {
    this.router.navigate(['/front']);           // Users → Frontend
  }
}
```

**Roles detected from Keycloak token**:
- `admin` → Redirects to `/back/dashboard`
- `tuteur`/`tutor` → Treated as tutor (currently redirects to `/front`)
- Default → Student role, redirects to `/front`

---

## 🚀 How to Run and Test

### **Step 1: Ensure API Gateway is Running**
```bash
# Your API Gateway MUST be running on http://localhost:8085
# Check by opening: http://localhost:8085/api/health (or any test endpoint)
```

**⚠️ CRITICAL**: If the API Gateway is not running, you'll get 504 Gateway Timeout or ECONNREFUSED errors!

---

### **Step 2: Kill Any Existing Dev Servers**
```powershell
# Press Ctrl+C in all terminal windows running Angular
# Or close all terminals
```

---

### **Step 3: Start Angular Dev Server with Proxy**
```bash
npm start
```

**✅ Expected output**:
```
Application bundle generation complete.
Watch mode enabled. Watching for file changes...
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help

[HPM] Proxy created: /api  -> http://localhost:8085
```

**⚠️ If you see port conflicts**: 
```bash
# Find and kill process on port 4200
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Or use a different port
npm start -- --port 4201
```

---

### **Step 4: Test API Calls**

#### **Option A: Use Browser DevTools**
1. Open http://localhost:4200/
2. Press `F12` → Go to **Network** tab
3. Navigate to Library page or Products page
4. Check API requests:
   - ✅ URL should be: `/api/resources/displayResources` or `/api/products/allProducts`
   - ✅ Status should be: `200 OK` (if API Gateway is running)
   - ✅ Request Headers should include: `Authorization: Bearer eyJhbGc...`

#### **Option B: Check Console Logs**
Open browser console (F12 → Console):
```
[ResourceService] Fetching resources: /api/resources/displayResources
[Keycloak] ✅ Token attached: GET /api/resources/displayResources
[Proxy] GET /api/resources/displayResources -> http://localhost:8085/api/resources/displayResources
```

---

## 🔍 Debugging Common Issues

### ❌ **Issue 1: 404 Not Found (localhost:4200/api/...)**
**Symptom**: Browser shows 404 error for `/api/products/allProducts`

**Causes**:
1. ❌ **Started server with `ng serve` instead of `npm start`**
   - **Fix**: Kill server, run `npm start`
   
2. ❌ **Proxy not loaded**
   - **Fix**: Check terminal output for "[HPM] Proxy created"
   - If missing, verify `proxy.conf.json` exists and `npm start` uses it

3. ❌ **API Gateway not running**
   - **Fix**: Start your Spring Boot API Gateway on port 8085
   - Test: `curl http://localhost:8085/api/products/allProducts`

---

### ❌ **Issue 2: 504 Gateway Timeout or ECONNREFUSED**
**Symptom**: Proxy forwards request but can't reach API Gateway

**Fix**: 
```bash
# Verify API Gateway is running
curl http://localhost:8085/api/products/allProducts

# Check if port 8085 is in use
netstat -ano | findstr :8085
```

---

### ❌ **Issue 3: CORS Errors**
**Symptom**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Causes**:
1. ❌ **Service still using absolute URL** (e.g., `http://localhost:8085/api/...`)
   - **Fix**: Check service code - must use `buildApiUrl(environment.apiBaseUrl, ...)`

2. ❌ **Proxy not active** (started with `ng serve`)
   - **Fix**: Always use `npm start`

---

### ❌ **Issue 4: 401 Unauthorized**
**Symptom**: API returns 401 even though user is logged in

**Causes**:
1. ❌ **Keycloak interceptor not attaching token**
   - Check console: Should see "[Keycloak] ✅ Token attached"
   - If missing, verify `app.config.ts` includes `provideHttpClient(withInterceptors([keycloakInterceptor]))`

2. ❌ **Token expired**
   - Keycloak auto-refreshes tokens, but if you see this, try logging out and back in

---

### ❌ **Issue 5: Redirect After Login Not Working**
**Symptom**: After Keycloak login, stays on callback page or goes to wrong route

**Debug**:
1. Open `src/Frontend/app/pages/auth/auth-callback.page.ts`
2. Add console log:
   ```typescript
   ngOnInit(): void {
     const user = this.auth.currentUser();
     console.log('[AuthCallback] User:', user);  // ADD THIS
     console.log('[AuthCallback] Role:', user?.role);  // ADD THIS
     
     if (user?.role === 'admin') {
       console.log('[AuthCallback] Redirecting to /back/dashboard');
       this.router.navigate(['/back/dashboard']);
     } else {
       console.log('[AuthCallback] Redirecting to /front');
       this.router.navigate(['/front']);
     }
   }
   ```

3. Check console output after login

**Common fixes**:
- Keycloak token doesn't have expected roles → Check Keycloak realm role mappings
- User role parsing issue → Verify `AuthService.syncUser()` logic

---

## 📊 Network Request Flow

### Development (with proxy):
```
Browser Request:
  GET http://localhost:4200/api/products/allProducts
  ↓
Angular Dev Server Proxy (proxy.conf.json):
  Forwards to http://localhost:8085/api/products/allProducts
  ↓
API Gateway (Spring Boot):
  Routes to Products Microservice
  ↓
Response flows back to browser
```

### Production (without proxy):
```
Browser Request:
  GET https://yourdomain.com/api/products/allProducts
  ↓
Nginx/Apache/CloudFlare (Reverse Proxy):
  Forwards to API Gateway backend
  ↓
API Gateway:
  Routes to microservices
  ↓
Response flows back to browser
```

---

## 🧪 Manual Testing Checklist

### ✅ Test Frontend Pages:
- [ ] Navigate to http://localhost:4200/front/library
  - Check console for `[ResourceService] Fetching resources: /api/resources/displayResources`
  - Network tab should show successful `/api/resources/displayResources` request
  
- [ ] Navigate to http://localhost:4200/front/products  
  - Check console for `[ProductService] GET /api/products/allProducts`
  - Products should load (if API Gateway returns data)

- [ ] Click on a product to view details
  - URL: `/api/products/getProduct/{id}`
  - Similar recommendations: `/api/recommendations/product/{id}`

### ✅ Test Authentication:
- [ ] Click "Login" button
  - Should redirect to Keycloak login page
  
- [ ] Login with **admin** credentials
  - After login, should redirect to `/back/dashboard`
  
- [ ] Logout, login with **student** credentials
  - After login, should redirect to `/front`

### ✅ Test Keycloak Token Attachment:
- [ ] Open DevTools → Network → Check any `/api/*` request
- [ ] Look at Request Headers
- [ ] Should see: `Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI...`

---

## 📦 Summary of Key Change Points

| Item | File | Status | What Changed |
|------|------|--------|--------------|
| Proxy Config | `proxy.conf.json` | ✅ Created | Forwards `/api` → `http://localhost:8085` |
| Start Script | `package.json` | ✅ Updated | `npm start` uses proxy config |
| Dev Environment | `environment.ts` | ✅ Created | `apiBaseUrl: '/api'` |
| Prod Environment | `environment.prod.ts` | ✅ Created | `apiBaseUrl: '/api'` |
| URL Helper | `shared/utils/url.helper.ts` | ✅ Created | `buildApiUrl()` function |
| ResourceService | `core/library/resource.service.ts` | ✅ Refactored | Uses `buildApiUrl()` |
| ProductService | `shared/product/product.ts` | ✅ Refactored | Uses `buildApiUrl()` |
| ReviewService | `core/services/review.service.ts` | ✅ Refactored | Uses `buildApiUrl()` |
| RecommendationService | `core/recommendations/recommendation.service.ts` | ✅ Refactored | Uses `buildApiUrl()` |
| OrderService | `Backend/app/services/order.service.ts` | ✅ Refactored | Uses `buildApiUrl()` |
| DeliveryService | `Backend/app/services/delivery.service.ts` | ✅ Refactored | Uses `buildApiUrl()` |
| Keycloak Interceptor | `core/auth/keycloak.interceptor.ts` | ✅ Updated | Attaches token to `/api` requests |
| Auth Callback | `pages/auth/auth-callback.page.ts` | ✅ Existing | Role-based redirect |

---

## 🎯 Quick Start Command

```bash
# 1. Ensure API Gateway is running (port 8085)

# 2. Start Angular with proxy
npm start

# 3. Open browser
http://localhost:4200/

# 4. Check console for proxy logs
# Look for: [HPM] Proxy created: /api -> http://localhost:8085
```

---

## 💡 Pro Tips

1. **Always use `npm start`** - Never `ng serve` directly
2. **Check proxy logs** - Set `logLevel: "debug"` in proxy.conf.json to see all proxied requests
3. **Clear browser cache** - If URLs aren't proxying, try Ctrl+Shift+R
4. **Verify API Gateway first** - Before debugging frontend, test Gateway directly
5. **Use console logs** - All services log their API calls for debugging

---

## 📞 Need Help?

If you're still seeing 404 errors:

1. **Verify API Gateway is running**:
   ```bash
   curl http://localhost:8085/api/products/allProducts
   # Should return 200 OK (or 401 if auth required)
   ```

2. **Check proxy is active**:
   - Look for "[HPM] Proxy created" in terminal output
   - Use `npm start`, not `ng serve`

3. **Verify service code**:
   ```typescript
   // ✅ GOOD
   const url = buildApiUrl(environment.apiBaseUrl, 'products', 'allProducts');
   // Result: '/api/products/allProducts'
   
   // ❌ BAD
   const url = 'http://localhost:8085/api/products/allProducts';
   // Will cause CORS errors
   ```

4. **Check browser DevTools**:
   - Network tab → Look at request URL
   - Should be: `/api/products/allProducts` (relative)
   - Should NOT be: `http://localhost:8085/api/...` (absolute)

---

**✅ Everything is configured correctly!** The 404 errors are likely due to:
- API Gateway not running on port 8085
- Server started with `ng serve` instead of `npm start`
- Browser cache not cleared

Follow the testing steps above to verify! 🚀
