import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ClubMessageService } from '../../services/club-message.service';
import { CommentService } from '../../services/comment.service';
import { ClubMessage, CreateMessageDTO, Comment, CreateCommentDTO } from '../../models/forum.models';

@Component({
  selector: 'app-club-forum',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './club-forum.component.html',
  styleUrls: ['./club-forum.component.scss']
})
export class ClubForumComponent implements OnInit, OnDestroy {
  @Input() clubId?: number;
  clubIdFromRoute: number = 0;
  messages: ClubMessage[] = [];
  loading = true;
  error: string | null = null;
  
  // Formulaire pour créer un message
  messageForm: FormGroup;
  submitting = false;
  
  // Formulaire pour créer un commentaire
  commentForm: FormGroup;
  
  // Pour afficher les commentaires
  expandedMessages: Set<number> = new Set();
  commentsCache: Map<number, Comment[]> = new Map();
  loadingComments: Set<number> = new Set();
  
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private messageService: ClubMessageService,
    private commentService: CommentService,
    private cdr: ChangeDetectorRef
  ) {
    this.messageForm = this.fb.group({
      contenu: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });
    
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Récupérer l'ID du club depuis la route
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.clubIdFromRoute = +id;
      }
    });

    const effectiveClubId = this.clubId || this.clubIdFromRoute;
    
    if (effectiveClubId) {
      this.loadMessages(effectiveClubId);
    } else {
      this.error = 'ID du club invalide';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Rafraîchit manuellement les messages
   */
  refreshMessages(): void {
    const effectiveClubId = this.clubId || this.clubIdFromRoute;
    
    if (effectiveClubId) {
      this.loadMessages(effectiveClubId);
    }
  }

  /**
   * Charge les messages du club
   */
  loadMessages(clubId?: number): void {
    const effectiveClubId = clubId || this.clubId || this.clubIdFromRoute;
    
    if (!effectiveClubId) {
      this.error = 'ID du club invalide';
      this.loading = false;
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    const messagesSub = this.messageService.getMessagesByClub(effectiveClubId).subscribe({
      next: (messages: ClubMessage[]) => {
        // Filtrer les messages qui n'ont pas d'ID pour éviter les erreurs
        const validMessages = messages.filter(message => message && (message.idMessage || message.id));
        
        this.messages = validMessages.sort((a, b) => 
          new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime()
        );
        this.loading = false;
        
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.error = 'Impossible de charger les messages. Vérifiez que le serveur backend fonctionne.';
        this.loading = false;
        this.messages = [];
        
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(messagesSub);
  }

  /**
   * Soumet un nouveau message
   */
  submitMessage(): void {
  if (this.messageForm.invalid || this.submitting) {
    return;
  }

  const contenu = this.messageForm.get('contenu')?.value;
  
  this.submitting = true;
  
  // ⚠️ CORRECTION : Envoyer clubId DIRECTEMENT
  const messageDTO = {
    contenu: contenu.trim(),
    clubId: this.clubId || this.clubIdFromRoute,  // ← clubId, PAS club !
    userId: this.getCurrentUserId()
  };
  
  console.log('📤 SUBMITMESSAGE ENVOIE:', messageDTO);  // ← Doit afficher {contenu: "...", clubId: 1, userId: 1}

  const submitSub = this.messageService.createMessage(messageDTO).pipe(
    finalize(() => {
      this.submitting = false;
      this.cdr.detectChanges();
    })
  ).subscribe({
    next: (newMessage: ClubMessage) => {
      console.log('✅ Message créé:', newMessage);
      this.messages = [newMessage, ...this.messages];
      this.messageForm.reset();
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      console.error('❌ Erreur:', error);
      this.error = 'Impossible de publier le message';
      this.submitting = false;
    }
  });

  this.subscriptions.add(submitSub);
}
  /**
   * Soumet un nouveau commentaire
   */
  submitComment(messageId: number | undefined, event: Event): void {
    if (!messageId) return;
    event.stopPropagation();
    
    if (!this.commentForm.valid) {
      return;
    }
    
    const commentText = this.commentForm.get('comment')?.value;
    if (!commentText?.trim()) {
      return;
    }
    
    
    this.submitting = true;
    
    // Désactiver le FormControl pendant la soumission
    this.commentForm.get('comment')?.disable();
    
    const createCommentDTO: CreateCommentDTO = {
      comment: commentText.trim(),
      userId: this.getCurrentUserId(),
      messageId: messageId
    };
    
    const commentSub = this.commentService.createComment(createCommentDTO).subscribe({
      next: (newComment: Comment) => {
        
        // Ajouter le commentaire au cache
        const existingComments = this.commentsCache.get(messageId) || [];
        this.commentsCache.set(messageId, [...existingComments, newComment]);
        
        // Mettre à jour le compteur de commentaires dans le message
        const message = this.messages.find(m => (m.idMessage === messageId || m.id === messageId));
        if (message) {
          if (!message.comments) {
            message.comments = [];
          }
          message.comments.push(newComment);
        }
        
        // Réinitialiser le formulaire
        this.commentForm.reset();
        this.submitting = false;
        
        // Réactiver le FormControl
        this.commentForm.get('comment')?.enable();
        
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.submitting = false;
        
        // Réactiver le FormControl même en cas d'erreur
        this.commentForm.get('comment')?.enable();
        
        this.cdr.detectChanges();
      }
    });
    
    this.subscriptions.add(commentSub);
  }

  /**
   * Like un message
   */
  likeMessage(messageId: number | undefined, event: Event): void {
    if (!messageId) return;
    event.stopPropagation();
    
    const message = this.messages.find(m => (m.idMessage === messageId || m.id === messageId));
    if (!message) return;

    
    // Optimistic UI update
    const originalLikes = message.likes;
    message.likes = message.isLiked ? message.likes - 1 : message.likes + 1;
    message.isLiked = !message.isLiked;
    
    const likeSub = this.messageService.likeMessage(messageId).subscribe({
      next: (newLikesCount: number) => {
        message.likes = newLikesCount;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        // Revert optimistic update
        message.likes = originalLikes;
        message.isLiked = !message.isLiked;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(likeSub);
  }

  /**
   * Supprime un message
   */
  deleteMessage(messageId: number | undefined, event: Event): void {
    if (!messageId) return;
    event.stopPropagation();
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    
    const deleteSub = this.messageService.deleteMessage(messageId).subscribe({
      next: () => {
        
        // Retirer le message de la liste
        this.messages = this.messages.filter(m => (m.idMessage !== messageId && m.id !== messageId));
        
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.error = 'Impossible de supprimer le message';
      }
    });

    this.subscriptions.add(deleteSub);
  }

  /**
   * Bascule l'affichage des commentaires d'un message
   */
  toggleComments(message: any, event: Event): void {
    event.stopPropagation();
    
    if (!message) {
      return;
    }
    
    const messageId = message.idMessage || message.id;
    
    if (!messageId) {
      return;
    }
    
    if (this.expandedMessages.has(messageId)) {
      this.expandedMessages.delete(messageId);
    } else {
      this.expandedMessages.add(messageId);
      this.loadComments(messageId);
    }
    this.cdr.detectChanges();
  }

  /**
   * Charge les commentaires d'un message
   */
  loadComments(messageId: number): void {
    if (!messageId) {
      return;
    }
    
    if (this.commentsCache.has(messageId)) {
      return;
    }

    
    this.loadingComments.add(messageId);
    
    const commentsSub = this.commentService.getCommentsByMessage(messageId).subscribe({
      next: (comments) => {
        this.commentsCache.set(messageId, comments);
        this.loadingComments.delete(messageId);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loadingComments.delete(messageId);
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(commentsSub);
  }

  /**
   * Navigue vers le détail d'un message
   */
  goToMessageDetail(message: any, event: Event): void {
    event.stopPropagation();
    
    if (!message) {
      return;
    }
    
    const messageId = message.idMessage || message.id;
    
    if (!messageId) {
      return;
    }
    
    const clubId = this.clubIdFromRoute;
    if (!clubId) {
      return;
    }
    
    
    this.router.navigate(['/clubs', clubId, 'messages', messageId]);
  }

  /**
   * Formate la date de publication
   */
  formatDate(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'À l\'instant' : `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} j`;
    } else {
      return messageDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Vérifie si le message peut être supprimé par l'utilisateur actuel
   */
  canDeleteMessage(message: ClubMessage): boolean {
    return message.userId === this.getCurrentUserId();
  }

  /**
   * Récupère l'ID de l'utilisateur actuel
   */
  getCurrentUserId(): number {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return user.id || 1;
    }
    return 1;
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    this.messageForm.reset();
    this.cdr.detectChanges();
  }

  /**
   * Compte les commentaires pour un message
   */
  getCommentsCount(messageId: number | undefined): number {
    if (!messageId) return 0;
    const comments = this.commentsCache.get(messageId);
    return comments ? comments.length : 0;
  }

  /**
   * Vérifie si les commentaires sont en cours de chargement
   */
  isLoadingComments(messageId: number | undefined): boolean {
    return messageId ? this.loadingComments.has(messageId) : false;
  }

  /**
   * Vérifie si les commentaires sont affichés
   */
  areCommentsExpanded(messageId: number | undefined): boolean {
    return messageId ? this.expandedMessages.has(messageId) : false;
  }

  /**
   * TrackBy function pour optimiser le rendu des messages
   */
  trackByMessageId(index: number, message: any): number {
    const messageId = message?.idMessage ?? message?.id ?? index;
    return messageId;
}

  /**
   * TrackBy function pour optimiser le rendu des commentaires
   */
  trackByCommentId(index: number, comment: Comment): number {
    return comment.commentId ?? index;
  }

  /**
   * Helper pour obtenir l'ID d'un message de manière sécurisée
   */
  getMessageId(message: any): number {
    const id = message?.idMessage || message?.id;
    if (!id) {
      throw new Error('Message ID is required but not found');
    }
    return id;
  }
}