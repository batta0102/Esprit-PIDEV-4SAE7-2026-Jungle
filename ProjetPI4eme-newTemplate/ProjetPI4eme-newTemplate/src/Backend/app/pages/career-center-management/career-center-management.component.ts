import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  CandidatureDto,
  InterviewDto,
  JobOfferDto,
  InterviewPayload,
  RecruitmentService,
  RecruitmentStatus
} from '../../services/recruitment.service';

@Component({
  selector: 'app-career-center-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './career-center-management.component.html',
  styleUrls: ['./career-center-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CareerCenterManagementComponent {
  private readonly recruitmentService = inject(RecruitmentService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  readonly offers = signal<JobOfferDto[]>([]);
  readonly candidatures = signal<CandidatureDto[]>([]);
  readonly interviews = signal<InterviewDto[]>([]);

  readonly editingOfferId = signal<number | null>(null);
  readonly offerTitle = signal('');
  readonly offerContent = signal('');
  readonly offerDescription = signal('');
  readonly offerLevel = signal('Beginner');
  readonly offerExperience = signal(0);
  readonly offerActive = signal(true);

  readonly interviewCandidatureId = signal<number | null>(null);
  readonly interviewDate = signal('');
  readonly interviewType = signal('EN_LIGNE');
  readonly interviewResult = signal('EN_ATTENTE');
  readonly interviewComment = signal('');

  readonly statusOptions: RecruitmentStatus[] = [
    'EN_ATTENTE',
    'CV_VALIDE',
    'INTERVIEW_PLANIFIEE',
    'INTERVIEW_ACCEPTEE',
    'INTERVIEW_REFUSEE',
    'TEST_EN_ATTENTE',
    'CERTIFIE',
    'REFUSE'
  ];

  readonly activeOffersCount = computed(() => this.offers().filter((offer) => offer.actif).length);
  readonly candidaturesCount = computed(() => this.candidatures().length);

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      offers: this.recruitmentService.getOffers(),
      candidatures: this.recruitmentService.getCandidatures(),
      interviews: this.recruitmentService.getInterviews()
    }).subscribe({
      next: ({ offers, candidatures, interviews }) => {
        this.offers.set(offers ?? []);
        this.candidatures.set(candidatures ?? []);
        this.interviews.set(interviews ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load career center data.');
        this.loading.set(false);
      }
    });
  }

  resetOfferForm(): void {
    this.editingOfferId.set(null);
    this.offerTitle.set('');
    this.offerContent.set('');
    this.offerDescription.set('');
    this.offerLevel.set('Beginner');
    this.offerExperience.set(0);
    this.offerActive.set(true);
  }

  editOffer(offer: JobOfferDto): void {
    this.editingOfferId.set(offer.id);
    this.offerTitle.set(offer.titre ?? '');
    this.offerContent.set(offer.contenu ?? offer.description ?? '');
    this.offerDescription.set(offer.description ?? offer.contenu ?? '');
    this.offerLevel.set(offer.niveauRequis ?? 'Beginner');
    this.offerExperience.set(offer.experienceRequise ?? 0);
    this.offerActive.set(offer.actif);
    this.message.set(null);
  }

  saveOffer(): void {
    const title = this.offerTitle().trim();
    const content = this.offerContent().trim();
    const description = this.offerDescription().trim();

    if (!title || !content || !description) {
      this.message.set('Title, summary and description are required.');
      return;
    }

    const payload = {
      titre: title,
      contenu: content,
      description,
      niveauRequis: this.offerLevel().trim() || 'Beginner',
      experienceRequise: Math.max(0, Number(this.offerExperience() || 0)),
      datePublication: new Date().toISOString().slice(0, 10),
      actif: this.offerActive()
    };

    const offerId = this.editingOfferId();
    const request$ = offerId
      ? this.recruitmentService.updateOffer(offerId, payload)
      : this.recruitmentService.createOffer(payload);

    request$.subscribe({
      next: (offer) => {
        if (offerId) {
          this.offers.update((items) => items.map((item) => (item.id === offer.id ? offer : item)));
          this.message.set('Job offering updated successfully.');
        } else {
          this.offers.update((items) => [offer, ...items]);
          this.message.set('Job offering created successfully.');
        }
        this.resetOfferForm();
      },
      error: () => {
        this.message.set('Could not save job offering.');
      }
    });
  }

  deleteOffer(offerId: number): void {
    this.recruitmentService.deleteOffer(offerId).subscribe({
      next: () => {
        this.offers.update((items) => items.filter((offer) => offer.id !== offerId));
        this.candidatures.update((items) => items.filter((item) => item.poste?.id !== offerId));
        this.message.set('Job offering deleted.');
        if (this.editingOfferId() === offerId) {
          this.resetOfferForm();
        }
      },
      error: () => {
        this.message.set('Could not delete job offering.');
      }
    });
  }

  updateStatus(candidatureId: number, statut: string): void {
    this.recruitmentService.updateStatus(candidatureId, statut as RecruitmentStatus).subscribe({
      next: (updated) => {
        this.candidatures.update((items) =>
          items.map((item) => (item.id === candidatureId ? { ...item, statut: updated.statut } : item))
        );
      }
    });
  }

  updateComment(candidature: CandidatureDto): void {
    this.recruitmentService.updateComment(candidature.id, candidature.commentaireAdmin ?? '').subscribe({
      next: (updated) => {
        this.candidatures.update((items) =>
          items.map((item) =>
            item.id === candidature.id ? { ...item, commentaireAdmin: updated.commentaireAdmin } : item
          )
        );
      }
    });
  }

  scheduleInterview(): void {
    const candidatureId = this.interviewCandidatureId();
    if (!candidatureId) {
      this.message.set('Select a candidature before scheduling an interview.');
      return;
    }

    const dateInterview = this.interviewDate();
    if (!dateInterview) {
      this.message.set('Select an interview date and time.');
      return;
    }

    const payload: InterviewPayload = {
      dateInterview: this.toBackendLocalDateTime(dateInterview),
      type: this.interviewType(),
      resultat: this.interviewResult(),
      commentaire: this.interviewComment().trim(),
      candidature: { id: candidatureId }
    };

    this.recruitmentService.createInterview(payload).subscribe({
      next: (interview) => {
        this.interviews.update((rows) => [interview, ...rows]);
        this.message.set('Interview scheduled successfully.');
        this.interviewCandidatureId.set(null);
        this.interviewDate.set('');
        this.interviewType.set('EN_LIGNE');
        this.interviewResult.set('EN_ATTENTE');
        this.interviewComment.set('');
      },
      error: () => {
        this.message.set('Could not schedule interview.');
      }
    });
  }

  private toBackendLocalDateTime(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const hours = String(parsed.getHours()).padStart(2, '0');
    const minutes = String(parsed.getMinutes()).padStart(2, '0');
    const seconds = String(parsed.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
