import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ClubMessage, CreateMessageDTO, ForumStats } from '../models/forum.models';

@Injectable({
  providedIn: 'root'
})
export class ClubMessageService {
  private readonly apiUrl = 'http://localhost:9090/api';
  private readonly messagesEndpoint = `${this.apiUrl}/clubMessages`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les messages d'un club
   * Endpoint: GET /api/clubMessages/all/By-Club/{clubId}
   */
  getMessagesByClub(clubId: number): Observable<ClubMessage[]> {
    console.log(`🔍 Chargement des messages du club ${clubId}`);
    
    // CODE PRODUCTION: Utiliser les vraies données du backend
    return this.http.get<ClubMessage[]>(`${this.messagesEndpoint}/all/By-Club/${clubId}`).pipe(
      map((messages: ClubMessage[]) => {
        console.log(`✅ Messages du club ${clubId} reçus:`, messages);
        
        // Transformer les données du backend pour correspondre au format frontend
        return messages.map(message => ({
          idMessage: message.idMessage,
          id: message.idMessage, // Utiliser idMessage comme id principal
          contenu: message.contenu,
          dateEnvoi: new Date(message.dateEnvoi),
          userId: message.userId,
          user: {
            id: message.userId,
            nom: `User ${message.userId}`, // Backend n'envoie pas les infos user
            email: `user${message.userId}@example.com`,
            avatar: '👤'
          },
          clubId: clubId,
          likes: message.likes || 0,
          isLiked: false,
          isPinned: false
        }));
      }),
      catchError((error: any) => {
        console.error(`❌ Erreur lors du chargement des messages du club ${clubId}:`, error);
        console.error('❌ Détails de l\'erreur:', error.message, error.status);
        
        // Si erreur 400, utiliser les données mock
        if (error.status === 400) {
          console.log('🔄 Erreur 400 détectée, utilisation des données mock');
          return of(this.createMockMessages(clubId));
        }
        
        return throwError(() => error);
      })
    );
    
    // CODE DÉVELOPPEMENT (gardé comme fallback)
    /*
    console.log('🔄 MODE DÉVELOPPEMENT: Utilisation des données mock pour les messages du club');
    return of(this.createMockMessages(clubId));
    */
  }

  /**
   * Récupère un message par son ID
   * Endpoint: GET /api/clubMessages/{id}
   */
  getMessageById(messageId: number): Observable<ClubMessage> {
    console.log(`🔍 Chargement du message ${messageId}`);
    
    return this.http.get<ClubMessage>(`${this.messagesEndpoint}/${messageId}`).pipe(
      map((message: ClubMessage) => {
        console.log(`✅ Message ${messageId} reçu:`, message);
        return {
          ...message,
          idMessage: message.idMessage || message.id,
          id: message.id || message.idMessage,
          dateEnvoi: new Date(message.dateEnvoi),
          isLiked: false,
          isPinned: false
        };
      }),
      catchError((error: any) => {
        console.error(`❌ Erreur lors du chargement du message ${messageId}:`, error);
        return throwError(() => new Error(`Impossible de charger le message ${messageId}`));
      })
    );
  }

  /**
   * Crée un nouveau message
   * Endpoint: POST /api/clubMessages
   */
  createMessage(message: CreateMessageDTO): Observable<ClubMessage> {
    console.log('📝 SERVICE REÇOIT:', message);  // ← Doit afficher {contenu: "...", clubId: 1, userId: 1}
    
    // Transformer clubId en club.idClub pour le backend
    const backendMessage = {
      contenu: message.contenu,
      userId: message.userId,
      club: {
        idClub: message.clubId  // ← message.clubId existe maintenant !
      }
    };
    
    console.log('📤 ENVOI AU BACKEND:', backendMessage);  // ← Doit afficher {contenu: "...", userId: 1, club: {idClub: 1}}
    
    return this.http.post<ClubMessage>(this.messagesEndpoint, backendMessage).pipe(
      // ... reste du code
    );
}

  /**
   * Like un message
   * Endpoint: PUT /api/clubMessages/like/{id}
   */
  likeMessage(messageId: number): Observable<number> {
    console.log(`❤️ Like du message ${messageId}`);
    
    return this.http.put<number>(`${this.messagesEndpoint}/like/${messageId}`, {}).pipe(
      map((likesCount: number) => {
        console.log(`✅ Like enregistré - nouveau total: ${likesCount}`);
        return likesCount;
      }),
      catchError((error: any) => {
        console.error(`❌ Erreur lors du like du message ${messageId}:`, error);
        return of(0); // Retourner 0 en cas d'erreur
      })
    );
  }

  /**
   * Supprime un message
   * Endpoint: DELETE /api/clubMessages/{id}
   */
  deleteMessage(messageId: number): Observable<void> {
    console.log(`🗑️ Suppression du message ${messageId}`);
    
    return this.http.delete<void>(`${this.messagesEndpoint}/${messageId}`).pipe(
      tap(() => {
        console.log(`✅ Message ${messageId} supprimé avec succès`);
      }),
      catchError((error: any) => {
        console.error(`❌ Erreur lors de la suppression du message ${messageId}:`, error);
        return throwError(() => new Error('Impossible de supprimer le message'));
      })
    );
  }

  /**
   * Récupère les statistiques du forum d'un club
   * Endpoint: GET /api/clubMessages/stats/{clubId}
   */
  getForumStats(clubId: number): Observable<ForumStats> {
    console.log(`📊 Chargement des statistiques du forum ${clubId}`);
    
    return this.http.get<ForumStats>(`${this.messagesEndpoint}/stats/${clubId}`).pipe(
      map((stats: ForumStats) => {
        console.log(`✅ Statistiques du forum ${clubId} reçues:`, stats);
        return stats;
      }),
      catchError((error: any) => {
        console.error(`❌ Erreur lors du chargement des statistiques du forum ${clubId}:`, error);
        return throwError(() => new Error(`Impossible de charger les statistiques du forum ${clubId}`));
      })
    );
  }

  /**
   * Crée des messages mock pour le développement
   */
  private createMockMessages(clubId: number): ClubMessage[] {
    const messages: ClubMessage[] = [];
    const now = new Date();

    // Créer plusieurs messages mock
    const mockContents = [
      "Bonjour tout le monde ! Je suis ravi de rejoindre ce club d'anglais. J'espère qu'on va bien progresser ensemble !",
      "Hello everyone! I'm excited to be part of this English club. Does anyone have tips for improving pronunciation?",
      "Salut ! J'ai du mal avec les temps verbaux. Quelqu'un peut m'aider avec les règles du present perfect?",
      "Hi! I found this great resource for learning vocabulary. Check it out: [link]",
      "Hello! I'm organizing a practice session next week. Who's interested?",
      "Salut les amis ! J'ai passé mon TOEIC hier, je vous raconte tout !",
      "Hi everyone! What are your favorite English podcasts or YouTube channels?",
      "Bonjour ! Je cherche un buddy pour pratiquer les conversations. Qui est intéressé?"
    ];

    const mockUsers = [
      { id: 1, nom: 'Alice Martin', email: 'alice@example.com', avatar: '👩‍🎓' },
      { id: 2, nom: 'Bob Johnson', email: 'bob@example.com', avatar: '👨‍💼' },
      { id: 3, nom: 'Claire Dubois', email: 'claire@example.com', avatar: '👩‍🏫' },
      { id: 4, nom: 'David Wilson', email: 'david@example.com', avatar: '👨‍🎓' },
      { id: 5, nom: 'Emma Garcia', email: 'emma@example.com', avatar: '👩‍💻' }
    ];

    for (let i = 0; i < 10; i++) {
      const user = mockUsers[i % mockUsers.length];
      const dateEnvoi = new Date(now);
      dateEnvoi.setHours(dateEnvoi.getHours() - i * 2); // Messages espacés de 2h

      messages.push({
        idMessage: 100 + i,
        id: 100 + i,
        contenu: mockContents[i % mockContents.length],
        dateEnvoi: dateEnvoi,
        userId: user.id,
        user: user,
        clubId: clubId,
        likes: Math.floor(Math.random() * 15),
        isLiked: false,
        isPinned: false
      });
    }

    return messages;
  }
}