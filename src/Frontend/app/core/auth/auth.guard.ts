import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSimpleService } from '../../services/auth-simple.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private auth = inject(AuthSimpleService);
  private router = inject(Router);

  canActivate(): boolean {
    // AuthSimpleService est toujours prêt
    if (this.auth.isAuthenticated()) {
      return true;
    }

    // Rediriger vers la page de sélection d'utilisateur
    const returnUrl = this.router.url;
    this.router.navigate(['/front/user-selection'], {
      queryParams: { returnUrl }
    });
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const service = inject(AuthGuardService);
  return service.canActivate();
};
