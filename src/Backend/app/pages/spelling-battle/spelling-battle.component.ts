import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-spelling-battle-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './spelling-battle.component.html',
  styleUrl: './spelling-battle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpellingBattleComponent {
  readonly inputText = signal('');
  readonly message = signal<string | null>(null);

  readonly words = computed(() =>
    this.inputText()
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.length > 1)
  );

  constructor() {
    this.load();
  }

  save(): void {
    const next = this.words();
    if (next.length < 5) {
      this.message.set('Add at least 5 words before saving.');
      return;
    }

    localStorage.setItem(WORD_STORAGE_KEY, JSON.stringify(next));
    this.message.set(`Saved ${next.length} words for Spelling Battle.`);
  }

  resetDefaults(): void {
    this.inputText.set(DEFAULT_WORDS.join('\n'));
    localStorage.setItem(WORD_STORAGE_KEY, JSON.stringify(DEFAULT_WORDS));
    this.message.set('Default word bank restored.');
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(WORD_STORAGE_KEY);
      if (!raw) {
        this.inputText.set(DEFAULT_WORDS.join('\n'));
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        this.inputText.set(DEFAULT_WORDS.join('\n'));
        return;
      }

      const words = parsed
        .map((w) => (typeof w === 'string' ? w.trim().toLowerCase() : ''))
        .filter((w) => w.length > 1);

      this.inputText.set((words.length > 0 ? words : DEFAULT_WORDS).join('\n'));
    } catch {
      this.inputText.set(DEFAULT_WORDS.join('\n'));
    }
  }
}
