#!/bin/bash

# Script pour extraire uniquement les fichiers de gestion des clubs
# et les pousser sur Git

echo "🚀 Configuration du dépôt Git pour le projet de gestion des clubs..."

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Initialiser Git si nécessaire
if [ ! -d ".git" ]; then
    echo "📦 Initialisation du dépôt Git..."
    git init
fi

# Créer le .gitignore pour les clubs uniquement
echo "📝 Configuration du .gitignore pour les clubs..."
cp .gitignore_clubs_only .gitignore

# Ajouter les fichiers essentiels
echo "📋 Ajout des fichiers de configuration..."
git add package.json angular.json tsconfig*.json tailwind.config.js proxy.conf.json karma.conf.js vitest.config.ts .editorconfig

# Ajouter la documentation
echo "📚 Ajout de la documentation..."
git add README.md DEVELOPER_GUIDE.md KEYCLOAK-SETUP.md QUICK-START.md README-MICROSERVICES.md README-NOTIFICATION-SESSION.md

# Ajouter la configuration backend
echo "⚙️ Ajout de la configuration backend..."
git add application.properties CORS_CONFIG_EXAMPLE.java cors-config-spring.md start-keycloak.sh buddy-backend-mock.js test-mock-server.js create_table_disponibilite.sql

# Ajouter le code source frontend - clubs
echo "🎨 Ajout du code source frontend - clubs..."
git add src/Frontend/app/app.config.ts src/Frontend/app/app.html src/Frontend/app/app.routes.ts src/Frontend/app/app.scss src/Frontend/app/app.ts
git add src/Frontend/app/front.routes.ts src/Frontend/app/back.routes.ts
git add src/Frontend/app/pages/clubs/
git add src/Frontend/app/pages/club-detail/
git add src/Frontend/app/pages/message-detail/
git add src/Frontend/app/pages/user-buddies/
git add src/Frontend/app/pages/user-plan-session/
git add src/Frontend/app/pages/user-sessions/
git add src/Frontend/app/pages/admin-buddy-requests/
git add src/Frontend/app/pages/admin-buddies-monitoring/
git add src/Frontend/app/pages/admin-club-buddies/
git add src/Frontend/app/pages/admin-club-forum/

# Ajouter les composants frontend
echo "🧩 Ajout des composants frontend..."
git add src/Frontend/app/components/club-management/
git add src/Frontend/app/components/scanner/
git add src/Frontend/app/components/activity-timeline/

# Ajouter les services frontend
echo "🔧 Ajout des services frontend..."
git add src/Frontend/app/services/club.service.ts
git add src/Frontend/app/services/club.service.spec.ts
git add src/Frontend/app/services/membership.service.ts
git add src/Frontend/app/services/membership.spec.ts
git add src/Frontend/app/services/membership-sync.service.ts
git add src/Frontend/app/services/buddy.service.ts
git add src/Frontend/app/services/forum-advanced.service.ts

# Ajouter les modèles et guards
echo "📦 Ajout des modèles et guards..."
git add src/Frontend/app/models/buddy.models.ts
git add src/Frontend/app/models/club.models.ts
git add src/Frontend/app/guards/
git add src/Frontend/app/core/

# Ajouter le code source backend - clubs
echo "🖥️ Ajout du code source backend - clubs..."
git add src/Backend/app/pages/clubs/
git add src/Backend/app/pages/membership-management/
git add src/Backend/app/components/club-card/
git add src/Backend/app/services/club.service.ts
git add src/Backend/app/guards/
git add src/Backend/app/config/

# Ajouter les fichiers de test et configuration
echo "🧪 Ajout des fichiers de test..."
git add src/test.ts src/test-setup.ts src/Frontend/test-setup.ts
git add public/

# Ajouter la configuration VSCode
echo "💻 Ajout de la configuration VSCode..."
git add .vscode/settings.json .vscode/tasks.json .vscode/launch.json .vscode/extensions.json .vscode/mcp.json

# Commit initial
echo "💾 Création du commit initial..."
git commit -m "🚀 Initial commit: Gestion des Clubs - Jungle in English

✨ Features:
- Gestion complète des clubs
- Système de buddies
- Forum de discussion
- Administration des clubs
- Scanner de QR codes
- Gestion des memberships

📁 Structure:
- Frontend Angular avec Tailwind CSS
- Backend Spring Boot
- Tests unitaires
- Documentation complète

🔧 Configuration:
- Keycloak pour l'authentification
- Proxy configuration
- Scripts de développement"

echo "✅ Dépôt Git configuré avec succès pour le projet de gestion des clubs !"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Ajouter votre dépôt distant: git remote add origin <votre-url-depot>"
echo "2. Pousser le code: git push -u origin main"
echo "3. Installer les dépendances: npm install"
echo "4. Démarrer le développement: npm start"
