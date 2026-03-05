import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminTab {
  route: string;
  label: string;
  icon: string;
  ariaLabel?: string;
}

/**
 * Admin Navigation Tabs Component
 * Displays management navigation tabs for backend admin pages
 * Used across Resources, Products, Orders, and Delivery Management
 */
@Component({
  selector: 'app-admin-nav-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-nav-container">
      <nav class="admin-tabs" role="navigation" aria-label="Management navigation">
        <a
          *ngFor="let tab of tabs"
          [routerLink]="tab.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="tab.route === '/back/resources' ? {exact: true} : {exact: false}"
          class="admin-tab"
          [attr.aria-label]="tab.ariaLabel || tab.label"
          [attr.aria-current]="null"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </a>
      </nav>
    </div>
  `,
  styleUrl: './admin-nav-tabs.component.scss'
})
export class AdminNavTabsComponent {
  tabs: AdminTab[] = [
    {
      route: '/back/resources',
      label: 'Resources',
      icon: '📚',
      ariaLabel: 'Resources Management'
    },
    {
      route: '/back/products-management',
      label: 'Products',
      icon: '🛍️',
      ariaLabel: 'Products Management'
    },
    {
      route: '/back/orders-management',
      label: 'Orders',
      icon: '📦',
      ariaLabel: 'Orders Management'
    },
    {
      route: '/back/delivery-management',
      label: 'Deliveries',
      icon: '🚚',
      ariaLabel: 'Delivery Management'
    }
  ];
}
