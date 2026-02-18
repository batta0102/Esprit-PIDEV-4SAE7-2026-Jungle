# Review System Implementation Guide

## Overview
A complete review system for Angular with Spring Boot backend. Users can view, add, and update reviews with a 1-6 star rating system.

## Components

### 1. **ReviewService** (`core/services/review.service.ts`)
Centralized service for all review-related API calls.

```typescript
import { ReviewService } from './core/services/review.service';

// Inject in your component
private reviewService = inject(ReviewService);

// Get reviews for a resource
this.reviewService.getReviewsByResource(resourceId).subscribe(...);

// Add a review
this.reviewService.addReview({
  rating: 5,
  comment: "Great resource!",
  resource: { resourceId: 123 }
}).subscribe(...);

// Update a review
this.reviewService.updateReview(reviewId, payload).subscribe(...);
```

### 2. **ResourceReviewSectionComponent** (`shared/resource-review-section/`)
**Use this for individual resource cards**

```html
<!-- In your resource card component -->
<div class="resource-card">
  <h2>{{ resource.title }}</h2>
  <p>{{ resource.description }}</p>
  
  <!-- Embed reviews directly -->
  <app-resource-review-section [resourceId]="resource.resourceId" />
</div>
```

```typescript
import { ResourceReviewSectionComponent } from './shared/resource-review-section/resource-review-section.component';

@Component({
  selector: 'app-my-resource-card',
  standalone: true,
  imports: [ResourceReviewSectionComponent],
  // ...
})
```

### 3. **ResourceReviewsComponent** (`shared/resource-reviews/`)
**Use this for a full page listing all resources with reviews**

```typescript
import { ResourceReviewsComponent } from './shared/resource-reviews/resource-reviews.component';

// In your route or page
<app-resource-reviews />
```

## Features

### ✅ Display Reviews
- Shows all reviews for a resource
- Star rating display (1-6 stars: ★★★★★★)
- Review comments
- Empty state when no reviews

### ✅ Add Reviews
- Comment textarea
- Interactive star rating picker (hover effects)
- Real-time rating display (X/6)
- Submit button with loading state

### ✅ Update Reviews
- Edit button (✏️) on each review
- Form switches to edit mode
- Cancel button to exit edit mode
- Updates existing review in place

### ✅ UI/UX
- Gold star colors (#f4b43a)
- Hover effects on stars
- Responsive design
- Clean, modern styling
- Loading states
- Disabled states during submission

## API Integration

### Required Backend Endpoints

```java
// Get reviews for a specific resource
GET /reviews/getReviewsByResource/{resourceId}
Response: Review[]

// Add a new review
POST /reviews/addReview
Request: {
  "comment": "text",
  "rating": 4,
  "resource": { "resourceId": 5 }
}
Response: Review

// Update existing review
PUT /reviews/updateReview/{id}
Request: {
  "comment": "updated text",
  "rating": 5,
  "resource": { "resourceId": 5 }
}
Response: Review
```

### Database Schema

```sql
CREATE TABLE review (
  id_review BIGINT PRIMARY KEY,
  comment TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 6),
  resource_resource_id BIGINT REFERENCES resource(resource_id)
);
```

## Example Usage Scenarios

### Scenario 1: Resource List Page with Embedded Reviews
```typescript
// resources-page.component.ts
import { ResourceReviewSectionComponent } from './shared/resource-review-section/resource-review-section.component';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  imports: [CommonModule, ResourceReviewSectionComponent],
  template: `
    <div class="resources-grid">
      <div class="resource-card" *ngFor="let resource of resources()">
        <h2>{{ resource.title }}</h2>
        <p>{{ resource.description }}</p>
        <app-resource-review-section [resourceId]="resource.resourceId" />
      </div>
    </div>
  `
})
export class ResourcesPageComponent {
  // your resource loading logic
}
```

### Scenario 2: Single Resource Detail Page
```typescript
// resource-detail.component.ts
@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [ResourceReviewSectionComponent],
  template: `
    <article>
      <h1>{{ resource().title }}</h1>
      <section>{{ resource().description }}</section>
      
      <hr />
      
      <app-resource-review-section [resourceId]="resource().resourceId" />
    </article>
  `
})
```

### Scenario 3: Full Reviews Dashboard
```typescript
// Simply use the existing component
<app-resource-reviews />
// Shows all resources with their reviews in one page
```

## Customization

### Change Star Count
Edit the `stars` array in the component:
```typescript
readonly stars = [1, 2, 3, 4, 5]; // For 5 stars instead of 6
```

### Update API Base URL
```typescript
// In review.service.ts
private readonly baseUrl = 'https://your-api.com/reviews';
```

### Styling
Modify CSS variables in the `.scss` files:
```scss
:host {
  --gold: #f4b43a;        // Star color
  --accent: #ff8a3d;      // Submit button color
  --ink: #1f2937;         // Text color
  // ... customize as needed
}
```

## Testing

```typescript
// Test adding a review
const payload = {
  rating: 5,
  comment: "Excellent resource!",
  resource: { resourceId: 1 }
};

reviewService.addReview(payload).subscribe({
  next: (review) => console.log('Added:', review),
  error: (err) => console.error('Error:', err)
});

// Test updating a review
reviewService.updateReview(reviewId, payload).subscribe({
  next: (review) => console.log('Updated:', review),
  error: (err) => console.error('Error:', err)
});
```

## Browser Compatibility
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

## Performance Notes
- Reviews are loaded per resource (not all at once)
- Signals for reactive state management
- Optimistic UI updates
- Debouncing on hover effects

---

**Author**: GitHub Copilot  
**Date**: February 18, 2026  
**Angular Version**: 19+  
**Backend**: Spring Boot
