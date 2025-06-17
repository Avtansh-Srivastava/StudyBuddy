require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); // Added for debugging
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const app = express();

// ======================
// 0. SECURITY MIDDLEWARE
// ======================
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self';" +
    "connect-src 'self' https://api.deepinfra.com;" +
    "font-src 'self' https://fonts.gstatic.com;" +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
    "img-src 'self' data:;"
  );
  next();
});

// ======================
// 1. CORE MIDDLEWARE (FIXED ORDER)
// ======================
// Single CORS configuration (removed duplicates)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://studybuddy-lily-555118.netlify.app']
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev')); // Request logging

// ======================
// 2. API ROUTES (MUST COME FIRST)
// ======================
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Flashcard endpoints
let flashcards = [];

app.get('/api/flashcards', (req, res) => {
  res.json(flashcards);
});

app.post('/api/flashcards', (req, res) => {
  const newCard = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  flashcards.push(newCard);
  res.status(201).json(newCard);
});

// ======================
// 3. PDF & AI ENDPOINTS (ADD YOUR IMPLEMENTATIONS HERE)
// ======================
// TODO: Add your actual POST implementations for these
app.post('/api/ask', (req, res) => {
  // Your AI question answering implementation
  res.json({ message: 'AI response would be here' });
});

const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/pdf/upload', upload.single('file'), (req, res) => {
  // Your PDF processing implementation
  res.json({ message: 'PDF processing would happen here' });
});

// ======================
// 4. DEBUG ENDPOINTS
// ======================
app.get('/api/test-endpoints', (req, res) => {
  res.json({
    flashcards: 'GET/POST /api/flashcards',
    ask: 'POST /api/ask',
    pdf: 'POST /api/pdf/upload'
  });
});

// ======================
// 5. STATIC & FALLBACK (PRODUCTION ONLY)
// ======================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Fallback handler (MUST be last)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Dev-only root route
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>StudyBuddy API</title></head>
        <body>
          <h1>StudyBuddy API Dev Mode</h1>
          <p>Endpoints are active. Use Postman for testing.</p>
        </body>
      </html>
    `);
  });
}

// ======================
// 6. ERROR HANDLING (MUST BE LAST MIDDLEWARE)
// ======================
// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({ error: 'Internal server error' });
});

// ======================
// 7. CONFIGURATION & STARTUP
// ======================
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
if (!DEEPINFRA_API_KEY) {
  console.error("❌ CRITICAL: DEEPINFRA_API_KEY is missing!");
}
const DEEPINFRA_MODEL = 'meta-llama/Meta-Llama-3-70B-Instruct';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ==========================================
   StudyBuddy Backend Service
  ==========================================
  Server running on port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  CORS Allowed: ${corsOptions.origin}
  Debug Mode: ${morgan ? '✅ Enabled' : '❌ Disabled'}
  ==========================================
  `);
});