import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GamesService, Game } from '../../core/games/games.service';
import { AvatarsService, AvatarDto, SkinDto } from '../../core/avatars/avatars.service';

@Component({
  selector: 'app-frontend-games',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss']
})
export class FrontendGamesPage implements OnInit {
  games: Game[] = [];
  avatars: AvatarDto[] = [];
  skins: SkinDto[] = [];

  readonly searchQuery = signal('');
  readonly page = signal(1);
  readonly pageSize = 6;

  readonly filteredGames = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.games;
    return this.games.filter(g =>
      g.title.toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q)
    );
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredGames().length / this.pageSize)));

  readonly pagedGames = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filteredGames().slice(start, start + this.pageSize);
  });

  readonly pagesArray = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  constructor(private gamesSvc: GamesService, private avatarsSvc: AvatarsService) {}

  ngOnInit(): void {
    this.gamesSvc.getAll().subscribe(g => this.games = g || []);
    this.avatarsSvc.getAvatars().subscribe(a => this.avatars = a || []);
    this.avatarsSvc.getSkins().subscribe(s => this.skins = s || []);
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.page.set(1);
  }

  setPage(p: number): void { this.page.set(Math.min(Math.max(1, p), this.pageCount())); }
  prevPage(): void { this.setPage(this.page() - 1); }
  nextPage(): void { this.setPage(this.page() + 1); }
}
