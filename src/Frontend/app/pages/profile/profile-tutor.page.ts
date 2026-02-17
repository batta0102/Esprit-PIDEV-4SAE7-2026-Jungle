import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { UserContextService, UserRole } from '../../core/user/user-context.service';

@Component({
  selector: 'app-profile-tutor-page',
  imports: [RouterLink],
  templateUrl: './profile-tutor.page.html',
  styleUrl: './profile-tutor.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileTutorPage {
  private readonly router = inject(Router);
  private readonly user = inject(UserContextService);

  readonly role = this.user.role;

  setRole(role: string): void {
    if (role !== 'student' && role !== 'tutor' && role !== 'admin') return;
    this.user.setRole(role as UserRole);
    void this.router.navigate([role === 'admin' ? '/profile/admin' : role === 'tutor' ? '/profile/tutor' : '/profile/student']);
  }
}
