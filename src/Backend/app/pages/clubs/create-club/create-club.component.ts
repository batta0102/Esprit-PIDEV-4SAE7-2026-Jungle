import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClubService } from '../../../services/club.service';  // Import du service

@Component({
  selector: 'app-create-club',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-club.component.html',
  styleUrls: ['./create-club.component.scss']
})
export class CreateClubComponent {
  clubForm: FormGroup;
  isSubmitting = false;
  selectedIcon = '📚';
  availableIcons = ['📚', '🗣️', '🎭', '📖', '✍️', '🌍', '🎯', '💬', '🎪', '📝'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clubService: ClubService
  ) {
    this.clubForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      niveau: ['', Validators.required],
      capacityMax: [20, [Validators.required, Validators.min(5), Validators.max(100)]],
      icon: ['📚']
    });
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.clubForm.patchValue({ icon });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clubForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    console.log('🔴 Formulaire soumis');
    console.log('📝 Valeurs du formulaire:', this.clubForm.value);
    console.log('✅ Formulaire valide?', this.clubForm.valid);

    if (this.clubForm.invalid) {
      console.log('❌ Formulaire invalide - erreurs:', this.clubForm.errors);
      return;
    }

    this.isSubmitting = true;

    // ✅ Correction 1: Utiliser un objet Date, pas une string
    const clubData = {
      nom: this.clubForm.value.nom,
      description: this.clubForm.value.description,
      niveau: this.clubForm.value.niveau,
      capacityMax: this.clubForm.value.capacityMax,
      clubOwner: 1,
      dateCreation: new Date(),  // ← Maintenant c'est un objet Date, pas une string
      status: 'ACTIVE'
    };

    console.log('📤 Envoi des données au service:', clubData);

    this.clubService.createClub(clubData).subscribe({
      next: (response) => {
        console.log('✅ Réponse du serveur:', response);
        this.isSubmitting = false;
        alert('Club créé avec succès !');
        this.router.navigate(['/back/clubs']);
      },
      error: (error) => {
        console.error('❌ Erreur complète:', error);
        console.error('❌ Statut:', error.status);
        console.error('❌ Message:', error.message);
        this.isSubmitting = false;
        alert(`Erreur ${error.status}: ${error.message}`);
      }
    });


  }

  onCancel(): void {
    this.router.navigate(['/back/clubs']);
  }
}
