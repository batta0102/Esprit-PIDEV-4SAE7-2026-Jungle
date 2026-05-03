import { Injectable, computed, inject } from '@angular/core';
import { MockAuthProvider } from './mock-auth.provider';
import { FrontUser, isStudent, isTutor } from './auth.types';

/**
 * Single entry point for Front Office auth.
 * Uses mock provider by default; swap to real (e.g. User microservice / JWT) later
 * by providing another IAuthProvider and changing this facade to use it.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly provider = inject(MockAuthProvider);

  readonly currentUser = this.provider.currentUser;
  readonly isLoggedIn = computed(() => this.provider.currentUser() !== null);
  readonly role = computed(() => this.provider.currentUser()?.role ?? null);
  readonly studentId = computed(() => this.provider.currentUser()?.studentId ?? null);
  readonly tutorId = computed(() => this.provider.currentUser()?.tutorId ?? null);
  readonly isStudent = computed(() => isStudent(this.provider.currentUser()));
  readonly isTutor = computed(() => isTutor(this.provider.currentUser()));

  async loginAsStudent(studentId?: string): Promise<void> {
    await this.provider.loginAsStudent(studentId);
  }

  async loginAsTutor(tutorId?: string): Promise<void> {
    await this.provider.loginAsTutor(tutorId);
  }

  async logout(): Promise<void> {
    await this.provider.logout();
  }

  sync(): void {
    // No-op when using mock; real provider may refresh token
  }
}
