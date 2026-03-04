// Dans ClubMessageService.java, ajoute cette méthode :

public ClubMessage createFromRequest(CreateMessageRequest request) {
    System.out.println("📥 Création message depuis request - userId: " + request.getUserId() + ", clubId: " + request.getClub().getIdClub());

    // Le mapping est maintenant direct grâce au nouveau DTO
    ClubMessage message = new ClubMessage();
    message.setUserId(request.getUserId());
    message.setContenu(request.getContenu().trim());
    message.setClub(request.getClub());
    message.setLikes(0);
    message.setDateEnvoi(Date.valueOf(LocalDate.now()));

    try {
        ClubMessage saved = clubMessageRepository.save(message);
        System.out.println("✅ Message sauvegardé avec ID: " + saved.getIdMessage());
        return saved;
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la sauvegarde: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de sauvegarder le message: " + e.getMessage());
    }
}
