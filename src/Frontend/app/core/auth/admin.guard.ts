import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Admin Guard
 * Protects admin routes by checking if the current user has 'admin' role
 * Redirects non-admin users to /front
 */
@Injectable({ providedIn: 'root' })
export class AdminGuardService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const user = this.auth.currentUser();
    
    if (user?.role === 'admin') {
      return true;
    }
    
    // Redirect non-admin users to frontend
    this.router.navigate(['/front']);
    return false;
  }
}

export const adminGuard: CanActivateFn = (route, state) => {
  const service = inject(AdminGuardService);
  return service.canActivate();
};
