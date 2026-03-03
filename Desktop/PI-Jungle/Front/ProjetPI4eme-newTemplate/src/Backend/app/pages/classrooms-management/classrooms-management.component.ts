import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClassroomApiService } from '../../../../core/api/services/classroom-api.service';
import { Classroom } from '../../../../core/api/models';

@Component({
  selector: 'app-classrooms-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './classrooms-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassroomsManagementComponent {
  private readonly api = inject(ClassroomApiService);

  classrooms = signal<Classroom[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getClassrooms().subscribe({
      next: (list) => {
        this.classrooms.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to load classrooms');
        this.classrooms.set([]);
        this.loading.set(false);
      }
    });
  }

  deleteClassroom(id: string | number): void {
    if (!confirm('Delete this classroom?')) return;
    this.api.deleteClassroom(id).subscribe({
      next: () => this.classrooms.update((list) => list.filter((c) => c.id !== id)),
      error: (err) => this.error.set(err?.message ?? 'Delete failed')
    });
  }

  id(c: Classroom): string {
    return String(c.id);
  }
}
