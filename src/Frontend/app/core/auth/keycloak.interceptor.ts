import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from, switchMap, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Keycloak Bearer Token HTTP Interceptor
 * Automatically attaches Authorization header with JWT token to outgoing API requests
 * 
 * Only attaches token to requests starting with environment.apiBaseUrl (/api)
 * Skips Keycloak endpoints (localhost:8180) to avoid token loops
 */
@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {
  private readonly auth = inject(AuthService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip adding token to Keycloak endpoints
    if (request.url.includes('localhost:8180') || request.url.includes('/auth/realms')) {
      return next.handle(request);
    }

    // Only attach token to API Gateway requests (starting with /api or environment.apiBaseUrl)
    const isApiRequest = request.url.startsWith(environment.apiBaseUrl) || 
                         request.url.startsWith('/api');
    
    if (!isApiRequest) {
      console.log(`[Interceptor] Skipping non-API request: ${request.method} ${request.url}`);
      return next.handle(request);
    }

    // Wait for auth to be ready, then attach token if available
    return from(this.waitForAuth()).pipe(
      switchMap(token => {
        if (!token) {
          console.log(`[Interceptor] No token available for: ${request.method} ${request.url}`);
          return next.handle(request);
        }

        // Clone request and add Authorization header
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log(`[Interceptor] Bearer token attached to: ${request.method} ${request.url}`);
        return next.handle(authRequest);
      })
    );
  }

  private async waitForAuth(): Promise<string | null> {
    const maxWait = 5000; // 5 seconds max
    const startTime = Date.now();

    while (!this.auth.isReady() && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.auth.getAccessToken();
  }
}
