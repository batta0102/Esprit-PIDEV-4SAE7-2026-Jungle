import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { GamificationService } from './core/gamification/gamification.service';
import { StatsTrackerService } from './core/gamification/stats-tracker.service';

const authInitializer = async () => {
  const auth = inject(AuthService);
  const gami = inject(GamificationService);
  const stats = inject(StatsTrackerService);

  await auth.init();

  // Once auth is ready, load user-scoped gamification data
  if (auth.isLoggedIn()) {
    gami.initForUser();
    stats.initForUser();
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAppInitializer(authInitializer),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    )
  ]
};
