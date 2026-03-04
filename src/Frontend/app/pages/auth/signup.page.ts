import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthSimpleService } from '../../services/auth-simple.service';

@Component({
  selector: 'app-signup-page',
  imports: [RouterLink],
  templateUrl: './signup.page.html',
  styleUrl: './signup.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupPage {
  private readonly auth = inject(AuthSimpleService);
  private readonly router = inject(Router);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  async submit(): Promise<void> {
    console.log('📝 Signup page submit appelé');
    this.error.set(null);
    this.busy.set(true);

    try {
      console.log('📤 Redirection vers la page de sélection d\'utilisateur...');
      // Rediriger vers la page de sélection d'utilisateur
      this.router.navigate(['/front/user-selection']);
    } catch (error) {
      console.error('❌ Erreur:', error);
      this.error.set('Sign up failed');
      this.busy.set(false);
    }
  }
}
