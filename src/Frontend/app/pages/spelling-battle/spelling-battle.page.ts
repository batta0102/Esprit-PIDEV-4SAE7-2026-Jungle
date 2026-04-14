import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import {
  NarratorProvider,
  NarratorVoiceOption,
  SpellingBattleService,
  SpellingPlayer
} from '../../core/games/spelling-battle.service';

type BattlePhase = 'lobby' | 'playing' | 'finished';

@Component({
  selector: 'app-spelling-battle-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './spelling-battle.page.html',
  styleUrl: './spelling-battle.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpellingBattlePage implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly game = inject(SpellingBattleService);

  readonly phase = signal<BattlePhase>('lobby');
  readonly players = signal<SpellingPlayer[]>([]);
  readonly roomSize = signal(6);
  readonly turnSeconds = signal(10);
  readonly timeLeft = signal(10);
  readonly prepCountdown = signal(0);
  readonly currentWord = signal('');
  readonly currentTurnPlayerId = signal<string | null>(null);
  readonly turnInput = signal('');
  readonly logs = signal<string[]>([]);
  readonly round = signal(0);
  readonly winnerId = signal<string | null>(null);
  readonly turnMotionTick = signal(0);
  readonly narratorMuted = signal(false);
  readonly narratorProvider = signal<NarratorProvider>('external');
  readonly narratorVoice = signal('Brian');
  readonly narratorVoices = signal<NarratorVoiceOption[]>([]);
  readonly browserVoice = signal('');
  readonly browserVoices = signal<NarratorVoiceOption[]>([]);
  readonly screenShake = signal(false);

  private timerRef: number | null = null;
  private botRef: number | null = null;
  private botTypingRef: number | null = null;
  private ambientRef: number | null = null;
  private prepRef: number | null = null;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  readonly userName = computed(() => this.auth.currentUser()?.name || 'You');

  readonly alivePlayers = computed(() => this.players().filter((p) => !p.eliminated));

  readonly currentPlayer = computed(() => {
    const id = this.currentTurnPlayerId();
    return this.players().find((p) => p.id === id) ?? null;
  });

  readonly isMyTurn = computed(() => this.currentTurnPlayerId() === 'you');

  readonly boardText = computed(() => {
    if (this.prepCountdown() > 0) {
      return `Get ready... ${this.prepCountdown()}`;
    }
    return this.turnInput() || 'Type the spelling here...';
  });

  readonly otherPlayers = computed(() => {
    const activeId = this.currentTurnPlayerId();
    const list = this.players();
    const turnIndex = list.findIndex((p) => p.id === activeId);
    if (turnIndex < 0) {
      return list;
    }
    const ordered = [...list.slice(turnIndex + 1), ...list.slice(0, turnIndex)];
    return ordered.filter((p) => p.id !== activeId);
  });

  readonly winner = computed(() => {
    const id = this.winnerId();
    return this.players().find((p) => p.id === id) ?? null;
  });

  ngOnDestroy(): void {
    this.clearTimers();
  }

  startBattle(): void {
    const room = this.game.createRoom(this.roomSize(), this.userName());
    this.players.set(room);
    this.logs.set([`Room ready with ${room.length} players.`]);
    this.phase.set('playing');
    this.round.set(0);
    this.turnMotionTick.set(0);
    this.winnerId.set(null);
    this.currentTurnPlayerId.set(null);
    this.turnInput.set('');
    this.startAmbientLoop();
    this.startNextTurn();
  }

  restart(): void {
    this.clearTimers();
    this.phase.set('lobby');
    this.players.set([]);
    this.currentTurnPlayerId.set(null);
    this.currentWord.set('');
    this.turnInput.set('');
    this.timeLeft.set(this.turnSeconds());
    this.winnerId.set(null);
    this.logs.set([]);
    this.round.set(0);
    this.turnMotionTick.set(0);
    this.stopAmbientLoop();
  }

  toggleNarrator(): void {
    const nextMuted = !this.narratorMuted();
    this.narratorMuted.set(nextMuted);
    this.game.setNarratorMuted(nextMuted);
  }

  updateNarratorProvider(value: string): void {
    const next = value === 'browser' ? 'browser' : 'external';
    this.narratorProvider.set(next);
    this.game.setNarratorProvider(next);
  }

  updateNarratorVoice(value: string): void {
    this.narratorVoice.set(value);
    this.game.setNarratorVoice(value);
  }

  previewNarrator(): void {
    this.unlockAudio();
    this.game.previewNarrator();
  }

  onTypingInput(value: string): void {
    this.turnInput.set(value);
  }

  refreshBrowserVoices(): void {
    const list = this.game.getBrowserVoices();
    this.browserVoices.set(list);
    if (!this.browserVoice() && list.length > 0) {
      this.browserVoice.set(this.game.getBrowserVoice() || list[0].id);
      this.game.setBrowserVoice(this.browserVoice());
    }
  }

  updateBrowserVoice(value: string): void {
    this.browserVoice.set(value);
    this.game.setBrowserVoice(value);
  }

  submitTurn(): void {
    if (this.phase() !== 'playing' || !this.isMyTurn()) {
      return;
    }
    this.resolveTurn(this.game.isCorrect(this.turnInput(), this.currentWord()));
  }

  private startNextTurn(): void {
    this.clearTimers();

    const alive = this.alivePlayers();
    if (alive.length <= 1) {
      this.finishBattle(alive[0]?.id ?? null);
      return;
    }

    this.round.update((r) => r + 1);

    const currentId = this.currentTurnPlayerId();
    const allPlayers = this.players();
    const activeIds = allPlayers.filter((p) => !p.eliminated).map((p) => p.id);

    let nextIndex = 0;
    if (currentId) {
      const idx = activeIds.indexOf(currentId);
      nextIndex = idx === -1 ? 0 : (idx + 1) % activeIds.length;
    }

    const nextId = activeIds[nextIndex];
    const activePlayer = allPlayers.find((p) => p.id === nextId) ?? null;
    if (!activePlayer) {
      this.finishBattle(null);
      return;
    }

    this.currentTurnPlayerId.set(activePlayer.id);
    this.currentWord.set('');
    this.turnInput.set('');
    this.timeLeft.set(0);
    this.prepCountdown.set(3);

    this.logs.update((list) => [
      `${activePlayer.name}'s turn. Word assigned.`,
      ...list
    ].slice(0, 12));
    this.turnMotionTick.update((n) => n + 1);

    this.runPrepThenStart(activePlayer);
  }

  private runPrepThenStart(activePlayer: SpellingPlayer): void {
    this.clearPrepTimer();
    this.prepRef = window.setInterval(() => {
      const left = this.prepCountdown();
      if (left <= 1) {
        this.clearPrepTimer();
        this.prepCountdown.set(0);

        const word = this.game.nextWord();
        this.currentWord.set(word);
        this.timeLeft.set(this.turnSeconds());

        const aliveCount = this.alivePlayers().length;
        const mood = aliveCount <= 2 ? 'showdown' : aliveCount <= 4 ? 'tense' : 'regular';
        this.game.speakWord(word, activePlayer.name, mood);
        this.startCountdown();

        if (activePlayer.isBot) {
          this.scheduleBotAnswer(activePlayer);
        }
        return;
      }
      this.prepCountdown.set(left - 1);
    }, 1000);
  }

  private startCountdown(): void {
    this.timerRef = window.setInterval(() => {
      const left = this.timeLeft();
      if (left <= 1) {
        this.timeLeft.set(0);
        this.resolveTurn(false);
        return;
      }
      this.timeLeft.set(left - 1);
    }, 1000);
  }

  private scheduleBotAnswer(player: SpellingPlayer): void {
    const thinkMs = 900 + Math.floor(Math.random() * 2300);
    this.botRef = window.setTimeout(() => {
      if (this.phase() !== 'playing' || this.currentTurnPlayerId() !== player.id) {
        return;
      }

      const successRate = 0.68;
      const correct = Math.random() < successRate;
      const targetWord = correct ? this.currentWord() : this.makeWrongGuess(this.currentWord());
      let index = 0;
      this.turnInput.set('');

      this.botTypingRef = window.setInterval(() => {
        if (this.phase() !== 'playing' || this.currentTurnPlayerId() !== player.id) {
          this.clearBotTyping();
          return;
        }

        index += 1;
        this.turnInput.set(targetWord.slice(0, index));
        if (index >= targetWord.length) {
          this.clearBotTyping();
          window.setTimeout(() => this.resolveTurn(correct), 220);
        }
      }, 120 + Math.floor(Math.random() * 80));
    }, thinkMs);
  }

  private makeWrongGuess(word: string): string {
    if (word.length < 3) {
      return `${word}x`;
    }
    return `${word.slice(0, word.length - 1)}z`;
  }

  private resolveTurn(correct: boolean): void {
    this.clearTimers();
    const active = this.currentPlayer();
    if (!active) {
      return;
    }

    if (!correct) {
      this.players.update((list) =>
        list.map((p) => (p.id === active.id ? { ...p, eliminated: true } : p))
      );
      this.playEliminationFx();
      this.triggerScreenShake();
      this.logs.update((list) => [`${active.name} missed the spelling and is eliminated.`, ...list].slice(0, 12));
    } else {
      this.logs.update((list) => [`${active.name} spelled it right and survives.`, ...list].slice(0, 12));
    }

    window.setTimeout(() => this.startNextTurn(), 1100);
  }

  private finishBattle(winnerId: string | null): void {
    this.clearTimers();
    this.stopAmbientLoop();
    this.winnerId.set(winnerId);
    this.phase.set('finished');
    if (winnerId) {
      const winner = this.players().find((p) => p.id === winnerId);
      if (winner) {
        this.logs.update((list) => [`${winner.name} is the last player standing.`, ...list].slice(0, 12));
      }
    }
  }

  private clearTimers(): void {
    if (this.timerRef) {
      window.clearInterval(this.timerRef);
      this.timerRef = null;
    }
    if (this.botRef) {
      window.clearTimeout(this.botRef);
      this.botRef = null;
    }
    this.clearPrepTimer();
    this.clearBotTyping();
  }

  private clearBotTyping(): void {
    if (this.botTypingRef) {
      window.clearInterval(this.botTypingRef);
      this.botTypingRef = null;
    }
  }

  constructor() {
    this.narratorMuted.set(this.game.isNarratorMuted());
    this.narratorProvider.set(this.game.getNarratorProvider());
    this.narratorVoice.set(this.game.getNarratorVoice());
    this.narratorVoices.set(this.game.getNarratorVoices());
    this.browserVoice.set(this.game.getBrowserVoice());
    this.refreshBrowserVoices();
    window.setTimeout(() => this.refreshBrowserVoices(), 300);
  }

  private triggerScreenShake(): void {
    this.screenShake.set(true);
    window.setTimeout(() => this.screenShake.set(false), 360);
  }

  private playEliminationFx(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const AudioContextRef = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextRef) {
      return;
    }

    try {
      const ctx = new AudioContextRef();
      const gain = ctx.createGain();
      gain.gain.value = 0.06;
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      [320, 250, 180].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        osc.connect(gain);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.09);
      });

      window.setTimeout(() => {
        void ctx.close();
      }, 500);
    } catch {
      // Ignore audio failures.
    }
  }

  private startAmbientLoop(): void {
    if (typeof window === 'undefined' || this.ambientRef) {
      return;
    }

    this.unlockAudio();

    this.ambientRef = window.setInterval(() => {
      const alive = this.alivePlayers().length;
      const intensity = alive <= 2 ? 0.15 : alive <= 4 ? 0.11 : 0.08;
      this.playAmbientPulse(intensity);
    }, 1200);
  }

  private stopAmbientLoop(): void {
    if (this.ambientRef) {
      window.clearInterval(this.ambientRef);
      this.ambientRef = null;
    }
  }

  private playAmbientPulse(gainValue: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.unlockAudio();
    if (!this.audioCtx || !this.masterGain) {
      return;
    }

    try {
      const now = this.audioCtx.currentTime;
      [95, 120, 160].forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const gain = this.audioCtx!.createGain();
        gain.gain.setValueAtTime(gainValue, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.05);
        osc.stop(now + 0.3 + idx * 0.04);
      });
    } catch {
      // Ignore audio failures.
    }
  }

  private clearPrepTimer(): void {
    if (this.prepRef) {
      window.clearInterval(this.prepRef);
      this.prepRef = null;
    }
  }

  private unlockAudio(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const AudioContextRef = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextRef) {
      return;
    }

    if (!this.audioCtx) {
      this.audioCtx = new AudioContextRef();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.24;
      this.masterGain.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
  }
}
