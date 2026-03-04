const express = require('express');
const cors = require('cors');

const app = express();
const port = 9090;

// Middleware
app.use(cors());
app.use(express.json());

// Stockage en mémoire pour les buddy pairs
let buddyPairs = [
  {
    idPair: 1,
    userID_1: 1,
    userID_2: 2,
    clubId: 1,
    status: 'EN_ATTENTE',
    dateCreation: new Date().toISOString(),
    user1: {
      id: 1,
      prenom: 'John',
      nom: 'Doe',
      email: 'john.doe@example.com',
      avatar: '👨‍💻'
    },
    user2: {
      id: 2,
      prenom: 'Jane',
      nom: 'Smith',
      email: 'jane.smith@example.com',
      avatar: '👩‍💻'
    },
    club: {
      idClub: 1,
      nom: 'Club de Programmation'
    }
  },
  {
    idPair: 2,
    userID_1: 1,
    userID_2: 3,
    clubId: 1,
    status: 'ACTIF',
    dateCreation: new Date().toISOString(),
    user1: {
      id: 1,
      prenom: 'John',
      nom: 'Doe',
      email: 'john.doe@example.com',
      avatar: '👨‍💻'
    },
    user2: {
      id: 3,
      prenom: 'Bob',
      nom: 'Wilson',
      email: 'bob.wilson@example.com',
      avatar: '🧑‍💻'
    },
    club: {
      idClub: 1,
      nom: 'Club de Programmation'
    }
  },
  {
    idPair: 3,
    userID_1: 1,
    userID_2: 4,
    clubId: 2,
    status: 'ACTIF',
    dateCreation: new Date().toISOString(),
    user1: {
      id: 1,
      prenom: 'John',
      nom: 'Doe',
      email: 'john.doe@example.com',
      avatar: '👨‍💻'
    },
    user2: {
      id: 4,
      prenom: 'Alice',
      nom: 'Johnson',
      email: 'alice.johnson@example.com',
      avatar: '👩‍🎓'
    },
    club: {
      idClub: 2,
      nom: 'Club d\'Anglais'
    }
  }
];

// Stockage en mémoire pour les clubs
let clubs = [
  {
    idClub: 1,
    nom: 'Club de Programmation',
    description: 'Apprenez à programmer dans différents langages',
    niveau: 'Débutant',
    capacityMax: 30,
    clubOwner: 1,
    dateCreation: new Date().toISOString(),
    status: 'ACTIF'
  },
  {
    idClub: 2,
    nom: 'Club d\'Anglais',
    description: 'Pratiquez l\'anglais avec d\'autres membres',
    niveau: 'Intermédiaire',
    capacityMax: 25,
    clubOwner: 2,
    dateCreation: new Date().toISOString(),
    status: 'ACTIF'
  },
  {
    idClub: 3,
    nom: 'Club de Mathématiques',
    description: 'Approfondissez vos connaissances en maths',
    niveau: 'Avancé',
    capacityMax: 20,
    clubOwner: 3,
    dateCreation: new Date().toISOString(),
    status: 'ACTIF'
  }
];

// Stockage en mémoire pour les messages du forum (clubMessages)
let clubMessages = [
  {
    id: 1,
    contenu: 'Bienvenue dans le forum du club!',
    clubId: 1,
    userId: 1,
    dateEnvoi: new Date().toISOString(),
    likes: 5,
    isLiked: false,
    isPinned: false,
    user: {
      id: 1,
      nom: 'John Doe',
      avatar: '👨‍💻'
    }
  },
  {
    id: 2,
    contenu: 'Super club! Je suis impatient de commencer.',
    clubId: 1,
    userId: 2,
    dateEnvoi: new Date().toISOString(),
    likes: 3,
    isLiked: false,
    isPinned: false,
    user: {
      id: 2,
      nom: 'Jane Smith',
      avatar: '👩‍💻'
    }
  }
];

let nextClubMessageId = 3;

// GET /api/clubMessages - Récupérer les messages d'un club
app.get('/api/clubMessages', (req, res) => {
  const clubId = parseInt(req.query.clubId);
  console.log(`📥 GET /api/clubMessages?clubId=${clubId} - Messages du club`);
  
  if (!clubId) {
    return res.status(400).json({ error: 'clubId requis' });
  }
  
  const clubMessagesFiltered = clubMessages.filter(msg => msg.clubId === clubId);
  res.json(clubMessagesFiltered);
});

// POST /api/clubMessages - Créer un nouveau message
app.post('/api/clubMessages', (req, res) => {
  console.log('📤 POST /api/clubMessages - Création d\'un nouveau message:', req.body);
  
  const { contenu, clubId, userId } = req.body;
  
  if (!contenu || !clubId || !userId) {
    return res.status(400).json({ error: 'contenu, clubId et userId requis' });
  }
  
  const newMessage = {
    id: nextClubMessageId++,
    contenu: contenu.trim(),
    clubId: parseInt(clubId),
    userId: parseInt(userId),
    dateEnvoi: new Date().toISOString(),
    likes: 0,
    isLiked: false,
    isPinned: false,
    user: {
      id: parseInt(userId),
      nom: `User ${userId}`,
      avatar: '👤'
    }
  };
  
  clubMessages.push(newMessage);
  res.status(201).json(newMessage);
});

// POST /api/clubMessages/:id/like - Ajouter un like à un message
app.post('/api/clubMessages/:id/like', (req, res) => {
  const messageId = parseInt(req.params.id);
  console.log(`📤 POST /api/clubMessages/${messageId}/like - Like du message`);
  
  const message = clubMessages.find(msg => msg.id === messageId);
  if (!message) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }
  
  message.likes++;
  res.json(message.likes);
});

// DELETE /api/clubMessages/:id - Supprimer un message
app.delete('/api/clubMessages/:id', (req, res) => {
  const messageId = parseInt(req.params.id);
  console.log(`🗑️ DELETE /api/clubMessages/${messageId} - Suppression du message`);
  
  const index = clubMessages.findIndex(msg => msg.id === messageId);
  if (index === -1) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }
  
  clubMessages.splice(index, 1);
  res.status(204).send();
});

// PUT /api/clubMessages/:id - Mettre à jour un message
app.put('/api/clubMessages/:id', (req, res) => {
  const messageId = parseInt(req.params.id);
  console.log(`📤 PUT /api/clubMessages/${messageId} - Mise à jour du message:`, req.body);
  
  const message = clubMessages.find(msg => msg.id === messageId);
  if (!message) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }
  
  const { content } = req.body;
  if (content) {
    message.contenu = content;
  }
  
  res.json(message);
});

// POST /api/clubMessages/:id/pin - Épingler un message
app.post('/api/clubMessages/:id/pin', (req, res) => {
  const messageId = parseInt(req.params.id);
  console.log(`📌 POST /api/clubMessages/${messageId}/pin - Épinglage du message`);
  
  const message = clubMessages.find(msg => msg.id === messageId);
  if (!message) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }
  
  message.isPinned = true;
  res.json(message);
});

// POST /api/clubMessages/:id/unpin - Désépingler un message
app.post('/api/clubMessages/:id/unpin', (req, res) => {
  const messageId = parseInt(req.params.id);
  console.log(`📍 POST /api/clubMessages/${messageId}/unpin - Désépinglage du message`);
  
  const message = clubMessages.find(msg => msg.id === messageId);
  if (!message) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }
  
  message.isPinned = false;
  res.json(message);
});

// GET /api/clubMessages/stats/:clubId - Statistiques du forum
app.get('/api/clubMessages/stats/:clubId', (req, res) => {
  const clubId = parseInt(req.params.clubId);
  console.log(`📊 GET /api/clubMessages/stats/${clubId} - Statistiques du forum`);
  
  const stats = {
    totalMessages: clubMessages.filter(msg => msg.clubId === clubId).length,
    totalComments: 0,
    totalLikes: clubMessages.filter(msg => msg.clubId === clubId).reduce((sum, msg) => sum + msg.likes, 0),
    activeUsers: new Set(clubMessages.filter(msg => msg.clubId === clubId).map(msg => msg.userId)).size,
    messagesThisWeek: clubMessages.filter(msg => msg.clubId === clubId).length,
    topContributors: []
  };
  
  res.json(stats);
});

// Stockage en mémoire pour les adhésions (memberships)
let memberships = [
  {
    idInscription: 1,
    dateInscription: new Date().toISOString(),
    status: 'VALIDEE',
    userId: 1,
    club: {
      idClub: 1,
      nom: 'Club de Programmation'
    }
  },
  {
    idInscription: 2,
    dateInscription: new Date().toISOString(),
    status: 'EN_ATTENTE',
    userId: 2,
    club: {
      idClub: 2,
      nom: 'Club d\'Anglais'
    }
  }
];

let nextMembershipId = 3;

// GET /api/memberships - Récupérer toutes les adhésions
app.get('/api/memberships', (req, res) => {
  console.log('📥 GET /api/memberships - Retourne toutes les adhésions');
  res.json(memberships);
});

// POST /api/memberships - Créer une nouvelle adhésion
app.post('/api/memberships', (req, res) => {
  console.log('📤 POST /api/memberships - Création d\'une nouvelle adhésion:', req.body);
  
  const { userId, club } = req.body;
  
  if (!userId || !club || !club.idClub) {
    return res.status(400).json({ error: 'userId et club.idClub requis' });
  }
  
  // Vérifier si l'utilisateur est déjà membre de ce club
  const existingMembership = memberships.find(m => 
    m.userId === userId && m.club.idClub === club.idClub
  );
  
  if (existingMembership) {
    return res.status(400).json({ error: 'L\'utilisateur est déjà membre de ce club' });
  }
  
  const newMembership = {
    idInscription: nextMembershipId++,
    dateInscription: new Date().toISOString(),
    status: 'EN_ATTENTE',
    userId: parseInt(userId),
    club: {
      idClub: parseInt(club.idClub),
      nom: clubs.find(c => c.idClub === parseInt(club.idClub))?.nom || 'Club inconnu'
    }
  };
  
  memberships.push(newMembership);
  res.status(201).json(newMembership);
});

// PUT /api/memberships/:id - Mettre à jour le statut d'une adhésion
app.put('/api/memberships/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📤 PUT /api/memberships/${id} - Mise à jour du statut:`, req.body);
  
  const membership = memberships.find(m => m.idInscription === id);
  if (!membership) {
    return res.status(404).json({ error: 'Adhésion non trouvée' });
  }
  
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status requis' });
  }
  
  membership.status = status;
  res.json(membership);
});

// GET /api/clubs - Récupérer tous les clubs
app.get('/api/clubs', (req, res) => {
  console.log('📥 GET /api/clubs - Retourne tous les clubs');
  res.json(clubs);
});

// GET /api/buddyPairs - Récupérer tous les buddy pairs
app.get('/api/buddyPairs', (req, res) => {
  console.log('📥 GET /api/buddyPairs - Retourne tous les buddy pairs');
  res.json(buddyPairs);
});

// POST /api/buddyPairs - Créer un nouveau buddy pair
app.post('/api/buddyPairs', (req, res) => {
  console.log('📤 POST /api/buddyPairs - Création d\'un nouveau buddy pair:', req.body);
  
  const { userId1, userId2, clubId } = req.body;
  
  if (!userId1 || !userId2 || !clubId) {
    return res.status(400).json({ 
      error: 'Champs requis manquants',
      message: 'userId1, userId2 et clubId sont obligatoires'
    });
  }
  
  const newBuddyPair = {
    idPair: buddyPairs.length + 1,
    userID_1: userId1,
    userID_2: userId2,
    clubId: clubId,
    status: 'EN_ATTENTE',
    dateCreation: new Date().toISOString()
  };
  
  buddyPairs.push(newBuddyPair);
  
  console.log('✅ Buddy pair créé avec succès:', newBuddyPair);
  res.status(201).json(newBuddyPair);
});

// GET /api/buddyPairs/user/:userId - Récupérer les buddy pairs d'un utilisateur
app.get('/api/buddyPairs/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log(`📥 GET /api/buddyPairs/user/${userId} - Buddy pairs de l'utilisateur`);
  
  const userBuddyPairs = buddyPairs.filter(bp => 
    bp.userID_1 === userId || bp.userID_2 === userId
  );
  
  res.json(userBuddyPairs);
});

// GET /api/buddyPairs/club/:clubId - Récupérer les buddy pairs d'un club
app.get('/api/buddyPairs/club/:clubId', (req, res) => {
  const clubId = parseInt(req.params.clubId);
  console.log(`📥 GET /api/buddyPairs/club/${clubId} - Buddy pairs du club`);
  
  const clubBuddyPairs = buddyPairs.filter(bp => bp.clubId === clubId);
  
  res.json(clubBuddyPairs);
});

// PUT /api/buddyPairs/:id/accept - Accepter un buddy pair
app.put('/api/buddyPairs/:id/accept', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`✅ PUT /api/buddyPairs/${id}/accept - Acceptation du buddy pair`);
  
  const buddyPair = buddyPairs.find(bp => bp.idPair === id);
  if (!buddyPair) {
    return res.status(404).json({ error: 'Buddy pair non trouvé' });
  }
  
  buddyPair.status = 'ACTIF';
  res.json({ message: 'Buddy pair accepté avec succès' });
});

// PUT /api/buddyPairs/:id/reject - Refuser un buddy pair
app.put('/api/buddyPairs/:id/reject', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`❌ PUT /api/buddyPairs/${id}/reject - Refus du buddy pair`);
  
  const buddyPair = buddyPairs.find(bp => bp.idPair === id);
  if (!buddyPair) {
    return res.status(404).json({ error: 'Buddy pair non trouvé' });
  }
  
  buddyPair.status = 'ANNULE';
  res.json({ message: 'Buddy pair refusé avec succès' });
});

// DELETE /api/buddyPairs/:id - Supprimer un buddy pair
app.delete('/api/buddyPairs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🗑️ DELETE /api/buddyPairs/${id} - Suppression du buddy pair`);
  
  const index = buddyPairs.findIndex(bp => bp.idPair === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Buddy pair non trouvé' });
  }
  
  buddyPairs.splice(index, 1);
  res.json({ message: 'Buddy pair supprimé avec succès' });
});

// GET /api/clubs/:id - Récupérer un club spécifique
app.get('/api/clubs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📥 GET /api/clubs/${id} - Club spécifique`);
  
  const club = clubs.find(c => c.idClub === id);
  if (!club) {
    return res.status(404).json({ error: 'Club non trouvé' });
  }
  
  res.json(club);
});

// PUT /api/clubs/:id - Mettre à jour un club
app.put('/api/clubs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📤 PUT /api/clubs/${id} - Mise à jour du club:`, req.body);
  
  const clubIndex = clubs.findIndex(c => c.idClub === id);
  if (clubIndex === -1) {
    return res.status(404).json({ error: 'Club non trouvé' });
  }
  
  const { nom, description, niveau, capacityMax, status } = req.body;
  
  // Mettre à jour les champs du club
  if (nom) clubs[clubIndex].nom = nom;
  if (description) clubs[clubIndex].description = description;
  if (niveau) clubs[clubIndex].niveau = niveau;
  if (capacityMax !== undefined) clubs[clubIndex].capacityMax = capacityMax;
  if (status) clubs[clubIndex].status = status;
  
  console.log(`✅ Club ${id} mis à jour avec succès:`, clubs[clubIndex]);
  res.json(clubs[clubIndex]);
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Mock Buddy Backend démarré sur http://localhost:${port}`);
  console.log('📋 Endpoints disponibles:');
  console.log('  GET    /api/clubs');
  console.log('  GET    /api/clubs/:id');
  console.log('  GET    /api/clubMessages');
  console.log('  POST   /api/clubMessages');
  console.log('  POST   /api/clubMessages/:id/like');
  console.log('  DELETE /api/clubMessages/:id');
  console.log('  PUT    /api/clubMessages/:id');
  console.log('  POST   /api/clubMessages/:id/pin');
  console.log('  POST   /api/clubMessages/:id/unpin');
  console.log('  GET    /api/clubMessages/stats/:clubId');
  console.log('  GET    /api/memberships');
  console.log('  POST   /api/memberships');
  console.log('  PUT    /api/memberships/:id');
  console.log('  GET    /api/buddyPairs');
  console.log('  POST   /api/buddyPairs');
  console.log('  GET    /api/buddyPairs/user/:userId');
  console.log('  GET    /api/buddyPairs/club/:clubId');
  console.log('  PUT    /api/buddyPairs/:id/accept');
  console.log('  PUT    /api/buddyPairs/:id/reject');
  console.log('  DELETE /api/buddyPairs/:id');
});
