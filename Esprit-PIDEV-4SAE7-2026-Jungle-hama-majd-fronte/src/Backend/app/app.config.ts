import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from '../../Frontend/app/core/auth/auth.service';
import { KeycloakInterceptor } from '../../Frontend/app/core/auth/keycloak.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakInterceptor,
      multi: true
    },
    // Initialize Keycloak in background - don't block app startup
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      auth.init().catch(err => console.warn('Keycloak init failed:', err));
      return Promise.resolve();
    }),
    provideRouter(routes)
  ]
};
