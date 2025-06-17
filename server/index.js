require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');
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
  'https://studybuddy-frontend-kote.onrender.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// =====================================
// 3. BASIC MIDDLEWARE
// =====================================
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
// 5. ROOT ENDPOINT FOR LOAD BALANCER
// =====================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StudyBuddy Backend</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        .status { color: #4CAF50; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>StudyBuddy Backend Service</h1>
      <p>Status: <span class="status">OPERATIONAL</span></p>
      <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
      <p>Health Check: <a href="/health">/health</a></p>
      <p>Render Health: <a href="/render-health">/render-health</a></p>
    </body>
    </html>
  `);
});

// =====================================
// 6. API ROUTES
// =====================================
// Flashcard endpoints
let flashcards = [];

app.get('/api/flashcards', (req, res) => {
  res.json(flashcards);
});

app.post('/api/flashcards', (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  const newCard = {
    id: Date.now().toString(),
    question,
    answer,
    createdAt: new Date().toISOString()
  };
  flashcards.push(newCard);
  res.status(201).json(newCard);
});

app.put('/api/flashcards/:id', (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  const index = flashcards.findIndex(card => card.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  flashcards[index] = { ...flashcards[index], question, answer, createdAt: new Date().toISOString() };
  res.json(flashcards[index]);
});

app.delete('/api/flashcards/:id', (req, res) => {
  const { id } = req.params;
  const index = flashcards.findIndex(card => card.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }
  flashcards.splice(index, 1);
  res.json({ message: 'Flashcard deleted' });
});

// AI Endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // DeepInfra AI integration
    const aiResponse = await axios.post(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant.' },
          { role: 'user', content: question }
        ],
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = aiResponse.data.choices[0].message.content;
    res.json({ response: answer });
  } catch (error) {
    console.error('AI error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'AI processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PDF Processing with DeepInfra Summarization
app.post('/api/pdf/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify PDF file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Extract text from PDF
    const data = await pdf(req.file.buffer);
    const pdfText = data.text;

    // Summarize with DeepInfra
    const summaryResponse = await axios.post(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant tasked with summarizing text.' },
          { role: 'user', content: `Summarize the following text in 200 words or less:\n\n${pdfText.substring(0, 4000)}` }
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = summaryResponse.data.choices[0].message.content;

    res.json({
      success: true,
      summary,
      pages: data.numpages,
      textSample: pdfText.substring(0, 500) + '...'
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({
      error: 'PDF processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =====================================
// 7. ERROR HANDLING
// =====================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.stack);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// =====================================
// 8. SERVER START
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