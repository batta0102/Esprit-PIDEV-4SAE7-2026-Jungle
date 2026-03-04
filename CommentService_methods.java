// Dans CommentService.java, ajoute ces méthodes si elles n'existent pas :

public Comment create(CreateCommentDTO createCommentDTO) {
    System.out.println("📝 Création commentaire depuis DTO - userId: " + createCommentDTO.getUserId() + ", messageId: " + createCommentDTO.getMessageId());
    
    Comment comment = new Comment();
    comment.setComment(createCommentDTO.getComment().trim());
    comment.setUserId(createCommentDTO.getUserId());
    comment.setMessageId(createCommentDTO.getMessageId());
    comment.setDateCreation(Date.valueOf(LocalDate.now()));
    comment.setLikes(0);
    
    try {
        Comment saved = commentRepository.save(comment);
        System.out.println("✅ Commentaire sauvegardé avec ID: " + saved.getCommentId());
        return saved;
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la sauvegarde du commentaire: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Impossible de sauvegarder le commentaire: " + e.getMessage());
    }
}

public List<Comment> getByMessageId(Long messageId) {
    System.out.println("🔍 Recherche des commentaires pour messageId: " + messageId);
    List<Comment> comments = commentRepository.findByMessageId(messageId);
    System.out.println("✅ " + comments.size() + " commentaires trouvés");
    return comments;
}

public Integer like(Long commentId) {
    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Commentaire non trouvé: " + commentId));
    
    comment.setLikes(comment.getLikes() + 1);
    Comment saved = commentRepository.save(comment);
    return saved.getLikes();
}
