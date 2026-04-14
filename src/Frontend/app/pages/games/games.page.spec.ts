// @vitest-environment jsdom
import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { of } from 'rxjs';
import { FrontendGamesPage } from './games.page';
import { GamesService } from '../../core/games/games.service';
import { AvatarsService } from '../../core/avatars/avatars.service';

describe('FrontendGamesPage', () => {
  const gamesService = {
    getAll: () => of([])
  } as unknown as GamesService;

  const avatarsService = {
    getAvatars: () => of([]),
    getSkins: () => of([])
  } as unknown as AvatarsService;

  it('maps crossword and spelling categories to the correct routes', () => {
    const page = new FrontendGamesPage(gamesService, avatarsService);

    expect(page.routeFor({ title: 'Crossword', category: 'Crossword' } as never)).toBe('/games/crossword');
    expect(page.routeFor({ title: 'Spelling Battle', category: 'Spelling Challenge' } as never)).toBe('/games/spelling-battle');
    expect(page.routeFor({ title: 'Other', category: 'Quiz' } as never)).toBeNull();
  });

  it('resets pagination when a new search starts', () => {
    const page = new FrontendGamesPage(gamesService, avatarsService);

    page.page.set(3);
    page.onSearch('battle');

    expect(page.searchQuery()).toBe('battle');
    expect(page.page()).toBe(1);
  });
});
