import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarsService, Avatar } from './avatars.service';

@Component({
  selector: 'app-avatars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avatars.component.html',
  styleUrls: ['./avatars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarsComponent implements OnInit {
  readonly avatars = signal<Avatar[]>([]);
  readonly newAvatar = signal<Avatar>({ type: '', imageUrl: '' });
  readonly editAvatar = signal<Avatar | null>(null);
  readonly showPopup = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly editPreviewUrl = signal<string | null>(null);

  readonly searchQuery = signal('');
  readonly page = signal(1);
  readonly pageSize = 6;

  readonly filteredAvatars = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const all = this.avatars();
    if (!q) return all;
    return all.filter(a => a.type.toLowerCase().includes(q));
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredAvatars().length / this.pageSize)));

  readonly pagedAvatars = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filteredAvatars().slice(start, start + this.pageSize);
  });

  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  selectedFile: File | null = null;
  editSelectedFile: File | null = null;

  constructor(private svc: AvatarsService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getAll().subscribe({
      next: (list) => this.avatars.set(list || []),
      error: (err) => console.error('Failed to load avatars:', err)
    });
  }

  openPopup(): void {
    this.showPopup.set(true);
    this.selectedFile = null;
    this.previewUrl.set(null);
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
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.previewUrl.set(url);
        this.newAvatar.update(a => ({ ...a, imageUrl: url }));
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editSelectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.editPreviewUrl.set(url);
        this.editAvatar.update(a => a ? { ...a, imageUrl: url } : a);
      };
      reader.readAsDataURL(this.editSelectedFile);
    }
  }

  updateNewAvatar(field: keyof Avatar, value: any): void {
    this.newAvatar.update(a => ({ ...a, [field]: value }));
  }

  updateEditAvatar(field: keyof Avatar, value: any): void {
    this.editAvatar.update(a => a ? { ...a, [field]: value } : a);
  }

  create(): void {
    const avatar = this.newAvatar();
    if (!avatar.type || !this.selectedFile) return;
    this.svc.create(avatar, this.selectedFile).subscribe({
      next: () => {
        this.newAvatar.set({ type: '', imageUrl: '' });
        this.selectedFile = null;
        this.load();
        this.closePopup();
      },
      error: (err) => console.error('Failed to create avatar:', err)
    });
  }

  startEdit(a: Avatar): void {
    this.editAvatar.set({ ...a });
    this.editSelectedFile = null;
    this.editPreviewUrl.set(null);
  }

  update(): void {
    const avatar = this.editAvatar();
    if (!avatar || !avatar.id) return;
    this.svc.update(avatar.id, avatar, this.editSelectedFile).subscribe({
      next: () => {
        this.editAvatar.set(null);
        this.editSelectedFile = null;
        this.load();
      },
      error: (err) => console.error('Failed to update avatar:', err)
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this avatar?')) return;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Failed to delete avatar:', err)
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
  }

  setPage(p: number): void { this.page.set(Math.min(Math.max(1, p), this.pageCount())); }
  prevPage(): void { this.setPage(this.page() - 1); }
  nextPage(): void { this.setPage(this.page() + 1); }
}
