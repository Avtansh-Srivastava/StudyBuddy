require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse'); // Add this package
const app = express();

// ======================
// 1. BASIC SETUP
// ======================
app.use(cors({ 
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

// Enhanced request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body type:', req.headers['content-type']);
  }
  next();
});

// ======================
// 2. CONFIGURATION
// ======================
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
if (!DEEPINFRA_API_KEY) {
  console.error("❌ CRITICAL: DEEPINFRA_API_KEY is missing from .env file!");
}
const DEEPINFRA_MODEL = 'meta-llama/Meta-Llama-3-70B-Instruct';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ======================
// 3. FILE UPLOAD SETUP
// ======================
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ======================
// 4. PDF TEXT EXTRACTION
// ======================
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF Parse Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// ======================
// 5. AI HELPER FUNCTION
// ======================
const getAIResponse = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        model: DEEPINFRA_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: { 
          'Authorization': `Bearer ${DEEPINFRA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    return response.data.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    throw new Error(`AI service error: ${error.response?.data?.error?.message || error.message}`);
  }
};

// ======================
// 6. API ENDPOINTS
// ======================
app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
  try {
    console.log('Received upload request with file:', req.file ? req.file.originalname : 'none');
    
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ 
        success: false,
        error: 'No PDF file uploaded. Please select a file.' 
      });
    }

    // Extract text from PDF
    const pdfText = await extractTextFromPDF(req.file.buffer);
    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error('Extracted PDF text is too short or empty');
    }

    console.log(`Extracted ${pdfText.length} characters from PDF`);

    // Get AI summary
    const summary = await getAIResponse(
      `Create a detailed summary of this document:\n\n${pdfText.substring(0, 10000)}` +
      `\n\nFocus on key concepts, main arguments, and important conclusions.` +
      `Return the summary in clear paragraphs with proper formatting.`
    );

    res.json({
      success: true,
      summary: summary,
      filename: req.file.originalname,
      textLength: pdfText.length
    });

  } catch (error) {
    console.error('PDF Processing Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process PDF',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add this after the /api/pdf/upload endpoint in index.js
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 3) {
      return res.status(400).json({ 
        success: false,
        error: 'Question must be at least 3 characters'
      });
    }
    
    if (!DEEPINFRA_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: "AI service is not configured",
        suggestion: "Please set up your DeepInfra API key"
      });
    }

    const answer = await getAIResponse(question);
    
    res.json({
      success: true,
      response: answer
    });

  } catch (error) {
    console.error('AI Question Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process your question',
      details: error.message
    });
  }
});

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
  ==========================================
  `);
});