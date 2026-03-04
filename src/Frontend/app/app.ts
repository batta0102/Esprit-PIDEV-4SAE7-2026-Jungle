import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from '@angular/common';

/**
 * Root Application Component
 * Displays the router outlet for the entire application
 * Layout switching (Frontend/Backend) is handled by routes
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule],
  template: `<router-outlet />`,
  styleUrl: './app.scss'
})
export class App {}
