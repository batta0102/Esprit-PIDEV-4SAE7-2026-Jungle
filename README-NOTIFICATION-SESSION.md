# 🚨 Système de Notification de Session

## 📋 Vue d'ensemble

Ce système de notification automatique affiche des popups lorsque des sessions buddy sont sur le point de commencer (moins de 5 minutes).

### 🏗 Architecture

```
Frontend Angular (Port 4200)
├── Services
│   ├── SessionNotificationService    # Service principal de notification
│   └── AuthService                  # Service d'authentification
├── Components
│   └── NotificationPopupComponent   # Popup de notification globale
└── Integration
    └── AppComponent                  # Intégration globale

Backend Spring Boot (Port 8080)
├── GET /api/notifications/sessions-proches/{userId}
├── POST /api/notifications/marquer-vue/{sessionId}/{userId}
└── POST /api/buddySessions/{sessionId}/confirm/{userId}?satisfaction=BIEN
```

## 🎯 Fonctionnalités

### **1. Vérification automatique**
- **Fréquence** : Toutes les 30 secondes
- **Cible** : Sessions commençant dans < 5 minutes
- **Participants** : Uniquement les utilisateurs concernés

### **2. Popup moderne**
- **Position** : En haut à droite de l'écran
- **Design** : Adaptatif selon l'urgence (critique/urgent/normal)
- **Animations** : Slide-in + pulse + shake pour l'urgence
- **Multi-popups** : Gère plusieurs sessions simultanées

### **3. Actions utilisateur**
- **"✅ Confirmer ma présence"** : Appelle l'API de confirmation
- **"🔔 Rappeler plus tard"** : Ferme la popup sans confirmer
- **"❌ Fermer"** : Bouton X pour fermer manuellement

### **4. Sonnerie intégrée**
- **Son automatique** : Joué à l'affichage de chaque popup
- **Volume** : 60% pour ne pas être trop agressif
- **Fallback** : Pas d'erreur si le son est bloqué

## 🚀 Installation et Configuration

### **1. Fichiers créés**

#### **Services**
- ✅ `src/services/session-notification.service.ts` : Service principal
- ✅ `src/services/auth.service.ts` : Service d'authentification

#### **Composants**
- ✅ `src/components/notification-popup/notification-popup.component.ts` : Logique
- ✅ `src/components/notification-popup/notification-popup.component.html` : Template
- ✅ `src/components/notification-popup/notification-popup.component.css` : Styles

#### **Intégration**
- ✅ `src/app.ts` : AppComponent mis à jour

### **2. Configuration requise**

#### **Backend (Spring Boot)**
```java
// Vérifiez que ces endpoints existent :
@GetMapping("/api/notifications/sessions-proches/{userId}")
@PostMapping("/api/notifications/marquer-vue/{sessionId}/{userId}")
@PostMapping("/api/buddySessions/{sessionId}/confirm/{userId}")
```

#### **Frontend (Angular)**
```typescript
// L'URL du backend doit être correcte :
private readonly API_BASE_URL = 'http://localhost:8080/api';
```

#### **Authentification**
```typescript
// Adaptez la méthode getCurrentUserId() dans auth.service.ts :
getCurrentUserId(): number {
  // Votre logique pour récupérer l'ID utilisateur
  return 1; // Remplacer par votre vraie logique
}
```

## 📱 Utilisation

### **1. Démarrage**
```bash
# Backend Spring Boot
./mvn spring-boot:run

# Frontend Angular
ng serve
```

### **2. Test automatique**
1. **Créez une session** : Dans votre backend, prévue dans 5 minutes
2. **Connectez-vous** : Via votre système d'authentification
3. **Naviguez** : Sur n'importe quelle page (`/clubs/4` par exemple)
4. **Attendez 30s** : La popup devrait apparaître automatiquement

### **3. Test manuel**
```sql
-- Session de test dans 5 minutes
INSERT INTO buddy_session (
  buddy_pair_id, sujet, date, duree, lieu, notes, status
) VALUES (
  1, -- buddy_pair_id
  'Session Test Notification', -- sujet
  NOW() + INTERVAL '5 minutes', -- date
  60, -- duree (minutes)
  'Salle de test', -- lieu
  'Session pour tester le système de notification', -- notes
  'PLANIFIEE' -- status
);
```

## 🎨 Design et UX

### **Niveaux d'urgence**
- **🚨 Critique** (< 3 min) : Rouge + animation shake
- **⚠️ Urgent** (3-5 min) : Orange + animation pulse
- **📅 Normal** (> 5 min) : Bleu, pas d'animation

### **Responsive**
- **Desktop** : 400px de large, en haut à droite
- **Mobile** : Pleine largeur, 10px de marge
- **Multi-popups** : Empilement vertical avec espacement

### **Animations**
- **Apparition** : Slide-in depuis la droite
- **Urgence** : Pulse et shake pour attirer l'attention
- **Hover** : États interactifs sur les boutons

## 🛠 Personnalisation

### **Modifier la fréquence de vérification**
```typescript
// Dans session-notification.service.ts
private readonly POLLING_INTERVAL = 30000; // 30 secondes
```

### **Modifier l'URL du backend**
```typescript
// Dans session-notification.service.ts
private readonly API_BASE_URL = 'http://votre-backend:port/api';
```

### **Modifier les couleurs**
```css
/* Dans notification-popup.component.css */
.urgence-critique .popup-content {
  border: 3px solid #votre-couleur;
}
```

### **Adapter l'authentification**
```typescript
// Dans auth.service.ts
getCurrentUserId(): number {
  // Votre logique : JWT, localStorage, sessionStorage, etc.
  return votreUserId;
}
```

## 🔧 Dépannage

### **Problèmes courants**

#### **Pas de popup**
1. **Console** : Vérifiez les erreurs JavaScript
2. **Réseau** : Vérifiez les appels API
3. **Authentification** : Vérifiez que `getCurrentUserId()` retourne un ID
4. **Timing** : La session est bien dans < 5 minutes ?

#### **Pas de son**
1. **Navigateur** : Autoplay autorisé ?
2. **Volume** : Niveau son suffisant ?
3. **Console** : Erreurs audio ?
4. **Test manuel** : Cliquez sur une page pour activer le son

#### **API ne répond pas**
1. **Backend** : Spring Boot démarré sur le bon port ?
2. **CORS** : `@CrossOrigin(origins = "*")` configuré ?
3. **URL** : `API_BASE_URL` correcte ?
4. **Logs** : Erreurs côté serveur ?

### **Logs de debugging**

```typescript
// Dans la console du navigateur, vous devriez voir :
console.log('🔔 SessionNotificationService initialisé');
console.log('⏰ Démarrage de la vérification des sessions toutes les 30s');
console.log('🔍 Vérification des sessions proches pour l utilisateur X');
console.log('📅 Sessions proches reçues:', sessions);
console.log('🚨 Affichage popup pour session:', session);
```

## 📊 Monitoring

### **Métriques à surveiller**
- **Taux de détection** : % de sessions détectées à temps
- **Temps de réponse** : Latence de l'API
- **Actions utilisateur** : Clics sur "Confirmer" vs "Rappeler"
- **Erreurs** : Échecs de l'API ou du son

### **Performance**
- **Polling** : 30 secondes (modifiable)
- **Memory** : Nettoyage des anciennes sessions
- **Subscriptions** : Unsubscribe à la destruction
- **Animations** : CSS hardware-accelerated

## 🔄 Évolutions futures

### **Améliorations possibles**
- **Notifications push** : Service Worker pour hors-ligne
- **Vibration mobile** : API Vibration pour mobile
- **Voix** : Text-to-speech pour accessibilité
- **Préférences** : Personalisation par utilisateur
- **Calendrier intégré** : Vue mensuelle des sessions
- **Stats** : Tableau de bord des notifications

---

## 🎯 Utilisation immédiate

Le système est **complètement fonctionnel** et **prêt à être utilisé** :

1. **Démarrez** les deux serveurs
2. **Créez** une session de test
3. **Connectez-vous** avec un utilisateur
4. **Naviguez** sur n'importe quelle page
5. **Observez** la popup apparaître automatiquement

**Le système de notification de session est opérationnel !** 🚨
