import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { ClubsComponent } from './pages/clubs/clubs.component';
import { EventsComponent } from './pages/events/events.component';
import { AssessmentsComponent } from './pages/assessments/assessments.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { GamesComponent } from './pages/games/games.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AvatarsComponent } from './pages/avatars/avatars.component';
import { SkinsComponent } from './pages/skins/skins.component';
import { CrosswordsComponent } from './pages/crosswords/crosswords.component';
import { SpellingBattleComponent } from './pages/spelling-battle/spelling-battle.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'clubs', component: ClubsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'assessments', component: AssessmentsComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'gamification', component: GamesComponent },
  { path: 'crosswords', component: CrosswordsComponent },
  { path: 'spelling-battle', component: SpellingBattleComponent },
  { path: 'avatars', component: AvatarsComponent },
  { path: 'skins', component: SkinsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: '**', redirectTo: 'dashboard' }
];
