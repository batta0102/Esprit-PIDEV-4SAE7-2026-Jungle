import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AdminGuardService, adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('AdminGuardService', () => {
  let service: AdminGuardService;
  let authSpy: { currentUser: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = { currentUser: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AdminGuardService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AdminGuardService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should allow navigation for admin user', () => {
    authSpy.currentUser.mockReturnValue({
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'ADMIN'
    } as any);

    const result = service.canActivate();

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to front and deny access for non-admin user', () => {
    authSpy.currentUser.mockReturnValue({
      id: '2',
      name: 'Student',
      email: 'student@test.com',
      role: 'ETUDIANT'
    } as any);

    const result = service.canActivate();

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/front']);
  });

  it('should evaluate adminGuard function', () => {
    authSpy.currentUser.mockReturnValue({
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'ADMIN'
    } as any);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBe(true);
  });
});
