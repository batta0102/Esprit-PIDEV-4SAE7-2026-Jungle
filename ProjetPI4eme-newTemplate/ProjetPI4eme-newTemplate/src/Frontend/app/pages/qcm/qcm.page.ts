import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AdmissionApiService, QcmDto, SessionTestDto } from '../../core/services/admission-api.service';
import { AssessmentSyncService } from '../../core/services/assessment-sync.service';
import { QuizAttemptComponent } from './components/quiz-attempt-v2.component';
import { QuizResultsComponent } from './components/quiz-results.component';

interface QuizHistory {
  id: number;
  title: string;
  score: number;
  total: number;
  percentage: number;
  date: Date;
  timeTaken: number;
}

type QuizPageMode = 'catalog' | 'attempt' | 'results' | 'history';

interface ActiveSession {
  quiz: QcmDto;
  sessionId: number;
  startTime: Date;
}

interface QuizResultData {
  quiz: QcmDto;
  score: number;
  total: number;
  percentage: number;
  timeTaken: number;
  sessionId: number;
}

@Component({
  selector: 'app-qcm-page',
  standalone: true,
  imports: [CommonModule, QuizAttemptComponent, QuizResultsComponent],
  templateUrl: './qcm.page.html',
  styleUrl: './qcm.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QcmPage {
  private readonly admissionApi = inject(AdmissionApiService);
  private readonly assessmentSync = inject(AssessmentSyncService);
  private readonly router = inject(Router);

  readonly qcms = signal<QcmDto[]>([]);
  readonly quizHistory = signal<QuizHistory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pageMode = signal<QuizPageMode>('catalog');
  readonly activeSession = signal<ActiveSession | null>(null);
  readonly quizResult = signal<QuizResultData | null>(null);

  constructor() {
    this.loadQcms();
    this.loadHistory();
  }

  private loadQcms(): void {
    this.loading.set(true);
    this.error.set(null);

    this.admissionApi.getQcms().subscribe({
      next: (items) => {
        this.qcms.set(items ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load quizzes. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private loadHistory(): void {
    // In a real app, this would fetch from the backend
    // For now, using session tests and results
    this.admissionApi.getSessionTests().subscribe({
      next: (sessions) => {
        const history: QuizHistory[] = (sessions ?? []).map(session => ({
          id: session.id,
          title: session.qcm?.titre ?? 'Unknown Quiz',
          score: session.scoreTotal,
          total: session.qcm?.questions?.length ?? 0,
          percentage: session.pourcentage,
          date: new Date(session.dateFin),
          timeTaken: session.tempsPasseSecondes
        }));
        this.quizHistory.set(history.sort((a, b) => b.date.getTime() - a.date.getTime()));
      },
      error: (err) => {
        console.error('Failed to load history:', err);
      }
    });
  }

  startQuiz(quiz: QcmDto): void {
    if (!quiz.questions || quiz.questions.length === 0) {
      this.error.set('This quiz has no questions yet.');
      return;
    }

    const now = new Date();
    const inDuration = new Date(now.getTime() + (quiz.dureeMinutes ?? 30) * 60 * 1000);

    this.admissionApi
      .createSessionTest({
        dateDebut: now.toISOString(),
        dateFin: inDuration.toISOString(),
        statut: 'EN_COURS',
        scoreTotal: 0,
        pourcentage: 0,
        tempsPasseSecondes: 0,
        qcm: { id: quiz.id }
      })
      .subscribe({
        next: (session) => {
          this.activeSession.set({
            quiz,
            sessionId: session.id,
            startTime: now
          });
          this.pageMode.set('attempt');
        },
        error: (err) => {
          console.error('Could not start quiz session:', err);
          this.error.set('Could not start quiz. Please try again.');
        }
      });
  }

  onAttemptCompleted(result: { score: number; total: number; percentage: number; timeTaken: number }): void {
    const quiz = this.activeSession()?.quiz;
    if (!quiz) return;

    this.quizResult.set({
      quiz,
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      timeTaken: result.timeTaken,
      sessionId: this.activeSession()!.sessionId
    });
    this.pageMode.set('results');
    this.assessmentSync.notifyRefresh();
    this.loadHistory();
  }

  onAttemptClosed(): void {
    this.activeSession.set(null);
    this.pageMode.set('catalog');
  }

  onResultsClosed(): void {
    this.quizResult.set(null);
    this.activeSession.set(null);
    this.pageMode.set('catalog');
    this.loadQcms();
  }

  showHistory(): void {
    this.pageMode.set('history');
  }

  backToCatalog(): void {
    this.pageMode.set('catalog');
  }
}
