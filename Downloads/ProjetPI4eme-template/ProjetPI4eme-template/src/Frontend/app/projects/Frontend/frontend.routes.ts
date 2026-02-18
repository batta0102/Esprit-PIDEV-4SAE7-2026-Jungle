import { Routes } from '@angular/router';
import { FrontendComponent } from './frontend.component';

export const frontendRoutes: Routes = [
  {
    path: '',
    component: FrontendComponent,
    children: [
      {
        path: 'home',
        title: 'Frontend - Home',
        loadComponent: () => import('./pages/home.component').then(m => m.Project1HomeComponent)
      },
      {
        path: 'dashboard',
        title: 'Frontend - Dashboard',
        loadComponent: () => import('./pages/dashboard.component').then(m => m.Project1DashboardComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
