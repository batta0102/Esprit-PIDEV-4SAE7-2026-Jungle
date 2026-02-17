# Projects Setup - Lazy Loading Routes

## Structure

Deux projets fonctionnent désormais sur le même port avec lazy loading :

```
src/Frontend/app/
├── projects/
│   ├── project1/
│   │   ├── project1.component.ts       (Main component)
│   │   ├── project1.routes.ts          (Project 1 routes)
│   │   └── pages/
│   │       ├── home.component.ts
│   │       └── dashboard.component.ts
│   │
│   └── project2/
│       ├── project2.component.ts       (Main component)
│       ├── project2.routes.ts          (Project 2 routes)
│       └── pages/
│           ├── analytics.component.ts
│           └── settings.component.ts
│
└── app.routes.ts  (Main routing with lazy loading)
```

## Routes

### Accéder aux projets:
- **Project 1**: `http://localhost:4200/p1`
- **Project 2**: `http://localhost:4200/p2`

### Project 1 - Routes:
```
/p1              → /p1/home     (redirect)
/p1/home         → Home page
/p1/dashboard    → Dashboard page
```

### Project 2 - Routes:
```
/p2              → /p2/analytics  (redirect)
/p2/analytics    → Analytics page
/p2/settings     → Settings page
```

### Routes Originalles (Jungle):
```
/                → Landing page
/events          → Events
/login           → Login
/signup          → Signup
/clubs           → Clubs
/trainings       → Trainings
/library         → Library
/qcm             → QCM
/evaluations     → Evaluations
/gamification    → Gamification
/profile         → Profile (student/tutor/admin)
```

## Lazy Loading

Les routes des projets se chargent **dynamiquement** grâce à `loadChildren`:

```typescript
{
  path: 'p1',
  loadChildren: () => import('./projects/project1/project1.routes')
    .then(m => m.project1Routes)
},
{
  path: 'p2',
  loadChildren: () => import('./projects/project2/project2.routes')
    .then(m => m.project2Routes)
}
```

### Avantages:
- ✅ Meilleure performance (code splitting)
- ✅ Les projets se chargent uniquement quand on y accède
- ✅ Bundle initial plus petit

## Ajouter des liens de navigation

Pour ajouter des liens dans la navbar vers les projets, modifiez `shared/navbar/navbar.component.ts` :

```typescript
<a routerLink="/p1" routerLinkActive="active">Project 1</a>
<a routerLink="/p2" routerLinkActive="active">Project 2</a>
```

## Utiliser les APIs des backends

Si vos projets utilisent des APIs différentes, modifiez le service `core/api.service.ts` :

```typescript
// Backend 1 (Project 1)
this.api.getBackend1Data('users').subscribe(data => { ... })

// Backend 2 (Project 2)  
this.api.getBackend2Data('products').subscribe(data => { ... })
```

## Customization

Chaque projet a sa propre:
- **Composant principal** (wrapper avec navbar interne)
- **Fichier de routage** (projet1.routes.ts, projet2.routes.ts)
- **Pages/Composants** (home, dashboard, analytics, settings, etc.)

Vous pouvez ajouter plus de pages/routes en créant les fichiers correspondants dans les dossiers `pages/`.
