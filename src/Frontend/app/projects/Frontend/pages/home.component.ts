import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-project1-home',
  standalone: true,
  template: `<p>Project 1 - Home Page</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Project1HomeComponent { }
