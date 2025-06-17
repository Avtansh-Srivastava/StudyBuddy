require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const pdf = require('pdf-parse');
const app = express();

// =====================================
// 1. CRITICAL RENDER.COM HEALTH CHECK
// =====================================
// MUST BE THE VERY FIRST ROUTE
app.get('/render-health', (req, res) => {
  console.log('✅ Render health check passed');
  res.send('OK');
});

// =====================================
// 2. CORS CONFIGURATION
// =====================================
const allowedOrigins = [
  'https://studybuddy-lily-555118.netlify.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// =====================================
// 3. BASIC MIDDLEWARE
// =====================================
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// =====================================
// 4. HEALTH ENDPOINTS
// =====================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// =====================================
// 5. API ROUTES
// =====================================
// Flashcard endpoints
let flashcards = [];

app.get('/api/flashcards', (req, res) => {
  res.json(flashcards);
});

app.post('/api/flashcards', (req, res) => {
  const newCard = {
    id: Date.now().toString(),
    question: req.body.question,
    answer: req.body.answer,
    createdAt: new Date().toISOString()
  };
  flashcards.push(newCard);
  res.status(201).json(newCard);
});

// AI Endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Simulated response for testing
    res.json({
      response: `AI received your question: "${question}"`
    });
  } catch (error) {
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// PDF Processing
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/pdf/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Basic PDF processing
    const data = await pdf(req.file.buffer);
    res.json({
      success: true,
      textSample: data.text.substring(0, 500) + '...',
      pages: data.numpages
    });
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ error: 'PDF processing failed' });
  }
});

// =====================================
// 6. ERROR HANDLING
// =====================================
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// =====================================
// 7. SERVER START (CRITICAL FOR RENDER)
// =====================================
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // REQUIRED for Render

app.listen(PORT, HOST, () => {
  console.log(`
  =========================================
   StudyBuddy Backend Service RUNNING!
  =========================================
  Server: http://${HOST}:${PORT}
  Health Check: /render-health
  Environment: ${process.env.NODE_ENV || 'development'}
  Time: ${new Date().toLocaleString()}
  =========================================
  `);
});