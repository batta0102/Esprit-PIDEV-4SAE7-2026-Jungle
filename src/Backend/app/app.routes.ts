import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { ClubsComponent } from './pages/clubs/clubs.component';
import { EventsComponent } from './pages/events/events.component';
import { AssessmentsComponent } from './pages/assessments/assessments.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { ResourceListComponent } from './components/resource-list/resource-list.component';
import { ResourceFormComponent } from './components/resource-form/resource-form.component';
import { ResourceReviewsPageComponent } from './pages/resource-reviews/resource-reviews-page.component';
import { ProductsManagementComponent } from './pages/products-management/products-management.component';
import { GamesComponent } from './pages/games/games.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'clubs', component: ClubsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'assessments', component: AssessmentsComponent },
  {
    path: 'resources',
    component: ResourcesComponent,
    children: [
      { path: '', component: ResourceListComponent },
      { path: 'create', component: ResourceFormComponent },
      { path: ':id/edit', component: ResourceFormComponent }
    ]
  },
  { path: 'products-management', component: ProductsManagementComponent },
  { path: 'resource-reviews/:resourceId', component: ResourceReviewsPageComponent },
  { path: 'games', component: GamesComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: '**', redirectTo: 'dashboard' }
];

