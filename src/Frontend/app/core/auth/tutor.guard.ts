import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from './auth.facade';

export const tutorGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  const user = auth.currentUser();
  if (user?.role === 'TUTOR') return true;
  void router.navigate(['/front']);
  return false;
};
