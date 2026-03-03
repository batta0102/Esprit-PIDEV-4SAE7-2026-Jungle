import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CareerCenterApiService,
  CandidaturePayload,
  JobOfferDto
} from '../../core/services/career-center-api.service';

@Component({
  selector: 'app-career-center-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './career-center.page.html',
  styleUrl: './career-center.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CareerCenterPage {
  private readonly careerApi = inject(CareerCenterApiService);

  readonly offers = signal<JobOfferDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly applyMessage = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly selectedOffer = signal<JobOfferDto | null>(null);
  readonly applicantName = signal('');
  readonly applicantEmail = signal('');
  readonly applicantCv = signal('');

  readonly activeOffers = computed(() => this.offers().filter((offer) => offer.actif));

  constructor() {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.careerApi.getJobOffers().subscribe({
      next: (offers) => {
        this.offers.set(offers ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load job offerings.');
        this.loading.set(false);
      }
    });
  }

  openApply(offer: JobOfferDto): void {
    this.selectedOffer.set(offer);
    this.applyMessage.set(null);
    this.applicantName.set('');
    this.applicantEmail.set('');
    this.applicantCv.set('');
  }

  closeApply(): void {
    this.selectedOffer.set(null);
    this.submitting.set(false);
  }

  submitApplication(): void {
    const offer = this.selectedOffer();
    if (!offer) {
      return;
    }

    const nom = this.applicantName().trim();
    const email = this.applicantEmail().trim();
    const cv = this.applicantCv().trim();

    if (!nom || !email || !cv) {
      this.applyMessage.set('Please fill in all fields before applying.');
      return;
    }

    const payload: CandidaturePayload = {
      nom,
      email,
      cv,
      poste: { id: offer.id }
    };

    this.submitting.set(true);
    this.applyMessage.set(null);

    this.careerApi.createCandidature(payload).subscribe({
      next: () => {
        this.applyMessage.set(`Application submitted for "${offer.titre}".`);
        this.submitting.set(false);
        this.closeApply();
      },
      error: () => {
        this.applyMessage.set('Could not submit your application. Please try again.');
        this.submitting.set(false);
      }
    });
  }
}
