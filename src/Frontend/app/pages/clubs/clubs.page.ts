import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DataService } from '../../core/data/data.service';
import { ClubModel } from '../../core/data/models';

@Component({
  selector: 'app-clubs-page',
  imports: [RouterLink, NgOptimizedImage, FormsModule],
  templateUrl: './clubs.page.html',
  styleUrl: './clubs.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubsPage {
  private readonly data = inject(DataService);

  readonly clubs = this.data.clubs;

  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = 4;

  readonly filteredClubs = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.clubs();
    if (!q) return all;
    return all.filter(c =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredClubs().length / this.pageSize)));

  readonly pagedClubs = computed(() => {
    const page = Math.min(Math.max(1, this.page()), this.pageCount());
    const start = (page - 1) * this.pageSize;
    return this.filteredClubs().slice(start, start + this.pageSize);
  });

  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  onSearch(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.pageCount()));
  }

  prevPage(): void {
    this.setPage(this.page() - 1);
  }

  nextPage(): void {
    this.setPage(this.page() + 1);
  }

  trackClubId = (_: number, club: ClubModel): string => club.id;

  clubImageSrc(club: ClubModel): string {
    const images = ['/englishimg2.png', '/jungleabout.png', '/contactusjungle.png', '/englishimg1.jpg'];
    const seed = club.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return images[seed % images.length];
  }
}
