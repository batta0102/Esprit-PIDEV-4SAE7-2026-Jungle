// Dans CalendarService.java, ajoute ces méthodes si elles n'existent pas :

public Disponibilite ajouterDisponibilite(Long buddyPairId, Long userId, LocalDateTime debut, LocalDateTime fin) {
    System.out.println("📅 Création disponibilité - buddyPairId: " + buddyPairId + ", userId: " + userId);
    System.out.println("📅 Période: " + debut + " -> " + fin);
    
    // Validation
    if (debut.isAfter(fin)) {
        throw new IllegalArgumentException("La date de début doit être avant la date de fin");
    }
    
    Disponibilite disponibilite = new Disponibilite();
    disponibilite.setBuddyPairId(buddyPairId);
    disponibilite.setUserId(userId);
    disponibilite.setDebut(debut);
    disponibilite.setFin(fin);
    
    try {
        Disponibilite saved = disponibiliteRepository.save(disponibilite);
        System.out.println("✅ Disponibilité sauvegardée avec ID: " + saved.getId());
        return saved;
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la sauvegarde: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de sauvegarder la disponibilité: " + e.getMessage());
    }
}

public List<Disponibilite> getDisponibilitesByBuddyPair(Long buddyPairId) {
    System.out.println("📅 Recherche disponibilités pour buddyPairId: " + buddyPairId);
    
    try {
        List<Disponibilite> disponibilites = disponibiliteRepository.findByBuddyPairId(buddyPairId);
        System.out.println("✅ " + disponibilites.size() + " disponibilités trouvées");
        return disponibilites;
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la recherche: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de récupérer les disponibilités: " + e.getMessage());
    }
}

public void supprimerDisponibilite(Long id) {
    System.out.println("🗑️ Suppression disponibilité ID: " + id);
    
    if (!disponibiliteRepository.existsById(id)) {
        throw new RuntimeException("Disponibilité non trouvée: " + id);
    }
    
    try {
        disponibiliteRepository.deleteById(id);
        System.out.println("✅ Disponibilité supprimée");
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la suppression: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de supprimer la disponibilité: " + e.getMessage());
    }
}
