# 🔧 HTTP Methods Troubleshooting Guide

## ❌ PROBLEM: HTTP Methods Not Working

### Common Issues

| Issue | To Fix |
|-------|--------|
| **Port 4300 instead of 8085** | ❌ WRONG: 4300 is Angular server, NOT API |
| **CORS errors** | Spring Boot needs CORS config |
| **Connection refused** | API Gateway/Product Service not running |
| **404 errors** | Endpoint URL doesn't match backend |

---

## ✅ CORRECT ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────┐
│                    Angular Backend Admin                      │
│              http://localhost:4300  ← You browse here        │
└──────────────────────────────────────────────────────────────┘
                              ↓
                   Angular calls HTTP to:
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                      API Gateway                              │
│           http://localhost:8085  ← API lives here!           │
│           (This is where requests go, NOT 4300!)             │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    Product Service                            │
│              http://localhost:8089  ← Actual data            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚨 ERROR CHECKLIST

### 1️⃣ Check Service URLs (Currently in ProductService)

```typescript
// ✅ CORRECT
private baseUrl = 'http://localhost:8085/products';

// ❌ WRONG
private baseUrl = 'http://localhost:4300/products';  // This is Angular, not API!
```

**Files to check:**
- `src/Backend/app/services/product.service.ts` ✓
- `src/Frontend/app/shared/product/product.ts` ✓

---

### 2️⃣ Check If Services Are Running

```bash
# Terminal 1: Check API Gateway (port 8085)
curl http://localhost:8085/products/allProducts

# Terminal 2: If CORS error, services might not be started
# Check if Spring Boot services are running:
# - API Gateway: port 8085
# - Product Service: port 8089
```

**Expected response:**
```json
[
  {
    "idProduct": 2,
    "name": "Laptop",
    ...
  }
]
```

---

### 3️⃣ Check CORS Configuration

CORS errors look like:
```
Access to XMLHttpRequest at 'http://localhost:8085/products/updateProduct/2' 
from origin 'http://localhost:4300' has been blocked by CORS policy
```

**To fix:**
1. Add `CorsConfig.java` to Product Service (port 8089)
2. Add `GatewayCorsConfig.java` to API Gateway (port 8085)
3. Restart both services

**Files provided in:**
```
spring-boot-config/
  ├── CorsConfig.java
  ├── GatewayCorsConfig.java
  └── application-cors.yml
```

---

### 4️⃣ Test Each HTTP Method

Open browser DevTools → Network tab and test:

#### GET - Load Products
```javascript
// Should work first (just reading data)
fetch('http://localhost:8085/products/allProducts')
  .then(r => r.json())
  .then(d => console.log(d))
```

#### POST - Add Product
```javascript
// Should work if CORS is configured
fetch('http://localhost:8085/products/addProduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Product',
    category: 'Book',
    description: 'Test',
    stock: 10
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

#### PUT - Update Product
```javascript
fetch('http://localhost:8085/products/updateProduct/2', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    idProduct: 2,
    name: 'Updated Product',
    category: 'Book',
    description: 'Updated',
    stock: 20
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

#### DELETE - Delete Product
```javascript
fetch('http://localhost:8085/products/deleteProduct/2', {
  method: 'DELETE'
})
.then(r => r.text())
.then(d => console.log(d))
```

---

## 🔍 Diagnostic Steps

### Step 1: Verify URLs
```bash
# ProductService should use 8085
grep -r "localhost:8085" src/Backend/app/services/product.service.ts
# grep -r "localhost:4300" src/Backend/app/services/  # Should ONLY be 4300 for CORS origin, NOT baseUrl!
```

### Step 2: Check Services Running
```bash
# In separate terminals:
# Terminal 1
cd api-gateway
mvn spring-boot:run

# Terminal 2
cd product-service
mvn spring-boot:run

# Terminal 3
cd jungle
npm run start:both
```

Check output for:
- ✅ "Tomcat started on port 8085" (API Gateway)
- ✅ "Tomcat started on port 8089" (Product Service)
- ✅ "Angular Live Development Server is listening on localhost:4200" (Frontend)
- ✅ "Angular Live Development Server is listening on localhost:4300" (Backend Admin)

### Step 3: Test API Direct
```bash
# From PowerShell or any terminal:
curl http://localhost:8085/products/allProducts

# Or open in browser:
http://localhost:8085/products/allProducts
```

Should return JSON, not CORS error.

### Step 4: Check Browser Console
Go to `http://localhost:4300/backend/products-management`
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for HTTP requests (look for 8085)
4. Look for CORS error mentions 4300 → 8085

### Step 5: View HTTP Logs
The HTTP API Calls Monitor at bottom of page shows:
- ✅ Request URL
- ✅ Method (GET/POST/PUT/DELETE)
- ✅ Status (success/error)
- ✅ Request/Response JSON
- ✅ Error details

---

## 🛠️ Common Fixes

### Fix 1: Wrong Port in URL
```typescript
// ❌ Wrong
private baseUrl = 'http://localhost:4300/products';

// ✅ Correct
private baseUrl = 'http://localhost:8085/products';
```

### Fix 2: Service Not Running
```bash
# Check which services are running
netstat -ano | findstr :8085   # API Gateway
netstat -ano | findstr :8089   # Product Service
netstat -ano | findstr :4300   # Angular Backend Admin

# If port shows LISTENING, service is running
# If not found, need to start it
```

### Fix 3: CORS Not Configured
```bash
# Copy CORS config to Spring Boot projects:
copy spring-boot-config/CorsConfig.java → product-service/src/main/java/com/yourpackage/config/
copy spring-boot-config/GatewayCorsConfig.java → api-gateway/src/main/java/com/yourpackage/config/

# Restart both services
```

### Fix 4: Header Issues
ProductService already sets correct headers:
```typescript
private httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  })
};
```

---

## ✨ Expected Result After Fix

1. ✅ No "refused to connect" errors
2. ✅ No CORS errors
3. ✅ No 404 errors (if URLS correct)
4. ✅ GET requests work (load products)
5. ✅ POST requests work (add product)
6. ✅ PUT requests work (update product)
7. ✅ DELETE requests work (delete product)
8. ✅ HTTP Logs Monitor shows success
9. ✅ Browser Console has no errors

---

## 📋 Quick Verification

Run this in browser console to test:
```javascript
// Test if API Gateway responds
fetch('http://localhost:8085/products/allProducts')
  .then(r => {
    console.log('✅ API Gateway responding!');
    console.log('Status:', r.status);
    console.log('Headers:', {
      'Content-Type': r.headers.get('content-type'),
      'CORS': r.headers.get('access-control-allow-origin')
    });
    return r.json();
  })
  .then(d => console.log('Data:', d))
  .catch(e => console.error('❌ Error:', e.message))
```

---

## 📞 Still Having Issues?

Share:
1. Full error message from browser console
2. Network tab screenshot
3. Output from `netstat -ano | findstr :8085`
4. Which HTTP method fails (GET/POST/PUT/DELETE)?
5. Are you using the HTTP Logs Monitor to see details?
