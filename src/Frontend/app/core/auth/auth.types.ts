/**
 * Front Office auth types.
 * Role-based: STUDENT | TUTOR (admin stays in back office).
 */

export type FrontRole = 'STUDENT' | 'TUTOR';

export interface FrontUser {
  id: string;
  name: string;
  email: string;
  role: FrontRole;
  /** Set when role is STUDENT; used for booking filters and API. */
  studentId: string | null;
  /** Set when role is TUTOR; used for tutor dashboard/sessions. */
  tutorId: string | null;
}

export function isStudent(user: FrontUser | null): user is FrontUser {
  return user !== null && user.role === 'STUDENT';
}

export function isTutor(user: FrontUser | null): user is FrontUser {
  return user !== null && user.role === 'TUTOR';
}
