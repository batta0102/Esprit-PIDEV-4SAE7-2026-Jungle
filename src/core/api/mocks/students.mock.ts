/**
 * Temporary mock students for testing the Attendance page
 * before the User microservice (Keycloak) is integrated.
 * Replace with real API from user-service when available.
 */

export interface MockStudent {
  id: number;
  name: string;
}

export const MOCK_STUDENTS: MockStudent[] = [
  { id: 1, name: 'Ali Ben Salah' },
  { id: 2, name: 'Ahmed Trabelsi' },
  { id: 3, name: 'Sami Karray' },
  { id: 4, name: 'Ines Bouaziz' }
];
