import { Injectable, inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private auth = inject(AuthService);

  async canActivate(): Promise<boolean> {
    await this.auth.init();

    if (this.auth.isLoggedIn()) {
      return true;
    }

    this.auth.login();
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const service = inject(AuthGuardService);
  return service.canActivate();
};
