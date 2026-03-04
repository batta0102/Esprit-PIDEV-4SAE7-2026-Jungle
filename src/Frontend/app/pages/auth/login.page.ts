import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthSimpleService } from '../../services/auth-simple.service';
@Component({
  selector: 'app-login-page',
  imports: [RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  private readonly auth = inject(AuthSimpleService);  // ← Changé
  private readonly router = inject(Router);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  async submit(): Promise<void> {
    console.log('🔐 Login page submit appelé');
    this.error.set(null);
    this.busy.set(true);

    try {
      // Rediriger vers la page de sélection d'utilisateur
      this.router.navigate(['/front/user-selection']);
    } catch (error) {
      console.error('❌ Erreur:', error);
      this.error.set('Login failed');
      this.busy.set(false);
    }
  }
}
