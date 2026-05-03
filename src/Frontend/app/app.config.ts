import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

/**
 * Minimal : HTTP + routeur.
 * provideZonelessChangeDetection : nécessaire sans zone.js (polyfills vides), sinon l’UI ne se met pas à jour.
 * Pas d’APP_INITIALIZER, pas de Keycloak, pas d’ErrorHandler custom.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    )
  ]
};
