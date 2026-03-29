import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppCardComponent } from '../../components/ui/card.component';
import { AppEmptyStateComponent } from '../../components/ui/empty-state.component';
import { CourseCardComponent } from '../../components/course-card/course-card.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, AppCardComponent, AppEmptyStateComponent, CourseCardComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent {
  courses: { title: string; instructor: string; students: number; sessions: number; progress: number; status: 'Active' | 'Upcoming' | 'Completed' }[] = [
    { title: 'Introduction to Linguistics', instructor: 'Dr. Sarah Martin', students: 45, sessions: 12, progress: 75, status: 'Active' },
    { title: 'Advanced Phonetics', instructor: 'Prof. Jean Dubois', students: 28, sessions: 8, progress: 40, status: 'Active' },
    { title: 'Semantics and Pragmatics', instructor: 'Dr. Alice Chen', students: 32, sessions: 10, progress: 10, status: 'Upcoming' },
    { title: 'Historical Linguistics', instructor: 'Dr. Mark Lee', students: 18, sessions: 6, progress: 100, status: 'Completed' }
  ];

  searchQuery = signal('');
  page = signal(1);
  readonly pageSize = 3;

  filteredCourses = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.courses;
    return this.courses.filter(c =>
      c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.status.toLowerCase().includes(q)
    );
  });

  pageCount = computed(() => Math.max(1, Math.ceil(this.filteredCourses().length / this.pageSize)));

  pagedCourses = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filteredCourses().slice(start, start + this.pageSize);
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
