import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from '@angular/common';
import { NotificationPopupComponent } from './components/notification-popup/notification-popup.component';

/**
 * Root Application Component
 * Displays the router outlet for the entire application
 * Layout switching (Frontend/Backend) is handled by routes
 * Includes global session notification popup
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule, NotificationPopupComponent],
  template: `
    <router-outlet />
    <app-notification-popup />
  `,
  styleUrl: './app.scss'
})
export class App {}
