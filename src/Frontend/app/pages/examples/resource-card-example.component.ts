import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceReviewSectionComponent } from '../../shared/resource-review-section/resource-review-section.component';

interface Resource {
  resourceId: number;
  title: string;
  description: string;
  type: string;
}

/**
 * Example: Resource Card Component with embedded reviews
 * This shows how to integrate the review system into your resource cards
 */
@Component({
  selector: 'app-resource-card-example',
  standalone: true,
  imports: [CommonModule, ResourceReviewSectionComponent],
  template: `
    <div class="resource-grid">
      <article class="resource-card" *ngFor="let resource of resources()">
        <!-- Resource Header -->
        <header class="card-header">
          <h2 class="card-title">{{ resource.title }}</h2>
          <span class="card-badge">{{ resource.type }}</span>
        </header>

        <!-- Resource Content -->
        <p class="card-description">{{ resource.description }}</p>

        <!-- Download/View Button -->
        <button class="card-action-btn">
          📥 Download Resource
        </button>

        <!-- Reviews Section (embedded) -->
        <app-resource-review-section 
          [resourceId]="resource.resourceId"
          class="card-reviews"
        />
      </article>
    </div>
  `,
  styles: [`
    .resource-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .resource-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .card-title {
      margin: 0;
      font-size: 1.3rem;
      color: #1f2937;
    }

    .card-badge {
      padding: 0.35rem 0.75rem;
      background: #fef3c7;
      color: #92400e;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .card-description {
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }

    .card-action-btn {
      padding: 0.75rem 1.25rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 200ms;
    }

    .card-action-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }

    .card-reviews {
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .resource-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
      }
    }
  `]
})
export class ResourceCardExampleComponent {
  // Example resources (replace with actual data from your service)
  readonly resources = signal<Resource[]>([
    {
      resourceId: 1,
      title: 'Angular Best Practices Guide',
      description: 'A comprehensive guide covering Angular development patterns and best practices.',
      type: 'PDF'
    },
    {
      resourceId: 2,
      title: 'TypeScript Fundamentals',
      description: 'Learn TypeScript from scratch with practical examples and exercises.',
      type: 'Video'
    },
    {
      resourceId: 3,
      title: 'RxJS Operators Cheatsheet',
      description: 'Quick reference for the most commonly used RxJS operators.',
      type: 'Document'
    }
  ]);
}
