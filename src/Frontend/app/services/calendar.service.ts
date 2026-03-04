import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Disponibilite, EvenementCalendrier } from '../models/calendar.models';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:9090/api/calendrier';

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les disponibilités d'un buddy pair
   * @param buddyPairId ID du buddy pair
   */
  getDisponibilites(buddyPairId: number): Observable<Disponibilite[]> {
    console.log(`📅 Chargement des disponibilités du buddy pair ${buddyPairId}`);
    return this.http.get<Disponibilite[]>(`${this.apiUrl}/disponibilites/${buddyPairId}`).pipe(
      tap(dispos => console.log(`✅ Disponibilités reçues:`, dispos)),
      catchError((error: any) => {
        console.error(`❌ Erreur lors du chargement des disponibilités:`, error);
        console.log('🔄 Utilisation des données mock pour les disponibilités');
        return of(this.createMockDisponibilites(buddyPairId));
      })
    );
  }

  /**
   * Ajoute une nouvelle disponibilité
   * @param buddyPairId ID du buddy pair
   * @param userId ID de l'utilisateur
   * @param debut Date et heure de début
   * @param fin Date et heure de fin
   */
  ajouterDisponibilite(
    buddyPairId: number,
    userId: number,
    debut: Date,
    fin: Date
  ): Observable<Disponibilite> {
    const params = `?userId=${userId}&debut=${debut.toISOString()}&fin=${fin.toISOString()}`;
    console.log(`📅 Ajout d'une disponibilité pour le buddy pair ${buddyPairId}`);
    return this.http.post<Disponibilite>(
      `${this.apiUrl}/disponibilites/${buddyPairId}${params}`,
      {}
    ).pipe(
      tap(dispo => console.log(`✅ Disponibilité ajoutée:`, dispo)),
      catchError((error: any) => {
        console.error(`❌ Erreur lors de l'ajout de la disponibilité:`, error);
        // Ne plus utiliser de simulation - laisser l'erreur se propager
        throw error;
      })
    );
  }

  /**
   * Supprime une disponibilité
   * @param disponibiliteId ID de la disponibilité
   */
  supprimerDisponibilite(disponibiliteId: number): Observable<void> {
    console.log(`📅 Suppression de la disponibilité ${disponibiliteId}`);
    return this.http.delete<void>(`${this.apiUrl}/disponibilites/${disponibiliteId}`).pipe(
      tap(() => console.log(`✅ Disponibilité supprimée`)),
      catchError((error: any) => {
        console.error(`❌ Erreur lors de la suppression de la disponibilité:`, error);
        console.log('🔄 Simulation de la suppression de disponibilité');
        return of(void 0);
      })
    );
  }

  /**
   * Récupère des suggestions de créneaux pour une session
   * @param buddyPairId ID du buddy pair
   * @param dureeMinutes Durée souhaitée en minutes
   */
  getSuggestions(buddyPairId: number, dureeMinutes: number): Observable<Date[]> {
    console.log(`📅 Génération de suggestions pour ${dureeMinutes} minutes`);
    return this.http.get<Date[]>(
      `${this.apiUrl}/suggestions/${buddyPairId}?dureeMinutes=${dureeMinutes}`
    ).pipe(
      tap(suggestions => console.log(`✅ Suggestions reçues:`, suggestions)),
      catchError((error: any) => {
        console.error(`❌ Erreur lors de la génération des suggestions:`, error);
        console.log('🔄 Utilisation de suggestions mock');
        return of(this.createMockSuggestions(dureeMinutes));
      })
    );
  }

  /**
   * Récupère les rappels à afficher
   */
  getRappels(): Observable<EvenementCalendrier[]> {
    console.log('📅 Récupération des rappels');
    return this.http.get<EvenementCalendrier[]>(`${this.apiUrl}/rappels`).pipe(
      tap(rappels => console.log(`✅ Rappels reçus:`, rappels)),
      catchError((error: any) => {
        console.error(`❌ Erreur lors de la récupération des rappels:`, error);
        console.log('🔄 Utilisation de rappels mock');
        return of(this.createMockRappels());
      })
    );
  }

  /**
   * Marque un rappel comme envoyé
   * @param evenementId ID de l'événement
   */
  marquerRappelEnvoye(evenementId: number): Observable<void> {
    console.log(`📅 Marquage du rappel ${evenementId} comme envoyé`);
    return this.http.post<void>(`${this.apiUrl}/rappels/${evenementId}/envoyer`, {}).pipe(
      tap(() => console.log(`✅ Rappel marqué comme envoyé`)),
      catchError((error: any) => {
        console.error(`❌ Erreur lors du marquage du rappel:`, error);
        console.log('🔄 Simulation du marquage du rappel');
        return of(void 0);
      })
    );
  }

  /**
   * Crée des disponibilités mock pour le développement
   */
  private createMockDisponibilites(buddyPairId: number): Disponibilite[] {
    const disponibilites: Disponibilite[] = [];
    const now = new Date();

    // Créer quelques disponibilités pour les prochains jours
    for (let i = 1; i <= 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Disponibilité de 14h à 16h pour l'utilisateur 1
      const debut1 = new Date(date);
      debut1.setHours(14, 0, 0, 0);
      const fin1 = new Date(date);
      fin1.setHours(16, 0, 0, 0);

      disponibilites.push({
        id: i * 10 + 1,
        buddyPairId: buddyPairId,
        debut: debut1,
        fin: fin1,
        recurrent: false,
        userId: 1
      });

      // Disponibilité de 10h à 12h pour l'utilisateur 2
      const debut2 = new Date(date);
      debut2.setHours(10, 0, 0, 0);
      const fin2 = new Date(date);
      fin2.setHours(12, 0, 0, 0);

      disponibilites.push({
        id: i * 10 + 2,
        buddyPairId: buddyPairId,
        debut: debut2,
        fin: fin2,
        recurrent: false,
        userId: 2
      });
    }

    return disponibilites;
  }

  /**
   * Crée une disponibilité mock
   */
  private createMockDisponibilite(buddyPairId: number, userId: number, debut: Date, fin: Date): Disponibilite {
    return {
      id: Math.floor(Math.random() * 1000),
      buddyPairId: buddyPairId,
      debut: debut,
      fin: fin,
      recurrent: false,
      userId: userId
    };
  }

  /**
   * Crée des suggestions mock
   */
  private createMockSuggestions(dureeMinutes: number): Date[] {
    const suggestions: Date[] = [];
    const now = new Date();

    // Générer 3 suggestions dans les prochains jours
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      date.setHours(14, 0, 0, 0); // 14h

      suggestions.push(date);
    }

    return suggestions;
  }

  /**
   * Crée des rappels mock
   */
  private createMockRappels(): EvenementCalendrier[] {
    const rappels: EvenementCalendrier[] = [];
    const now = new Date();

    // Rappel pour demain à 15h
    const demain = new Date(now);
    demain.setDate(demain.getDate() + 1);
    demain.setHours(15, 0, 0, 0);

    rappels.push({
      id: 1,
      buddyPairId: 1,
      titre: 'Session demain',
      description: 'Rappel: Session de conversation prévue demain à 15h',
      dateDebut: demain,
      dateFin: new Date(demain.getTime() + 60 * 60 * 1000), // 1h après
      type: 'RAPPEL' as any,
      rappelEnvoye: false
    });

    return rappels;
  }
}
