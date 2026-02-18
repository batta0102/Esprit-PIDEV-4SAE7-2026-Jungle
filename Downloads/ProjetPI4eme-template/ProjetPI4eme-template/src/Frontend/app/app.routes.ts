import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

// Lazy loaded routes for projects
const frontendRoutes = () => import('./projects/Frontend/frontend.routes').then(m => m.frontendRoutes);
const backendRoutes = () => import('./projects/Backend/backend.routes').then(m => m.backendRoutes);

export const routes: Routes = [
	// Projects routes with lazy loading - PUBLIC (NO auth required)
	{
		path: 'frontend',
		loadChildren: frontendRoutes
	},
	{
		path: 'Frontend',
		loadChildren: frontendRoutes
	},
	{
		path: 'backend',
		loadChildren: backendRoutes
	},
	{
		path: 'Backend',
		loadChildren: backendRoutes
	},

	// Public routes - NO authentication required
	{
		path: '',
		title: 'Jungle in English',
		loadComponent: () => import('./pages/landing/landing.page').then((m) => m.LandingPage)
	},
	{
		path: 'login',
		title: 'Login | Jungle in English',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage)
	},
	{
		path: 'signup',
		title: 'Sign up | Jungle in English',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/auth/signup.page').then((m) => m.SignupPage)
	},

	// Public routes - NO authentication required
	{
		path: 'events',
		title: 'Events | Jungle in English',
		loadComponent: () => import('./pages/events/events.page').then((m) => m.EventsPage)
	},
	{
		path: 'clubs',
		title: 'Clubs | Jungle in English',
		loadComponent: () => import('./pages/clubs/clubs.page').then((m) => m.ClubsPage)
	},
	{
		path: 'clubs/:clubId',
		title: 'Club Details | Jungle in English',
		loadComponent: () => import('./pages/clubs/club-detail.page').then((m) => m.ClubDetailPage)
	},
	{
		path: 'trainings',
		title: 'Courses | Jungle in English',
		loadComponent: () => import('./pages/trainings/trainings.page').then((m) => m.TrainingsPage)
	},
	{
		path: 'trainings/:trainingId',
		title: 'Course Details | Jungle in English',
		loadComponent: () => import('./pages/trainings/training-detail.page').then((m) => m.TrainingDetailPage)
	},
	{
		path: 'library',
		title: 'Bibliothèque | Jungle in English',
		loadComponent: () => import('./pages/library/library.page').then((m) => m.LibraryPage)
	},
	{
		path: 'qcm',
		title: 'QCM | Jungle in English',
		loadComponent: () => import('./pages/qcm/qcm.page').then((m) => m.QcmPage)
	},
	{
		path: 'evaluations',
		title: 'Evaluations | Jungle in English',
		loadComponent: () => import('./pages/evaluations/evaluations.page').then((m) => m.EvaluationsPage)
	},
	{
		path: 'gamification',
		title: 'Gamification | Jungle in English',
		loadComponent: () => import('./pages/gamification/gamification.page').then((m) => m.GamificationPage)
	},
	{
		path: 'profile',
		redirectTo: 'profile/student',
		pathMatch: 'full'
	},
	{
		path: 'profile/student',
		title: 'Student Space | Jungle in English',
		loadComponent: () => import('./pages/profile/profile-student.page').then((m) => m.ProfileStudentPage)
	},
	{
		path: 'profile/tutor',
		title: 'Tutor Space | Jungle in English',
		loadComponent: () => import('./pages/profile/profile-tutor.page').then((m) => m.ProfileTutorPage)
	},
	{
		path: 'profile/admin',
		title: 'Admin Space | Jungle in English',
		loadComponent: () => import('./pages/profile/profile-admin.page').then((m) => m.ProfileAdminPage)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
