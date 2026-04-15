// @vitest-environment jsdom
import { beforeEach, describe, expect, it, afterEach, vi } from 'vitest';
import { SpellingBattleService } from './spelling-battle.service';

describe('SpellingBattleService', () => {
  let service: SpellingBattleService;

  beforeEach(() => {
    localStorage.clear();
    service = new SpellingBattleService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('creates a room with the user plus capped bot players', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const players = service.createRoom(12, 'Majda');

    expect(players).toHaveLength(10);
    expect(players.filter((player) => !player.isBot)).toHaveLength(1);
    expect(players.some((player) => player.name === 'Majda' && !player.isBot)).toBe(true);
    expect(players.filter((player) => player.isBot)).toHaveLength(9);
    expect(players.every((player) => player.eliminated === false)).toBe(true);
  });

  it('falls back to You when the user name is empty', () => {
    const players = service.createRoom(1, '');

    expect(players).toHaveLength(1);
    expect(players[0].name).toBe('You');
    expect(players[0].isBot).toBe(false);
  });

  it('selects words from the stored word bank', () => {
    localStorage.setItem('jie-spelling-words-v1', JSON.stringify(['alpha', 'beta', 'gamma']));
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(service.nextWord()).toBe('alpha');
  });

  it('compares spelling case-insensitively and trims whitespace', () => {
    expect(service.isCorrect('  Language  ', 'language')).toBe(true);
    expect(service.isCorrect('languae', 'language')).toBe(false);
  });
});
