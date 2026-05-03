import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from './auth.facade';

export const studentGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  const user = auth.currentUser();
  if (!user) return true;
  if (user.role === 'STUDENT') return true;
  void router.navigate(['/front']);
  return false;
};
