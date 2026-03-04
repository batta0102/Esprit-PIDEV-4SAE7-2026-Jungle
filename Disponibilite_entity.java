package tn.esprit.jungledraft.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Disponibilite {
    private Long id;
    private Long buddyPairId;
    private Long userId;
    private LocalDateTime debut;
    private LocalDateTime fin;
    
    // Constructeur par défaut requis par JPA
    public Disponibilite() {
    }
    
    // Constructeur avec paramètres
    public Disponibilite(Long buddyPairId, Long userId, LocalDateTime debut, LocalDateTime fin) {
        this.buddyPairId = buddyPairId;
        this.userId = userId;
        this.debut = debut;
        this.fin = fin;
    }
}
