import { Injectable } from '@angular/core';

export interface SpellingPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  eliminated: boolean;
}

export type NarratorProvider = 'external' | 'browser';

export interface NarratorVoiceOption {
  id: string;
  label: string;
}

const WORD_STORAGE_KEY = 'jie-spelling-words-v1';

const DEFAULT_WORDS = [
  'adventure',
  'language',
  'journey',
  'mountain',
  'butterfly',
  'treasure',
  'library',
  'elegant',
  'victory',
  'umbrella',
  'knowledge',
  'challenge',
  'dialogue',
  'whisper',
  'dinosaur',
  'festival',
  'captain',
  'island',
  'harmony',
  'camera',
  'oxygen',
  'science',
  'planet',
  'friendship',
  'courage',
  'squirrel',
  'strawberry',
  'notebook',
  'bicycle',
  'excellent'
];

@Injectable({ providedIn: 'root' })
export class SpellingBattleService {
  private readonly botNames = [
    'Lina',
    'Noah',
    'Maya',
    'Adam',
    'Sara',
    'Rami',
    'Yasmine',
    'Omar',
    'Aya',
    'Karim'
  ];

  private readonly botAvatars = ['🐯', '🦊', '🦁', '🐼', '🐸', '🐵', '🦉', '🐨', '🐧', '🦜'];
  private narratorMuted = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private provider: NarratorProvider = 'browser';
  private externalVoice = 'Brian';
  private externalAudio: HTMLAudioElement | null = null;
  private browserVoiceUri = '';

  private readonly externalVoices: NarratorVoiceOption[] = [
    { id: 'Brian', label: 'Brian Studio' },
    { id: 'Amy', label: 'Amy Warm' },
    { id: 'Joanna', label: 'Joanna Clear' },
    { id: 'Matthew', label: 'Matthew Deep' },
    { id: 'Justin', label: 'Justin Bright' }
  ];

  createRoom(playerCount: number, userName: string): SpellingPlayer[] {
    const total = Math.max(1, Math.min(10, Math.floor(playerCount)));
    const players: SpellingPlayer[] = [
      {
        id: 'you',
        name: userName || 'You',
        avatar: '🧑',
        isBot: false,
        eliminated: false
      }
    ];

    for (let i = 1; i < total; i++) {
      players.push({
        id: `bot-${i}`,
        name: this.botNames[(i - 1) % this.botNames.length],
        avatar: this.botAvatars[(i - 1) % this.botAvatars.length],
        isBot: true,
        eliminated: false
      });
    }

    // Shuffle to vary turn order while keeping behavior deterministic enough.
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = players[i];
      players[i] = players[j];
      players[j] = temp;
    }

    return players;
  }

  nextWord(): string {
    const words = this.getWordBank();
    const index = Math.floor(Math.random() * words.length);
    return words[index] || 'language';
  }

  isCorrect(input: string, word: string): boolean {
    return input.trim().toLowerCase() === word.trim().toLowerCase();
  }

  speakWord(word: string, playerName: string, mood: 'regular' | 'tense' | 'showdown' = 'regular'): void {
    if (this.narratorMuted) {
      return;
    }

    this.playTurnCue();

    const intro = mood === 'showdown'
      ? 'Final duel.'
      : mood === 'tense'
        ? 'Tension is rising.'
        : 'Listen carefully.';
    const text = `${intro} ${playerName}, your word is ${word}. Repeat. ${word}.`;

    if (this.provider === 'external') {
      if (this.speakWithStreamElements(text, mood, () => this.speakWithBrowser(text, mood))) {
        return;
      }
      if (this.speakWithGoogleTts(text, mood, () => this.speakWithBrowser(text, mood))) {
        return;
      }
    }

    this.speakWithBrowser(text, mood);
  }

  previewNarrator(): void {
    this.speakWord('challenge', 'Player', 'regular');
  }

  setNarratorProvider(provider: NarratorProvider): void {
    this.provider = provider;
  }

  getNarratorProvider(): NarratorProvider {
    return this.provider;
  }

  setNarratorVoice(voiceId: string): void {
    this.externalVoice = voiceId || this.externalVoice;
  }

  getNarratorVoice(): string {
    return this.externalVoice;
  }

  getNarratorVoices(): NarratorVoiceOption[] {
    return this.externalVoices;
  }

  getBrowserVoices(): NarratorVoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }

    const voices = window.speechSynthesis.getVoices() || [];
    return voices
      .filter((v) => /^en/i.test(v.lang))
      .map((v) => ({ id: v.voiceURI, label: `${v.name} (${v.lang})` }));
  }

  setBrowserVoice(voiceUri: string): void {
    this.browserVoiceUri = voiceUri;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices() || [];
      const exact = voices.find((v) => v.voiceURI === voiceUri) ?? null;
      if (exact) {
        this.selectedVoice = exact;
      }
    }
  }

  getBrowserVoice(): string {
    return this.browserVoiceUri;
  }

  private speakWithStreamElements(
    text: string,
    mood: 'regular' | 'tense' | 'showdown',
    onFail: () => void
  ): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const encodedText = encodeURIComponent(text);
      const encodedVoice = encodeURIComponent(this.externalVoice);
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodedVoice}&text=${encodedText}`;

      if (this.externalAudio) {
        this.externalAudio.pause();
      }

      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.playbackRate = mood === 'showdown' ? 0.95 : mood === 'tense' ? 0.98 : 1;
      this.externalAudio = audio;

      let started = false;
      let failed = false;
      const fallbackTimer = window.setTimeout(() => {
        if (!started && !failed) {
          failed = true;
          onFail();
        }
      }, 1500);

      const markStarted = () => {
        started = true;
        window.clearTimeout(fallbackTimer);
      };
      const markFailed = () => {
        if (!failed) {
          failed = true;
          window.clearTimeout(fallbackTimer);
          onFail();
        }
      };

      audio.onplaying = markStarted;
      audio.oncanplay = markStarted;
      audio.onerror = markFailed;
      audio.onstalled = markFailed;
      audio.onabort = markFailed;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          markFailed();
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  private speakWithGoogleTts(
    text: string,
    mood: 'regular' | 'tense' | 'showdown',
    onFail: () => void
  ): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;

      if (this.externalAudio) {
        this.externalAudio.pause();
      }

      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.playbackRate = mood === 'showdown' ? 0.93 : mood === 'tense' ? 0.97 : 1;
      this.externalAudio = audio;

      let started = false;
      let failed = false;
      const fallbackTimer = window.setTimeout(() => {
        if (!started && !failed) {
          failed = true;
          onFail();
        }
      }, 1500);

      const markStarted = () => {
        started = true;
        window.clearTimeout(fallbackTimer);
      };
      const markFailed = () => {
        if (!failed) {
          failed = true;
          window.clearTimeout(fallbackTimer);
          onFail();
        }
      };

      audio.onplaying = markStarted;
      audio.oncanplay = markStarted;
      audio.onerror = markFailed;
      audio.onstalled = markFailed;
      audio.onabort = markFailed;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          markFailed();
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  private speakWithBrowser(text: string, mood: 'regular' | 'tense' | 'showdown'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    this.ensureVoiceReady();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = mood === 'showdown' ? 0.78 : mood === 'tense' ? 0.82 : 0.86;
    utterance.pitch = mood === 'showdown' ? 0.92 : 1;
    utterance.volume = 1;
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  setNarratorMuted(muted: boolean): void {
    this.narratorMuted = muted;
    if (muted && typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (this.externalAudio) {
        this.externalAudio.pause();
      }
    }
  }

  isNarratorMuted(): boolean {
    return this.narratorMuted;
  }

  private ensureVoiceReady(): void {
    if (this.selectedVoice || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    const chooseVoice = (): void => {
      const voices = synth.getVoices() || [];
      if (!voices.length) {
        return;
      }

      const exactChoice = this.browserVoiceUri
        ? voices.find((v) => v.voiceURI === this.browserVoiceUri)
        : null;

      const preferredNatural = voices.find((v) =>
        /^en/i.test(v.lang) && /natural|neural|jenny|aria|guy|sara|sonia|libby/i.test(v.name)
      );
      const preferred = voices.find((v) => /en-us|en-gb/i.test(v.lang) && /google|zira|aria|samantha|jenny/i.test(v.name));
      const fallbackEn = voices.find((v) => /^en/i.test(v.lang));

      this.selectedVoice = exactChoice ?? preferredNatural ?? preferred ?? fallbackEn ?? voices[0] ?? null;
      if (this.selectedVoice) {
        this.browserVoiceUri = this.selectedVoice.voiceURI;
      }
    };

    chooseVoice();
    if (!this.selectedVoice) {
      synth.onvoiceschanged = () => {
        chooseVoice();
      };
    }
  }

  private playTurnCue(): void {
    if (this.narratorMuted || typeof window === 'undefined') {
      return;
    }

    const AudioContextRef = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextRef) {
      return;
    }

    try {
      const ctx = new AudioContextRef();
      const gain = ctx.createGain();
      gain.gain.value = 0.04;
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      [660, 880].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.09);
        osc.connect(gain);
        osc.start(now + index * 0.09);
        osc.stop(now + index * 0.09 + 0.08);
      });

      window.setTimeout(() => {
        void ctx.close();
      }, 350);
    } catch {
      // Ignore audio failures caused by browser autoplay restrictions.
    }
  }

  getWordBank(): string[] {
    try {
      const raw = localStorage.getItem(WORD_STORAGE_KEY);
      if (!raw) {
        return DEFAULT_WORDS;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return DEFAULT_WORDS;
      }

      const words = parsed
        .map((w) => (typeof w === 'string' ? w.trim().toLowerCase() : ''))
        .filter((w) => w.length > 1);

      return words.length > 0 ? words : DEFAULT_WORDS;
    } catch {
      return DEFAULT_WORDS;
    }
  }
}
