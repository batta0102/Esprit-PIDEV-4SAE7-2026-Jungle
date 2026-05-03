import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Racine : uniquement le routeur. Layouts (navbar, footer) dans FrontLayout / BackLayout. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styleUrl: './app.scss'
})
export class App {}
