## 🐛 Diagnostic: Add Delivery HTTP 500 Error

### ⚠️ Le Problème

Quand vous créez une livraison, l'erreur est:
```
Failed to create delivery: Http failure response for http://localhost:4200/api/deliveries/addDelivery: 500 Internal Server Error
```

### 🔍 Analyse

L'URL `http://localhost:4200/api/deliveries/addDelivery` signifie que:
- ❌ **Le proxy N'EST PAS activé**
- L'appel va directement au port Angular (4200) au lieu d'être redirigé vers l'API Gateway (8085)
- Le backend sur port 8085 ne reçoit rien → erreur 500

### ✅ Solution

#### **Étape 1: Démarrer avec le proxy**

```powershell
# ❌ NE PAS faire:
ng serve

# ✅ À LA PLACE, faire:
npm start
```

**Pourquoi?** `npm start` lance `ng serve --proxy-config proxy.conf.json`

#### **Étape 2: Vérifier le proxy**

Vérifiez que [proxy.conf.json](proxy.conf.json) contient:
```json
{
  "/api": {
    "target": "http://localhost:8085",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

**Cela signifie:** `/api/deliveries/addDelivery` → `http://localhost:8085/deliveries/addDelivery`

#### **Étape 3: Vérifier l'API Gateway**

Assurez-vous que l'API Gateway Spring Boot **tourne sur port 8085**:
```
[API_GATEWAY] Netty started on port 8085
```

### 🔧 Vérification du Payload

Ouvrez la **Console du navigateur** (F12 → Console) quand vous créez une livraison et cherchez:

```
[OrdersManagement] 🚀 Creating delivery...
[OrdersManagement] Order data: {idOrder: 37, productName: "...", address: "..."}
[OrdersManagement] Delivery request: {
  deliveryAddress: "...",
  deliveryStatus: "PENDING",
  deliveryDate: undefined,
  order: { idOrder: 37 }
}
```

**Vérifiez que:**
- ✅ `idOrder` est présent (ex: 37)
- ✅ `idOrder` est un **nombre** (pas une string ou null)
- ✅ `deliveryAddress` n'est pas vide
- ✅ La structure est: `{ order: { idOrder: 37 } }`

### 🎯 Checklist de Débogage

- [ ] **Lancé avec:** `npm start` (pas `ng serve`)
- [ ] **API Gateway running:** sur port 8085
- [ ] **Console logs:** `[OrdersManagement] 🚀 Creating delivery...` visible
- [ ] **Payload:** `order.idOrder` est un nombre, pas null
- [ ] **URL finale:** devrait être `http://localhost:8085/deliveries/addDelivery` (via la console des requêtes réseau)

### 📊 Où Vérifier les Logs

**Console du navigateur (F12 → Console):**
```
[OrdersManagement] 🚀 Creating delivery...
[OrdersManagement] Order data: {idOrder: 37, ...}
[OrdersManagement] Delivery request: {...}
[OrdersManagement] order.idOrder type: number value: 37
[DeliveryService] POST /api/deliveries/addDelivery
[DeliveryService] Full URL: /api/deliveries/addDelivery
[DeliveryService] Payload: {"deliveryAddress":"...","deliveryStatus":"PENDING",...}
[DeliveryService] Payload.order.idOrder: 37 (type: number)
```

**Onglet Network (F12 → Network):**
- Cherchez une requête `addDelivery`
- Vérifiez que **l'URL est** `http://localhost:[PORT]/api/deliveries/addDelivery`
- Vérifiez le **Body** de la requête (doit avoir `order.idOrder`)
- Vérifiez le **Status** (doit être 201 ou 200 si succès, 500 si erreur)

### 🔴 Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| **500 Internal Server Error** | Proxy inactif OU payload invalide | Utilisez `npm start` OU vérifiez order.idOrder |
| **0 Connection Error** | API Gateway pas running ou proxy inactif | `npm start` + vérifiez que port 8085 écoute |
| **404 Not Found** | Endpoint n'existe pas | Vérifiez `/deliveries/addDelivery` sur backend |
| **400 Bad Request** | Payload mal formé | Vérifiez que `order.idOrder` est un nombre |

### 📝 Fichiers Modifiés

Pour cette correction:
- ✅ [src/Backend/app/services/delivery.service.ts](src/Backend/app/services/delivery.service.ts) - **Logging amélioré**
- ✅ [src/Backend/app/pages/orders-management/orders-management.component.ts](src/Backend/app/pages/orders-management/orders-management.component.ts) - **Logging du payload avant envoi**

---

**Prochaines étapes:**

1. Arrêtez le serveur actuel (Ctrl+C)
2. Lancez: `npm start`
3. Attendez que le serveur démarre sur un port libre
4. Accédez à `/back/orders-management`
5. Ouvrez la console (F12)
6. Créez une livraison
7. Regardez les logs console
8. Partagez les logs dans la console si ça ne fonctionne toujours pas

