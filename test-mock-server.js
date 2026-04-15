/**
 * Mock Server for Integration Testing
 * Provides mock responses for API endpoints during tests
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8085;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mock data
const mockClubs = [
  {
    idClub: 1,
    nom: 'Test Club',
    description: 'Test Description',
    niveau: 'A1',
    capacityMax: 50,
    status: 'ACTIVE',
    clubOwner: 1,
    dateCreation: new Date().toISOString(),
    adresse: '123 Test St',
    ville: 'Test City',
    pays: 'Test Country',
    telephone: '123-456-7890',
    email: 'test@test.com',
    siteWeb: 'https://test.com',
    actif: true
  },
  {
    idClub: 2,
    nom: 'Test Club 2',
    description: 'Test Description 2',
    niveau: 'A2',
    capacityMax: 30,
    status: 'ACTIVE',
    clubOwner: 1,
    dateCreation: new Date().toISOString(),
    adresse: '456 Test St',
    ville: 'Test City 2',
    pays: 'Test Country 2',
    telephone: '098-765-4321',
    email: 'test2@test.com',
    siteWeb: 'https://test2.com',
    actif: true
  }
];

// API Routes
app.get('/api/clubs', (req, res) => {
  console.log('🏢 Mock API: GET /api/clubs');
  res.json(mockClubs);
});

app.get('/api/clubs/:id', (req, res) => {
  const clubId = parseInt(req.params.id);
  console.log(`🏢 Mock API: GET /api/clubs/${clubId}`);
  
  const club = mockClubs.find(c => c.idClub === clubId);
  if (club) {
    res.json(club);
  } else {
    res.status(404).json({ error: 'Club non trouvé.' });
  }
});

app.post('/api/clubs', (req, res) => {
  console.log('🏢 Mock API: POST /api/clubs');
  const newClub = req.body;
  const createdClub = {
    idClub: mockClubs.length + 1,
    ...newClub,
    dateCreation: new Date().toISOString()
  };
  res.status(201).json(createdClub);
});

app.put('/api/clubs/:id', (req, res) => {
  const clubId = parseInt(req.params.id);
  console.log(`🏢 Mock API: PUT /api/clubs/${clubId}`);
  
  const clubIndex = mockClubs.findIndex(c => c.idClub === clubId);
  if (clubIndex !== -1) {
    mockClubs[clubIndex] = { ...mockClubs[clubIndex], ...req.body, dateModification: new Date().toISOString() };
    res.json(mockClubs[clubIndex]);
  } else {
    res.status(404).json({ error: 'Club non trouvé.' });
  }
});

app.delete('/api/clubs/:id', (req, res) => {
  const clubId = parseInt(req.params.id);
  console.log(`🏢 Mock API: DELETE /api/clubs/${clubId}`);
  
  const clubIndex = mockClubs.findIndex(c => c.idClub === clubId);
  if (clubIndex !== -1) {
    mockClubs.splice(clubIndex, 1);
    res.json({ success: true, message: `Club ${clubId} supprimé avec succès` });
  } else {
    res.status(404).json({ error: 'Club non trouvé.' });
  }
});

// OCR Service Mock Endpoints
app.post('/api/vision/ocr', (req, res) => {
  console.log('🔍 Mock OCR API: POST /api/vision/ocr');
  res.status(500).json({ error: 'Server Error', message: 'Erreur serveur. Veuillez réessayer plus tard.' });
});

app.post('/api/vision/ocr/traduire', (req, res) => {
  console.log('🔍 Mock OCR Translation API: POST /api/vision/ocr/traduire');
  res.json({
    texteOriginal: 'Hello World',
    traduction: 'Bonjour le monde',
    langueSource: 'en'
  });
});

// Club Messages Mock Endpoints
app.get('/api/clubMessages', (req, res) => {
  console.log('🔍 Mock API: GET /api/clubMessages');
  res.json([]);
});

app.post('/api/clubMessages', (req, res) => {
  console.log('🔍 Mock API: POST /api/clubMessages');
  const message = {
    id: 1,
    contenu: req.body.contenu,
    idClub: req.body.idClub,
    idUser: req.body.idUser,
    dateEnvoi: new Date().toISOString()
  };
  res.status(201).json(message);
});

// Error simulation endpoints
app.get('/api/clubs/search', (req, res) => {
  console.log('🔍 Mock API: GET /api/clubs/search');
  res.status(503).json({ error: 'Service indisponible. API Gateway en maintenance.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Mock server running on http://localhost:${PORT}`);
    console.log('📝 Available endpoints:');
    console.log('   GET /api/clubs - Get all clubs');
    console.log('   GET /api/clubs/:id - Get club by ID');
    console.log('   POST /api/clubs - Create club');
    console.log('   PUT /api/clubs/:id - Update club');
    console.log('   DELETE /api/clubs/:id - Delete club');
    console.log('   POST /api/vision/ocr - OCR service');
    console.log('   POST /api/vision/ocr/traduire - OCR translation');
    console.log('   GET /api/clubMessages - Get club messages');
    console.log('   POST /api/clubMessages - Send club message');
  });
}

module.exports = app;
