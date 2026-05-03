import { Observable } from 'rxjs';
import { FrontUser } from './auth.types';

/**
 * Abstraction for auth so we can swap mock -> real (e.g. User microservice / JWT) later.
 * Components use AuthFacade; the facade delegates to the active provider.
 */
export interface IAuthProvider {
  readonly currentUser$: Observable<FrontUser | null>;
  readonly isLoggedIn$: Observable<boolean>;
  loginAsStudent(studentId?: string): Promise<void>;
  loginAsTutor(tutorId?: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): FrontUser | null;
  getIsLoggedIn(): boolean;
}
