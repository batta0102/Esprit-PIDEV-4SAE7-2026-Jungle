import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-frontend',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="frontend-container">
      <h1>Frontend</h1>
      <nav>
        <a routerLink="dashboard">Dashboard</a>
        <a routerLink="home">Home</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .frontend-container {
      padding: 20px;
      background-color: #f5f5f5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FrontendComponent { }
