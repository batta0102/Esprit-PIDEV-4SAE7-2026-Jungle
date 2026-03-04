// Dans BuddySessionService.java, ajoute ces méthodes si elles n'existent pas :

import java.time.LocalDateTime;

public List<BuddySession> getUpcomingSessionsByBuddyPair(Long buddyPairId) {
    System.out.println("🔍 Recherche sessions à venir pour buddyPairId: " + buddyPairId);
    
    try {
        List<BuddySession> sessions = buddySessionRepository.findByBuddyPairIdAndDateAfterOrderByDateAsc(
            buddyPairId, LocalDateTime.now()
        );
        System.out.println("✅ " + sessions.size() + " sessions à venir trouvées");
        return sessions;
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la recherche: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de récupérer les sessions à venir: " + e.getMessage());
    }
}

public List<BuddySession> getHistorySessionsByBuddyPair(Long buddyPairId) {
    System.out.println("🔍 Recherche sessions historiques pour buddyPairId: " + buddyPairId);
    
    try {
        List<BuddySession> sessions = buddySessionRepository.findByBuddyPairIdAndDateBeforeOrderByDateDesc(
            buddyPairId, LocalDateTime.now()
        );
        System.out.println("✅ " + sessions.size() + " sessions historiques trouvées");
        return sessions;
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la recherche: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de récupérer les sessions historiques: " + e.getMessage());
    }
}

public BuddySession createSession(BuddySession session) {
    System.out.println("📝 Création session: " + session);
    
    try {
        BuddySession saved = buddySessionRepository.save(session);
        System.out.println("✅ Session créée avec ID: " + saved.getIdSession());
        return saved;
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la création: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de créer la session: " + e.getMessage());
    }
}

public BuddySession updateSession(Long id, BuddySession session) {
    if (!buddySessionRepository.existsById(id)) {
        throw new RuntimeException("Session non trouvée: " + id);
    }
    
    session.setIdSession(id);
    try {
        BuddySession updated = buddySessionRepository.save(session);
        System.out.println("✅ Session mise à jour: " + updated.getIdSession());
        return updated;
    } catch (Exception e) {
        throw new RuntimeException("Impossible de mettre à jour la session: " + e.getMessage());
    }
}

public void deleteSession(Long id) {
    if (!buddySessionRepository.existsById(id)) {
        throw new RuntimeException("Session non trouvée: " + id);
    }
    
    try {
        buddySessionRepository.deleteById(id);
        System.out.println("✅ Session supprimée: " + id);
    } catch (Exception e) {
        throw new RuntimeException("Impossible de supprimer la session: " + e.getMessage());
    }
}
