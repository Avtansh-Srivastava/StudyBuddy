require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');
const app = express();

console.log('Starting StudyBuddy Backend...');

if (!process.env.DEEPINFRA_API_KEY) {
  console.error('ERROR: DEEPINFRA_API_KEY is not set');
  process.exit(1);
}

app.get('/render-health', (req, res) => {
  console.log('✅ Render health check passed');
  res.send('OK');
});

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

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 } // 500KB
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StudyBuddy Backend</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        .status { color: #4CAF50; font-weight: normal; }
      </style>
    </head>
    <body>
      <h1>StudyBuddy Backend Service</h1>
      <p>Status: <span class="status">Operational</span></p>
      <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
      <p>Health Check: <a href="/health">/health</a></p>
      <p>Render Health: <a href="/render-health">/render-health</a></p>
    </body>
    </html>
  `);
});

let flashcards = [];

app.get('/api/flashcards', (req, res) => {
  res.json(flashcards);
});

app.post('/api/flashcards', (req, res) => {
  const { question, answer } = req.body;
  console.log('[Flashcards] Received:', { question, answer });
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

app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('[AI] Sending request to DeepInfra:', {
      question: question,
      apiKey: process.env.DEEPINFRA_API_KEY?.substring(0, 4) + '...'
    });

    const aiResponse = await axios.post(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant.' },
          { role: 'user', content: question }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const answer = aiResponse.data.choices[0]?.message.content;
    if (!answer) {
      throw new Error('No content in DeepInfra response');
    }
    console.log('[AI] Success:', answer.substring(0, 100) + '...');
    res.json({ success: true, response: answer });
  } catch (error) {
    console.error('[AI] Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({
      error: 'AI processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'AI service error'
    });
  }
});

app.post('/api/pdf/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      console.error('[PDF] Invalid file type:', req.file.mimetype);
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    console.log('[PDF] Processing PDF:', {
      name: req.file.originalname,
      sizeKB: req.file.size / 1024
    });

    let data;
    try {
      data = await pdf(req.file.buffer, { max: 2 });
    } catch (error) {
      console.error('[PDF] Parse error:', error.message);
      return res.status(400).json({ error: 'Invalid PDF file', details: error.message });
    }

    const pdfText = data.text;
    if (!pdfText || pdfText.length < 10) {
      console.log('[PDF] No meaningful text:', pdfText.length);
      return res.status(400).json({
        error: 'No meaningful text extracted from PDF',
        pages: data.numpages
      });
    }

    if (pdfText.length > 2000) {
      console.log('[PDF] Text too large:', pdfText.length);
      return res.status(400).json({
        error: 'PDF too large for summarization (max 2KB text)',
        pages: data.numpages
      });
    }

    console.log('[PDF] Sending to DeepInfra:', pdfText.length, 'chars');
    let summaryResponse;
    try {
      summaryResponse = await axios.post(
        'https://api.deepinfra.com/v1/openai/chat/completions',
        {
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          messages: [
            { role: 'system', content: 'You are a helpful study assistant that summarizes text.' },
            { role: 'user', content: `Summarize this text in 100 words or less: ${pdfText.substring(0, 1500)}` }
          ],
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const summary = summaryResponse.data.choices[0]?.message.content;
      if (!summary) {
        throw new Error('No summary content from DeepInfra');
      }
      console.log('[PDF] Summary:', summary.substring(0, 100) + '...');
      res.json({
        success: true,
        summary,
        pages: data.numpages
      });
    } catch (error) {
      console.error('[PDF] Error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      return res.status(500).json({
        error: 'PDF summarization failed',
        details: process.env.NODE_ENV === 'development' ? error.message : 'AI service error'
      });
    }
  } catch (error) {
    console.error('[PDF] General error:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      error: 'PDF processing error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('[Global] Error:', {
    message: err.message,
    stack: err.stack
  });
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(
    `\n=== StudyBuddy Backend RUNNING ===\n` +
    `Server: http://${HOST}:${PORT}\n` +
    `Health Check: /render-health\n` +
    `Environment: ${process.env.NODE_ENV || 'development'}\n` +
    `Time: ${new Date().toISOString()}\n`
  );
});