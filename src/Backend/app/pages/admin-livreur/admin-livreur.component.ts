import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminPageShellComponent, AdminStat } from '../../shared/admin-page-shell/admin-page-shell.component';
import { CreateLivreurRequest, LivreurUser, UpdateLivreurRequest, UserService, UserStatus } from '../../services/user.service';

@Component({
  selector: 'app-admin-livreur',
  imports: [CommonModule, ReactiveFormsModule, AdminPageShellComponent],
  templateUrl: './admin-livreur.component.html',
  styleUrl: './admin-livreur.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLivreurComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  readonly livreurs = signal<LivreurUser[]>([]);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly searchTerm = signal('');
  readonly toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  readonly statuses: UserStatus[] = ['AVAILABLE', 'BUSY', 'OFFLINE'];

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    address: [''],
    status: ['AVAILABLE' as UserStatus, [Validators.required]]
  });

  readonly filteredLivreurs = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.livreurs();
    }

    return this.livreurs().filter((l) =>
      `${l.fullName} ${l.email} ${l.phone ?? ''} ${l.status ?? ''}`.toLowerCase().includes(query)
    );
  });

  readonly stats = computed<AdminStat[]>(() => {
    const all = this.livreurs();
    const available = all.filter((l) => l.status === 'AVAILABLE').length;
    const busy = all.filter((l) => l.status === 'BUSY').length;

    return [
      { label: 'Total Livreurs', value: all.length },
      { label: 'Available', value: available, accent: 'green' },
      { label: 'Busy', value: busy, accent: 'orange' }
    ];
  });

  ngOnInit(): void {
    this.loadLivreurs();
  }

  openAddForm(): void {
    this.editingId.set(null);
    this.form.reset({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      status: 'AVAILABLE'
    });
    this.form.controls.password.enable();
    this.showForm.set(true);
  }

  openEditForm(livreur: LivreurUser): void {
    this.editingId.set(livreur.id);
    this.form.reset({
      fullName: livreur.fullName,
      email: livreur.email,
      password: '',
      phone: livreur.phone ?? '',
      address: livreur.address ?? '',
      status: (livreur.status as UserStatus) || 'AVAILABLE'
    });
    this.form.controls.password.disable();
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.controls.password.enable();
  }

  saveLivreur(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.toast.set(null);

    const editId = this.editingId();
    if (editId) {
      const updatePayload: UpdateLivreurRequest = {
        fullName: this.form.controls.fullName.value.trim(),
        email: this.form.controls.email.value.trim().toLowerCase(),
        phone: this.form.controls.phone.value.trim(),
        address: this.form.controls.address.value.trim() || null,
        status: this.form.controls.status.value,
        role: 'LIVREUR'
      };

      this.userService.updateLivreur(editId, updatePayload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showSuccess('Livreur updated successfully.');
          this.closeForm();
          this.loadLivreurs();
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.showError(this.toMessage(error, 'Failed to update livreur.'));
        }
      });
      return;
    }

    const createPayload: CreateLivreurRequest = {
      fullName: this.form.controls.fullName.value.trim(),
      email: this.form.controls.email.value.trim().toLowerCase(),
      password: this.form.controls.password.value,
      phone: this.form.controls.phone.value.trim(),
      address: this.form.controls.address.value.trim() || null,
      status: this.form.controls.status.value
    };

    this.userService.createLivreur(createPayload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showSuccess('Livreur created successfully (Keycloak + MySQL).');
        this.closeForm();
        this.loadLivreurs();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.showError(this.toMessage(error, 'Failed to create livreur.'));
      }
    });
  }

  deleteLivreur(livreur: LivreurUser): void {
    const confirmed = confirm(`Delete user ${livreur.fullName}?`);
    if (!confirmed) {
      return;
    }

    this.submitting.set(true);
    this.userService.deleteUser(livreur.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showSuccess('Livreur deleted successfully.');
        this.loadLivreurs();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.showError(this.toMessage(error, 'Failed to delete livreur.'));
      }
    });
  }

  loadLivreurs(): void {
    this.loading.set(true);
    this.userService.getAllLivreurs().subscribe({
      next: (data) => {
        this.livreurs.set(data);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.showError(this.toMessage(error, 'Failed to load livreurs from user-service.'));
      }
    });
  }

  clearToast(): void {
    this.toast.set(null);
  }

  private showSuccess(message: string): void {
    this.toast.set({ type: 'success', message });
  }

  private showError(message: string): void {
    this.toast.set({ type: 'error', message });
  }

  private toMessage(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 0) {
      return 'Cannot reach API Gateway on localhost:8085.';
    }

    if (typeof error.error?.message === 'string' && error.error.message.trim().length > 0) {
      return error.error.message;
    }

    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    return fallback;
  }
}
