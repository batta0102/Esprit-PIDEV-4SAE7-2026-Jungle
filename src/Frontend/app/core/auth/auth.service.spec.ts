import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { UserContextService } from '../user/user-context.service';

describe('AuthService', () => {
  let service: AuthService;
  let userContextSpy: { setRole: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    userContextSpy = {
      setRole: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [{ provide: UserContextService, useValue: userContextSpy }]
    });

    service = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should expose null token when no token exists', () => {
    (service as any).keycloak = { token: undefined };

    expect(service.getAccessToken()).toBeNull();
  });

  it('should clear user on failed init', async () => {
    (service as any).keycloak = {
      init: vi.fn().mockRejectedValue(new Error('init failed')),
      onAuthSuccess: undefined,
      onAuthRefreshSuccess: undefined,
      onAuthLogout: undefined
    };

    await service.init();

    expect(service.isReady()).toBe(true);
    expect(service.currentUser()).toBeNull();
    expect(userContextSpy.setRole).toHaveBeenCalledWith('ETUDIANT');
  });

  it('should set current user on successful init with authenticated token', async () => {
    (service as any).keycloak = {
      init: vi.fn().mockResolvedValue(true),
      token: 'jwt-token',
      tokenParsed: {
        sub: 'u-1',
        name: 'Admin User',
        email: 'admin@test.com',
        resource_access: {
          'jungle-angular': {
            roles: ['admin']
          }
        }
      },
      onAuthSuccess: undefined,
      onAuthRefreshSuccess: undefined,
      onAuthLogout: undefined
    };

    await service.init();

    expect(service.isReady()).toBe(true);
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.role).toBe('ADMIN');
    expect(userContextSpy.setRole).toHaveBeenCalledWith('ADMIN');
  });
});