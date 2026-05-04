import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppEmptyStateComponent } from '../../components/ui/empty-state.component';
import { ClubCardComponent } from '../../components/club-card/club-card.component';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, AppEmptyStateComponent, ClubCardComponent],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.scss']
})
export class ClubsComponent {
  clubs: { title: string; description: string; icon: string; members: string; location: string; color: 'blue' | 'green' | 'purple' | 'yellow' }[] = [
    {
      title: 'Polyglot Circle',
      description: 'Weekly language exchanges in 5 different languages.',
      icon: '👥',
      members: '128',
      location: 'Virtual',
      color: 'blue'
    },
    {
      title: 'Debate Club',
      description: 'Practice argumentation and advanced rhetoric.',
      icon: '👥',
      members: '64',
      location: 'Campus',
      color: 'green'
    }
  ];

  upcomingEvents = [
    { title: 'Polyglot Circle', time: 'Thursday 6pm' },
    { title: 'Debate Club', time: 'Tuesday 7pm' },
    { title: 'Writing Workshop', time: 'Monday 5pm' }
  ];

  recentActivities = [
    { title: 'Latin Roots', desc: 'Completed lesson 4.2', time: '2h ago' },
    { title: 'Phoneme Master', desc: 'Finished pronunciation drills', time: '5h ago' }
  ];

  searchQuery = signal('');
  page = signal(1);
  readonly pageSize = 4;

  filteredClubs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.clubs;
    return this.clubs.filter(c =>
      c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
    );
  });

  pageCount = computed(() => Math.max(1, Math.ceil(this.filteredClubs().length / this.pageSize)));

  pagedClubs = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filteredClubs().slice(start, start + this.pageSize);
  });

  pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
  }

  setPage(p: number): void { this.page.set(Math.min(Math.max(1, p), this.pageCount())); }
  prevPage(): void { this.setPage(this.page() - 1); }
  nextPage(): void { this.setPage(this.page() + 1); }
}
