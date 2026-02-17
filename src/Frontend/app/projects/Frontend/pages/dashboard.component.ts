import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-project1-dashboard',
  standalone: true,
  template: `<p>Project 1 - Dashboard Page</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Project1DashboardComponent { }
