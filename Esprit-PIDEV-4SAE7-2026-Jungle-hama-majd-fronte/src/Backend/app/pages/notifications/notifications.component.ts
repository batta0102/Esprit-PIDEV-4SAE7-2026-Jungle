import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  notifications = [
    { title: 'New message from instructor', body: 'Please check the new assignment.', time: '2h' },
    { title: 'Event reminder', body: 'Language Meetup starts tomorrow.', time: '1d' },
    { title: 'Course update', body: 'New materials added to Phonetics.', time: '3d' }
  ];

  searchQuery = signal('');
  page = signal(1);
  readonly pageSize = 5;

  filteredNotifications = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.notifications;
    return this.notifications.filter(n =>
      n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  });

  pageCount = computed(() => Math.max(1, Math.ceil(this.filteredNotifications().length / this.pageSize)));

  pagedNotifications = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filteredNotifications().slice(start, start + this.pageSize);
  });

  pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
  }

  setPage(p: number): void { this.page.set(Math.min(Math.max(1, p), this.pageCount())); }
  prevPage(): void { this.setPage(this.page() - 1); }
  nextPage(): void { this.setPage(this.page() + 1); }

  getNotificationIcon(title: string): string {
    if (title.toLowerCase().includes('message')) return '💬';
    if (title.toLowerCase().includes('event')) return '📅';
    if (title.toLowerCase().includes('course')) return '📚';
    if (title.toLowerCase().includes('assignment')) return '📝';
    if (title.toLowerCase().includes('achievement')) return '🏆';
    return '🔔';
  }
}
