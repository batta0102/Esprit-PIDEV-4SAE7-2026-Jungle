import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { KeycloakInterceptor } from './keycloak.interceptor';

describe('KeycloakInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authSpy: { isReady: ReturnType<typeof vi.fn>; getAccessToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = {
      isReady: vi.fn(),
      getAccessToken: vi.fn()
    };
    authSpy.isReady.mockReturnValue(true);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: KeycloakInterceptor,
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header to API request when token exists', async () => {
    authSpy.getAccessToken.mockReturnValue('abc-token');

    http.get('/api/products/allProducts').subscribe();
    await Promise.resolve();

    const req = httpMock.expectOne('/api/products/allProducts');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc-token');
    req.flush([]);
  });

  it('should not add Authorization header when token is missing', async () => {
    authSpy.getAccessToken.mockReturnValue(null);

    http.get('/api/orders').subscribe();
    await Promise.resolve();

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should skip token for keycloak realm endpoint', async () => {
    authSpy.getAccessToken.mockReturnValue('abc-token');

    http.get('http://localhost:8180/auth/realms/jungle').subscribe();
    await Promise.resolve();

    const req = httpMock.expectOne('http://localhost:8180/auth/realms/jungle');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should skip token for non-api request', async () => {
    authSpy.getAccessToken.mockReturnValue('abc-token');

    http.get('/assets/logo.svg').subscribe();
    await Promise.resolve();

    const req = httpMock.expectOne('/assets/logo.svg');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush('svg-content');
  });
});