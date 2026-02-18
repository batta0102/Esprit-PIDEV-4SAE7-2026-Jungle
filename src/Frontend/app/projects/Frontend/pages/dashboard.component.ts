import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResourceReviewsComponent } from '../../../shared/resource-reviews/resource-reviews.component';

@Component({
  selector: 'app-project1-dashboard',
  standalone: true,
  imports: [ResourceReviewsComponent],
  template: `
    <section class="dashboard-shell">
      <h1 class="dashboard-title">Resources & Reviews</h1>
      <app-resource-reviews />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Project1DashboardComponent { }
