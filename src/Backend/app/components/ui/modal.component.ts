import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden p-4 sm:items-center sm:p-0" [ngClass]="overlayClass">
      <div class="relative flex w-full max-w-lg flex-col rounded-xl shadow-2xl border border-border max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]" [ngClass]="panelClass">
        <!-- Header -->
        <div class="shrink-0 flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h3 class="font-serif text-xl font-semibold text-text">
            {{ title }}
          </h3>
          <button
            (click)="onClose()"
            class="rounded-lg p-1.5 text-secondary hover:bg-light hover:text-text transition-colors">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div *ngIf="showFooter" class="shrink-0 flex items-center justify-end space-x-3 border-t border-border px-4 py-3 sm:px-6 sm:py-4 rounded-b-xl" [ngClass]="footerClass">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AppModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = false;
  @Input() overlayClass = 'bg-black/40 backdrop-blur-sm';
  @Input() panelClass = 'bg-surface';
  @Input() footerClass = 'bg-light';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
