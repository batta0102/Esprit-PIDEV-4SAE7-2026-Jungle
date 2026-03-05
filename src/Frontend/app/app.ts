import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

/**
 * Root Application Component
 * Displays the router outlet for the entire application
 * Layout switching (Frontend/Backend) is handled by routes
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="app-root-container">
      <router-outlet />
      <button 
        class="debug-token-btn" 
        type="button" 
        (click)="showToken()"
        title="Copy auth token to clipboard"
      >
        📋 Token
      </button>
    </div>
  `,
  styles: [`
    .app-root-container {
      position: relative;
    }
    
    .debug-token-btn {
      position: fixed;
      inset-block-end: 20px;
      inset-inline-end: 20px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      background: #4a5568;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      z-index: 9999;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }
    
    .debug-token-btn:hover {
      opacity: 1;
    }
  `]
})
export class App {
  private readonly auth = inject(AuthService);

  async showToken(): Promise<void> {
    const token = this.auth.getAccessToken();
    
    if (!token) {
      alert('Not logged in');
      console.log('[Auth] No token available');
      return;
    }
    
    console.log('[Auth] Token:', token);
    
    try {
      await navigator.clipboard.writeText(token);
      console.log('[Auth] Token copied to clipboard');
      alert('Token copied to clipboard');
    } catch (error) {
      console.error('[Auth] Failed to copy token:', error);
      alert('Failed to copy token to clipboard');
    }
  }
}
