import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClubMessageService } from '../../../../../Frontend/app/services/club-message.service';

@Component({
  selector: 'app-forum-messages',
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-6 py-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Forum du Club #{{ clubId }}</h1>
          <p class="mt-2 text-gray-600">Messages du club</p>
        </div>
        <button (click)="goBack()" 
                class="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <span>?</span>
          Retour aux clubs
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-2 text-gray-600">Chargement des messages...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Messages -->
      <div *ngIf="!loading && !error">
        <div class="mb-4">
          <p class="text-sm text-gray-600">{{ messages.length }} message(s)</p>
        </div>
        
        <div *ngIf="messages.length === 0" class="text-center py-8 text-gray-500">
          <p>Aucun message trouvé pour ce club.</p>
        </div>
        
        <div *ngIf="messages.length > 0" class="space-y-4">
          <div *ngFor="let message of messages" 
               class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-semibold text-gray-900">{{ message.user?.nom || 'Utilisateur inconnu' }}</h3>
                <p class="text-sm text-gray-500">{{ message.user?.email || 'email@inconnu.com' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">{{ message.dateEnvoi | date:'dd/MM/yyyy HH:mm' }}</p>
                <p class="text-sm text-gray-500">ID: #{{ message.id }}</p>
              </div>
            </div>
            
            <div class="mb-4">
              <p class="text-gray-800">{{ message.contenu }}</p>
            </div>
            
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <span>??</span>
                {{ message.likes || 0 }} like(s)
              </span>
              <span class="flex items-center gap-1">
                <span>??</span>
                {{ message.commentCount || 0 }} commentaire(s)
              </span>
              <span *ngIf="message.isPinned" class="flex items-center gap-1 text-yellow-600">
                <span>??</span>
                Épinglé
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class ForumMessages implements OnInit {
  clubId: number = 0;
  messages: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: ClubMessageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.clubId = parseInt(id, 10);
        this.loadMessages();
      } else {
        this.error = 'ID du club invalide';
        this.loading = false;
      }
    });
  }

  loadMessages(): void {
    this.loading = true;
    this.error = null;
    
    this.messageService.getMessagesByClub(this.clubId).subscribe({
      next: (messages: any[]) => {
        this.messages = messages;
        this.loading = false;
        console.log(`Messages du club ${this.clubId}:`, messages);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des messages:', error);
        this.error = 'Impossible de charger les messages du forum';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/back/clubs']);
  }
}
