import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthFacade } from '../../core/auth/auth.facade';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'navbar-host'
  }
})
export class NavbarComponent {
  private readonly auth = inject(AuthFacade);

  readonly currentUser = this.auth.currentUser;
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly isStudent = this.auth.isStudent;
  readonly isTutor = this.auth.isTutor;

  readonly studentNavLinks = computed(() => [
    { label: 'About', route: '/front', fragment: 'about' },
    { label: 'Courses', route: '/front/courses' },
    { label: 'Classrooms', route: '/front/classrooms' },
    { label: 'My Bookings', route: '/front/bookings' },
    { label: 'Clubs', route: '/front/clubs' },
    { label: 'Events', route: '/front/events' },
    { label: 'Library', route: '/front/library' },
    { label: 'QCM', route: '/front/qcm' },
    { label: 'Evaluations', route: '/front/evaluations' },
    { label: 'Gamification', route: '/front/gamification' }
  ]);

  readonly tutorNavLinks = computed(() => [
    { label: 'Dashboard', route: '/front/tutor/dashboard' },
    { label: 'Sessions', route: '/front/sessions' },
    { label: 'Tutor Bookings', route: '/front/tutor/bookings' }
  ]);

  readonly profileLink = computed(() => {
    if (this.auth.isTutor()) return '/front/tutor/dashboard';
    return '/front/profile/student';
  });

  readonly profileLabel = computed(() => {
    if (this.auth.isTutor()) return 'Tutor space';
    return 'Student space';
  });

  async loginAsStudent(): Promise<void> {
    await this.auth.loginAsStudent();
  }

  async loginAsTutor(): Promise<void> {
    await this.auth.loginAsTutor();
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
