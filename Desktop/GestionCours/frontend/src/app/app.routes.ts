import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'attendance', pathMatch: 'full' },
  { path: 'attendance', loadComponent: () => import('./pages/attendance/attendance.page').then(m => m.AttendancePage) },
  { path: '**', redirectTo: 'attendance' },
];
