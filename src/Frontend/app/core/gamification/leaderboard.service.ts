import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { GamificationService } from './gamification.service';

/**
 * Represents a single user entry in the leaderboard
 */
export interface LeaderboardUser {
  userId: string;
  name: string;
  xp: number;
  level: number;
  gamesPlayed: number;
  updatedAt: string;
}

/** Shared localStorage key — visible to ALL users on this browser */
const LEADERBOARD_KEY = 'jie-leaderboard-v1';

function readLeaderboard(): LeaderboardUser[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) as LeaderboardUser[] : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(entries: LeaderboardUser[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch { /* quota exceeded — silently ignore */ }
}

/**
 * Service managing a real multi-user leaderboard.
 *
 * Every time a logged-in user earns XP, call `sync()` to
 * upsert their row in the shared leaderboard store.
 */
@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly auth = inject(AuthService);
  private readonly gami = inject(GamificationService);

  /** Reactive list of all users who have played */
  readonly entries = signal<LeaderboardUser[]>(readLeaderboard());

  /** Sorted descending by XP */
  readonly ranked = computed(() =>
    [...this.entries()].sort((a, b) => b.xp - a.xp)
  );

  /** Current user's rank (1-based), or 0 if not on board */
  readonly myRank = computed(() => {
    const uid = this.auth.currentUser()?.id;
    if (!uid) return 0;
    const idx = this.ranked().findIndex((e) => e.userId === uid);
    return idx >= 0 ? idx + 1 : 0;
  });

  /**
   * Upsert the current user's stats into the shared leaderboard.
   * Call this after any XP-changing action.
   */
  sync(gamesPlayed?: number): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const all = readLeaderboard();
    const idx = all.findIndex((e) => e.userId === user.id);
    const entry: LeaderboardUser = {
      userId: user.id,
      name: user.name || user.email || 'Player',
      xp: this.gami.xp(),
      level: this.gami.level(),
      gamesPlayed: gamesPlayed ?? (idx >= 0 ? all[idx].gamesPlayed : 0),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      all[idx] = { ...entry, gamesPlayed: Math.max(entry.gamesPlayed, all[idx].gamesPlayed) };
    } else {
      all.push(entry);
    }

    writeLeaderboard(all);
    this.entries.set([...all]);
  }

  /** Force-refresh from localStorage (e.g. on tab focus) */
  refresh(): void {
    this.entries.set(readLeaderboard());
  }
}
