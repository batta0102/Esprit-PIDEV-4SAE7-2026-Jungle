import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ClassroomApiService } from '../../../../core/api/services/classroom-api.service';
import { Classroom } from '../../../../core/api/models';

@Component({
  selector: 'app-classrooms-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './classrooms.page.html',
  styleUrl: './classrooms.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassroomsPage implements OnInit {
  private readonly classroomApi = inject(ClassroomApiService);

  readonly classrooms = signal<Classroom[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal('');

  readonly filteredClassrooms = computed(() => {
    const list = this.classrooms();
    const q = (this.searchQuery() ?? '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.name ?? '').toLowerCase().includes(q) ||
        String(c.capacity ?? '').toLowerCase().includes(q) ||
        (c.location ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.loadClassrooms();
  }

  /** Load classrooms from the same API as back/courses/classrooms (GET /api/v1/classrooms/all). */
  loadClassrooms(): void {
    this.loading.set(true);
    this.error.set(null);
    this.classroomApi
      .getClassrooms()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => this.classrooms.set(this.normalizeList(list)),
        error: (err) => {
          this.classrooms.set([]);
          this.error.set(err?.message ?? 'Unable to load classrooms.');
        }
      });
  }

  /** Display location (e.g. "On Site", "Online") or fallback. */
  locationLabel(c: Classroom): string {
    const loc = (c.location ?? '').trim();
    return loc || '—';
  }

  /** Use monitor icon for "Online", location pin for on-site. */
  isOnlineLocation(c: Classroom): boolean {
    return (c.location ?? '').toLowerCase().includes('online');
  }

  private normalizeList(raw: Classroom[] | null | undefined): Classroom[] {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const o = raw as Record<string, unknown>;
      if (Array.isArray(o['data'])) return o['data'] as Classroom[];
      if (Array.isArray(o['content'])) return o['content'] as Classroom[];
    }
    return [];
  }
}
