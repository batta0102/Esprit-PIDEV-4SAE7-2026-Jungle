import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppTabsComponent, type Tab } from '../../components/ui/tabs.component';
import { AppBadgeComponent } from '../../components/ui/badge.component';

interface Assessment {
  id: number;
  title: string;
  questions: number;
  duration: string;
  status: 'published' | 'draft';
  participants: number;
  avgScore: number;
}

interface Result {
  id: number;
  student: string;
  score: number;
}

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [CommonModule, FormsModule, AppTabsComponent, AppBadgeComponent],
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent {
  activeTab = signal('quizzes');
  searchQuery = signal('');
  page = signal(1);
  readonly pageSize = 3;
  
  tabs: Tab[] = [
    { id: 'quizzes', label: 'My Quizzes' },
    { id: 'results', label: 'Results' },
    { id: 'statistics', label: 'Statistics' }
  ];

  assessments: Assessment[] = [
    {
      id: 1,
      title: 'Quiz: English Grammar',
      questions: 20,
      duration: '30 min',
      status: 'published',
      participants: 45,
      avgScore: 85
    },
    {
      id: 2,
      title: 'Vocabulary Test B2',
      questions: 50,
      duration: '60 min',
      status: 'draft',
      participants: 0,
      avgScore: 0
    },
    {
      id: 3,
      title: 'Listening Comprehension',
      questions: 15,
      duration: '45 min',
      status: 'published',
      participants: 32,
      avgScore: 72
    }
  ];

  results: Result[] = [
    { id: 1, student: 'Alice Martin', score: 95 },
    { id: 2, student: 'Thomas Dubois', score: 82 },
    { id: 3, student: 'Julie Leroy', score: 68 },
    { id: 4, student: 'Marc Petit', score: 88 }
  ];

  filteredAssessments = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.assessments;
    return this.assessments.filter(a =>
      a.title.toLowerCase().includes(q) || a.status.toLowerCase().includes(q) || a.duration.toLowerCase().includes(q)
    );
  });

  filteredResults = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.results;
    return this.results.filter(r => r.student.toLowerCase().includes(q));
  });

  pageCount = computed(() => Math.max(1, Math.ceil(this.filteredAssessments().length / this.pageSize)));

  pagedAssessments = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filteredAssessments().slice(start, start + this.pageSize);
  });

  pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
  }

  selectTab(tabId: string): void {
    this.activeTab.set(tabId);
    this.page.set(1);
  }

  setPage(p: number): void { this.page.set(Math.min(Math.max(1, p), this.pageCount())); }
  prevPage(): void { this.setPage(this.page() - 1); }
  nextPage(): void { this.setPage(this.page() + 1); }
}

