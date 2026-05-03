import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IAuthProvider } from './auth-provider.interface';
import { FrontUser } from './auth.types';

const STORAGE_KEY = 'jie-front-mock-auth-v1';

function loadStored(): Partial<FrontUser> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<FrontUser>;
  } catch {
    return null;
  }
}

function save(user: FrontUser | null): void {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

@Injectable({ providedIn: 'root' })
export class MockAuthProvider implements IAuthProvider {
  private readonly _currentUser = signal<FrontUser | null>(this.initFromStorage());

  /** Exposed for reactive reads (e.g. AuthFacade). */
  readonly currentUser = this._currentUser.asReadonly();

  get currentUser$(): Observable<FrontUser | null> {
    return toObservable(this._currentUser);
  }
  get isLoggedIn$(): Observable<boolean> {
    return toObservable(this._currentUser).pipe(map((u) => u !== null));
  }

  private initFromStorage(): FrontUser | null {
    const stored = loadStored();
    if (!stored?.role || (stored.role !== 'STUDENT' && stored.role !== 'TUTOR')) return null;
    return {
      id: stored.id ?? 'mock-user',
      name: stored.name ?? (stored.role === 'STUDENT' ? 'Demo Student' : 'Demo Tutor'),
      email: stored.email ?? '',
      role: stored.role,
      studentId: stored.studentId ?? (stored.role === 'STUDENT' ? '1' : null),
      tutorId: stored.tutorId ?? (stored.role === 'TUTOR' ? '1' : null)
    };
  }

  getCurrentUser(): FrontUser | null {
    return this._currentUser();
  }

  getIsLoggedIn(): boolean {
    return this._currentUser() !== null;
  }

  async loginAsStudent(studentId?: string): Promise<void> {
    const user: FrontUser = {
      id: 'mock-student',
      name: 'Demo Student',
      email: 'student@demo.jungle',
      role: 'STUDENT',
      studentId: studentId ?? '1',
      tutorId: null
    };
    this._currentUser.set(user);
    save(user);
  }

  async loginAsTutor(tutorId?: string): Promise<void> {
    const user: FrontUser = {
      id: 'mock-tutor',
      name: 'Demo Tutor',
      email: 'tutor@demo.jungle',
      role: 'TUTOR',
      studentId: null,
      tutorId: tutorId ?? '1'
    };
    this._currentUser.set(user);
    save(user);
  }

  async logout(): Promise<void> {
    this._currentUser.set(null);
    save(null);
  }
}
