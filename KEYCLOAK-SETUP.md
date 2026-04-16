# Configuration Keycloak pour l'application

## 1. Démarrer Keycloak

```bash
# Télécharger Keycloak si nécessaire
wget https://github.com/keycloak/keycloak/releases/download/23.0.0/keycloak-23.0.0.tar.gz
tar -xzf keycloak-23.0.0.tar.gz

# Démarrer Keycloak
cd keycloak-23.0.0
./bin/kc.sh start-dev --http-port=8180 --hostname=localhost
```

## 2. Configuration du Realm

1. **Accéder à la console d'administration**
   - URL: http://localhost:8180
   - Utilisateur: `admin`
   - Mot de passe: défini lors du premier démarrage

2. **Créer un nouveau realm**
   - Nom: `myrealm`
   - Enabled: `ON`

3. **Créer un client**
   - Client ID: `frontend`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Standard Flow Enabled: `ON`
   - Direct Access Grants Enabled: `ON`
   - Valid Redirect URIs: `http://localhost:4200/*`, `http://localhost:4201/*`
   - Web Origins: `http://localhost:4200`, `http://localhost:4201`

4. **Créer des rôles**
   - `student`
   - `tutor`
   - `admin`

5. **Créer des utilisateurs de test**
   - User 1: `student1@example.com` (rôle: student)
   - User 2: `tutor1@example.com` (rôle: tutor)
   - User 3: `admin1@example.com` (rôle: admin)

## 3. Configuration Backend Spring Boot

Ajouter dans `application.properties`:

```properties
# Keycloak Configuration
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/myrealm
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8180/realms/myrealm/protocol/openid-connect/certs

# CORS Configuration
spring.mvc.cors.allowed-origins=http://localhost:4200,http://localhost:4201
spring.mvc.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.mvc.cors.allowed-headers=*
spring.mvc.cors.allow-credentials=true
```

## 4. Configuration Frontend Angular

Le code est déjà configuré dans `auth.service.ts` avec:
- URL Keycloak: `http://localhost:8180`
- Realm: `myrealm`
- Client: `frontend`

## 5. Test de l'authentification

1. **Démarrer Keycloak**
2. **Démarrer le backend Spring**
3. **Démarrer Angular**: `ng serve`
4. **Accéder à**: `http://localhost:4200/front/clubs/1`
5. **Redirection automatique** vers Keycloak
6. **Connexion** avec un utilisateur de test
7. **Retour automatique** vers la page du club

## 6. Dépannage

### Problème: "Unable to verify token"
- Vérifier que Keycloak est bien démarré
- Vérifier l'URL du realm dans la configuration

### Problème: CORS
- Ajouter les origins dans la configuration Keycloak
- Vérifier la configuration CORS du backend

### Problème: Redirection infinie
- Vérifier les URLs de redirection dans le client Keycloak
- Vérifier que le guard fonctionne correctement
