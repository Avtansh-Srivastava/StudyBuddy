require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const app = express();

// ======================
// 0. SECURITY MIDDLEWARE
// ======================
// Content Security Policy
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
// 1. BASIC SETUP
// ======================
// Dynamic CORS based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://studybuddy-lily-555118.netlify.app']  // ONLY YOUR NETLIFY URL HERE
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body type:', req.headers['content-type']);
  }
  next();
});

// ======================
// 2. ROUTES
// ======================
// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>StudyBuddy API</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          code { background: #f4f4f4; padding: 2px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>StudyBuddy API Service</h1>
          <p>This is the backend service for StudyBuddy application.</p>
          <h2>Available Endpoints:</h2>
          <ul>
            <li><code>POST /api/pdf/upload</code> - PDF summarization</li>
            <li><code>POST /api/ask</code> - AI question answering</li>
          </ul>
          <p>Status: <strong>🟢 Operational</strong></p>
        </div>
      </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// [Keep all your existing code for PDF upload and AI endpoints...]
// ======================
// 3. CONFIGURATION
// ======================
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
if (!DEEPINFRA_API_KEY) {
  console.error("❌ CRITICAL: DEEPINFRA_API_KEY is missing from .env file!");
}
const DEEPINFRA_MODEL = 'meta-llama/Meta-Llama-3-70B-Instruct';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// [Rest of your existing code for file upload, PDF extraction, and AI functions...]

// ======================
// 7. START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ==========================================
   StudyBuddy Backend Service
  ==========================================
  Server running on: http://localhost:${PORT}
  AI Service: ${DEEPINFRA_API_KEY ? '✅ Enabled' : '❌ Disabled'}
  Max PDF Size: ${MAX_FILE_SIZE / (1024 * 1024)}MB
  Environment: ${process.env.NODE_ENV || 'development'}
  ==========================================
  `);
});