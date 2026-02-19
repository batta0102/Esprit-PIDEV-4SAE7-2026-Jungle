import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppModalComponent } from '../ui/modal.component';

export interface VenueFormData {
	name: string;
	address: string;
	city?: string;
	country?: string;
	postalCode?: string;
	capacity?: number | null;
}

@Component({
	selector: 'app-create-venue-modal',
	standalone: true,
	imports: [CommonModule, FormsModule, AppModalComponent],
	template: `
		<app-modal [isOpen]="isOpen" [title]="title" (close)="close()">
			<form (ngSubmit)="handleSubmit()" class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-text mb-2">Name *</label>
					<input
						type="text"
						[(ngModel)]="form.name"
						name="name"
						class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Venue name"
					/>
					<p *ngIf="touched && !form.name" class="mt-1 text-sm text-red-600">Name is required.</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-text mb-2">Address *</label>
					<input
						type="text"
						[(ngModel)]="form.address"
						name="address"
						class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Street address"
					/>
					<p *ngIf="touched && !form.address" class="mt-1 text-sm text-red-600">Address is required.</p>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-text mb-2">City</label>
						<input
							type="text"
							[(ngModel)]="form.city"
							name="city"
							class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="City"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-text mb-2">Country</label>
						<input
							type="text"
							[(ngModel)]="form.country"
							name="country"
							class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Country"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-text mb-2">Postal Code</label>
						<input
							type="text"
							[(ngModel)]="form.postalCode"
							name="postalCode"
							class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="e.g. 1000"
						/>
						<p *ngIf="touched && !!form.postalCode && !isPostalCodeValid(form.postalCode)" class="mt-1 text-sm text-red-600">
							Postal code must be 4–10 characters.
						</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-text mb-2">Capacity</label>
						<input
							type="number"
							[(ngModel)]="form.capacity"
							name="capacity"
							class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Optional"
							min="0"
						/>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						(click)="close()"
						class="px-4 py-2 border border-border rounded-lg text-text hover:bg-background transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium"
					>
						{{ submitLabel }}
					</button>
				</div>
			</form>
		</app-modal>
	`,
	styles: []
})
export class CreateVenueModalComponent {
	@Input() isOpen = false;
	@Input() title = 'New Venue';
	@Input() submitLabel = 'Create';
	@Input() initialData: Partial<VenueFormData> | null = null;

	@Output() onClose = new EventEmitter<void>();
	@Output() onSubmit = new EventEmitter<VenueFormData>();

	touched = false;

	form: VenueFormData = {
		name: '',
		address: '',
		city: '',
		country: '',
		postalCode: '',
		capacity: null
	};

	ngOnChanges(): void {
		if (!this.isOpen) return;
		if (!this.initialData) {
			this.reset();
			return;
		}
		this.form = {
			name: this.initialData.name ?? '',
			address: this.initialData.address ?? '',
			city: this.initialData.city ?? '',
			country: this.initialData.country ?? '',
			postalCode: this.initialData.postalCode ?? '',
			capacity: this.initialData.capacity ?? null
		};
		this.touched = false;
	}

	close(): void {
		this.onClose.emit();
		this.reset();
	}

	handleSubmit(): void {
		this.touched = true;
		if (!this.isValid()) return;
		this.onSubmit.emit({ ...this.form, capacity: this.form.capacity ?? null });
		this.reset();
		this.onClose.emit();
	}

	private isValid(): boolean {
		if (!this.form.name?.trim()) return false;
		if (!this.form.address?.trim()) return false;
		if (this.form.postalCode && !this.isPostalCodeValid(this.form.postalCode)) return false;
		return true;
	}

	isPostalCodeValid(value: string): boolean {
		const v = value.trim();
		if (!v) return true;
		return /^(?=.{4,10}$).+$/.test(v);
	}

	private reset(): void {
		this.form = {
			name: '',
			address: '',
			city: '',
			country: '',
			postalCode: '',
			capacity: null
		};
		this.touched = false;
	}
}
