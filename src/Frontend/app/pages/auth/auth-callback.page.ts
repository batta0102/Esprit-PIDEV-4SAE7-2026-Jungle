import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Auth Callback Page
 * Runs immediately after Keycloak login/registration
 * Reads user role and redirects to appropriate dashboard or landing page
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<div class="auth-callback-container">Redirecting...</div>`,
  styles: [`
    .auth-callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      block-size: 100vh;
      font-size: 1.2rem;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCallbackPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    // Wait for auth to fully initialize (max 3 seconds)
    await this.waitForAuth();
    
    const user = this.auth.currentUser();
    console.log('[AuthCallback] Current user:', user);
    console.log('[AuthCallback] User role:', user?.role);
    
    if (user?.role === 'admin') {
      // Redirect admin users to the backend dashboard
      console.log('[AuthCallback] Redirecting admin to /back/dashboard');
      this.router.navigate(['/back/dashboard']);
    } else {
      // Redirect non-admin users (tutor, student) to the frontend
      console.log('[AuthCallback] Redirecting user to /front');
      this.router.navigate(['/front']);
    }
  }

  private async waitForAuth(): Promise<void> {
    const maxWait = 3000; // 3 seconds max
    const checkInterval = 100; // Check every 100ms
    const startTime = Date.now();

    while (!this.auth.isReady() && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    if (!this.auth.isReady()) {
      console.warn('[AuthCallback] Auth not ready after timeout, proceeding anyway');
    }
  }
}
