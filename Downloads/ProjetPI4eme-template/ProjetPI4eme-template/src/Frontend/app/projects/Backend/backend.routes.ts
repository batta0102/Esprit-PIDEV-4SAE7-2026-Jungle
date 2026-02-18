import { Routes } from '@angular/router';

export const backendRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('@backend/app').then(m => m.App),
    children: [
      {
        path: 'dashboard',
        title: 'Backend - Dashboard',
        loadComponent: () => import('@backend/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'courses',
        title: 'Backend - Courses',
        loadComponent: () => import('@backend/pages/courses/courses.component').then(m => m.CoursesComponent)
      },
      {
        path: 'clubs',
        title: 'Backend - Clubs',
        loadComponent: () => import('@backend/pages/clubs/clubs.component').then(m => m.ClubsComponent)
      },
      {
        path: 'events',
        title: 'Backend - Events',
        loadComponent: () => import('@backend/pages/events/events.component').then(m => m.EventsComponent)
      },
      {
        path: 'assessments',
        title: 'Backend - Assessments',
        loadComponent: () => import('@backend/pages/assessments/assessments.component').then(m => m.AssessmentsComponent)
      },
      {
        path: 'resources',
        title: 'Backend - Resources',
        loadComponent: () => import('@backend/pages/resources/resources.component').then(m => m.ResourcesComponent)
      },
      {
        path: 'games',
        title: 'Backend - Games',
        loadComponent: () => import('@backend/pages/games/games.component').then(m => m.GamesComponent)
      },
      {
        path: 'notifications',
        title: 'Backend - Notifications',
        loadComponent: () => import('@backend/pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
