import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { AuthGuardService, authGuard } from './auth.guard';

describe('AuthGuardService', () => {
  let service: AuthGuardService;
  let authSpy: { isLoggedIn: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = {
      isLoggedIn: vi.fn(),
      login: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });

    service = TestBed.inject(AuthGuardService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should allow access when user is logged in', () => {
    authSpy.isLoggedIn.mockReturnValue(true);

    const canActivate = service.canActivate();

    expect(canActivate).toBe(true);
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('should call login and deny access when user is not logged in', () => {
    authSpy.isLoggedIn.mockReturnValue(false);

    const canActivate = service.canActivate();

    expect(canActivate).toBe(false);
    expect(authSpy.login).toHaveBeenCalled();
  });

  it('should navigate through authGuard function', () => {
    authSpy.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
  });
});
