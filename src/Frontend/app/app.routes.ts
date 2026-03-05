import { Routes } from '@angular/router';
import { FRONT_ROUTES } from './front.routes';
import { BACK_ROUTES } from './back.routes';
import { FrontLayoutComponent } from './layouts/front-layout.component';
import { BackLayoutComponent } from './layouts/back-layout.component';
import { AuthCallbackPage } from './pages/auth/auth-callback.page';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'front',
		pathMatch: 'full'
	},
	{
		path: 'auth/callback',
		component: AuthCallbackPage
	},
	{
		path: 'front',
		component: FrontLayoutComponent,
		children: FRONT_ROUTES
	},
	{
		path: 'back',
		component: BackLayoutComponent,
		children: BACK_ROUTES.map(route => 
			route.path === 'dashboard' 
				? { ...route, canActivate: [adminGuard] }
				: route
		)
	},
	{
		path: '**',
		redirectTo: 'front'
	}
];
