import { Routes } from '@angular/router';
import { FRONT_ROUTES } from './front.routes';
import { BACK_ROUTES } from './back.routes';
import { ACCESS_DENIED_ROUTES } from './routes/access-denied.routes';
import { FrontLayoutComponent } from './layouts/front-layout.component';
import { BackLayoutComponent } from './layouts/back-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

/**
 * Root application routes with multiple namespaces and separate layouts
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'front',
    pathMatch: 'full'
  },

  // === CLUBS ROUTES - PUBLIC ===
  {
    path: 'clubs',
    loadComponent: () => import('./pages/clubs/clubs.page').then(m => m.ClubsPage),
    title: 'Clubs'
  },
  {
    path: 'clubs/:id',
    loadComponent: () => import('./pages/club-detail/club-detail-simple.component').then(m => m.ClubDetailSimpleComponent),
    title: 'Club Details'
  },
  {
    path: 'clubs/:clubId/messages/:messageId',
    loadComponent: () => import('./pages/message-detail/message-detail.component').then(m => m.MessageDetailComponent),
    title: 'Message Details',
    canActivate: [AuthGuard]
  },

  // === BUDDY SYSTEM ROUTES - USER JOURNEY ===
  {
    path: 'buddies',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/user-buddies/user-buddies.component').then(m => m.UserBuddiesComponent),
        canActivate: [AuthGuard],
        title: 'Mes Buddies'
      },
      {
        path: 'request',
        loadComponent: () => import('./pages/user-buddy-request/user-buddy-request.component').then(m => m.UserBuddyRequestComponent),
        canActivate: [AuthGuard],
        title: 'Demander un Buddy'
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/user-buddy-detail/user-buddy-detail.component').then(m => m.UserBuddyDetailComponent),
        canActivate: [AuthGuard],
        title: 'Détails du Buddy'
      },
      {
        path: ':id/plan-session',
        loadComponent: () => import('./pages/user-plan-session/user-plan-session.component').then(m => m.UserPlanSessionComponent),
        canActivate: [AuthGuard],
        title: 'Planifier une Session'
      },
      {
        path: ':id/sessions',
        loadComponent: () => import('./pages/user-buddy-detail/user-buddy-detail.component').then(m => m.UserBuddyDetailComponent),
        // canActivate: [AuthGuard], // Temporarily removed for debugging
        title: 'Sessions du Buddy'
      }
    ]
  },

  // === ADMIN ROUTES - BUDDY MANAGEMENT ===
  {
    path: 'admin',
    children: [
      {
        path: 'buddies/requests',
        loadComponent: () => import('./pages/admin-buddy-requests/admin-buddy-requests.component').then(m => m.AdminBuddyRequestsComponent),
        canActivate: [AuthGuard, AdminGuard],
        title: 'Demandes de Buddies'
      },
      {
        path: 'buddies/monitoring',
        loadComponent: () => import('./pages/admin-buddies-monitoring/admin-buddies-monitoring.component').then(m => m.AdminBuddiesMonitoringComponent),
        canActivate: [AuthGuard, AdminGuard],
        title: 'Monitoring des Buddies'
      },
      {
        path: 'clubs/:id/buddies',
        loadComponent: () => import('./pages/admin-club-buddies/admin-club-buddies.component').then(m => m.AdminClubBuddiesComponent),
        canActivate: [AuthGuard, AdminGuard],
        title: 'Buddies du Club'
      }
    ]
  },

  // === LEGACY ROUTES ===
  {
    path: 'front',
    component: FrontLayoutComponent,
    children: FRONT_ROUTES
  },
  {
    path: 'back',
    component: BackLayoutComponent,
    children: BACK_ROUTES
  },

  // === ACCESS DENIED ===
  {
    path: 'access-denied',
    loadComponent: () => import('./pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
    title: 'Accès Refusé'
  },

  // === FORUM ROUTES ===
{
  path: 'clubs/:id/forum',
  loadComponent: () => import('./pages/club-forum/club-forum.component').then(m => m.ClubForumComponent),
  title: 'Forum du Club',
  canActivate: [AuthGuard]
},

  // === WILDCARD ===
  {
    path: '**',
    redirectTo: 'clubs'
  }
  
];