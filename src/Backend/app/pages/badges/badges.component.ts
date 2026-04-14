import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgesService, Badge } from './badges.service';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgesComponent implements OnInit {
  readonly badges = signal<Badge[]>([]);
  readonly newBadge = signal<Badge>({ name: '', description: '', unlockLevel: 1 });
  readonly editBadge = signal<Badge | null>(null);
  readonly showPopup = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly editPreviewUrl = signal<string | null>(null);

  readonly searchQuery = signal('');
  readonly page = signal(1);
  readonly pageSize = 6;

  readonly filteredBadges = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const all = this.badges();
    if (!q) return all;
    return all.filter(b =>
      b.name.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q)
    );
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredBadges().length / this.pageSize)));

  readonly pagedBadges = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filteredBadges().slice(start, start + this.pageSize);
  });

  readonly pagesArray = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  selectedFile: File | null = null;
  editSelectedFile: File | null = null;

  constructor(private svc: BadgesService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getAll().subscribe({
      next: (list) => this.badges.set(list || []),
      error: (err) => console.error('Failed to load badges:', err)
    });
  }

  openPopup(): void {
    this.newBadge.set({ name: '', description: '', unlockLevel: 1 });
    this.selectedFile = null;
    this.previewUrl.set(null);
    this.showPopup.set(true);
  }

  closePopup(): void {
    this.showPopup.set(false);
    this.selectedFile = null;
    this.previewUrl.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editSelectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.editPreviewUrl.set(e.target?.result as string);
      reader.readAsDataURL(this.editSelectedFile);
    }
  }

  updateNewBadge(field: keyof Badge, value: any): void {
    this.newBadge.update(b => ({ ...b, [field]: value }));
  }

  updateEditBadge(field: keyof Badge, value: any): void {
    this.editBadge.update(b => b ? { ...b, [field]: value } : b);
  }

  create(): void {
    const badge = this.newBadge();
    if (!badge.name || !this.selectedFile) return;
    this.svc.create(badge, this.selectedFile).subscribe({
      next: () => { this.load(); this.closePopup(); },
      error: (err) => console.error('Failed to create badge:', err)
    });
  }

  startEdit(b: Badge): void {
    this.editBadge.set({ ...b });
    this.editSelectedFile = null;
    this.editPreviewUrl.set(null);
  }

  update(): void {
    const badge = this.editBadge();
    if (!badge || !badge.id) return;
    this.svc.update(badge.id, badge, this.editSelectedFile).subscribe({
      next: () => {
        this.editBadge.set(null);
        this.editSelectedFile = null;
        this.editPreviewUrl.set(null);
        this.load();
      },
      error: (err) => console.error('Failed to update badge:', err)
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this badge?')) return;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Failed to delete badge:', err)
    });
  }

  /** Get a level color for visual display */
  levelColor(level: number): string {
    if (level <= 3) return '#27ae60';
    if (level <= 6) return '#f39c12';
    if (level <= 10) return '#e74c3c';
    return '#8e44ad';
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
  }

  setPage(p: number): void { this.page.set(Math.min(Math.max(1, p), this.pageCount())); }
  prevPage(): void { this.setPage(this.page() - 1); }
  nextPage(): void { this.setPage(this.page() + 1); }
}
