require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse'); // Add this for PDF processing
const app = express();

// ======================
// 1. BASIC SETUP
// ======================
app.use(cors({ 
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Create necessary directories
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');
ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(tempDir);

// ======================
// 2. CONFIGURATION
// ======================
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
const DEEPINFRA_MODEL = process.env.DEEPINFRA_MODEL || 'meta-llama/Meta-Llama-3-70B-Instruct';
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default

// ======================
// 3. FILE UPLOAD SETUP
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pdf-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: parseInt(MAX_FILE_SIZE) },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ======================
// 4. HELPER FUNCTIONS
// ======================
const validateQuestion = (req, res, next) => {
  const { question } = req.body;
  if (!question?.trim()) {
    return res.status(400).json({ 
      success: false,
      error: 'Question is required',
      details: 'Please enter a valid question' 
    });
  }
  next();
};

const processPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF Processing Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

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
        timeout: 15000
      }
    );
    return response.data.choices[0]?.message?.content;
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    throw error;
  }
};

// ======================
// 5. API ENDPOINTS
// ======================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: { 
      ai_service: DEEPINFRA_API_KEY ? 'available' : 'unavailable',
      file_uploads: 'available'
    }
  });
});

app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Process the PDF
    const pdfText = await processPDF(req.file.path);
    
    // Generate a summary using AI
    let summary;
    try {
      summary = await getAIResponse(`Summarize this PDF content in 3-5 key points:\n\n${pdfText.substring(0, 5000)}`);
    } catch (aiError) {
      console.error('AI Summary Failed:', aiError);
      summary = "Generated summary unavailable - here are the first 500 characters:\n\n" + pdfText.substring(0, 500);
    }

    res.json({
      success: true,
      originalFilename: req.file.originalname,
      summary: summary,
      textLength: pdfText.length,
      pages: pdfText.split('\f').length
    });

  } catch (error) {
    console.error('PDF Processing Error:', error);
    res.status(500).json({
      success: false,
      error: 'PDF processing failed',
      details: error.message
    });
  }
});

app.post('/api/ai/ask', validateQuestion, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!DEEPINFRA_API_KEY) {
      return res.json({
        success: false,
        response: "AI service is not configured",
        suggestion: "Please set up your DeepInfra API key"
      });
    }

    const answer = await getAIResponse(question);
    
    res.json({
      success: true,
      response: answer || "No content received from AI",
      model: DEEPINFRA_MODEL
    });

  } catch (error) {
    console.error('AI Question Error:', error);
    res.status(500).json({
      success: false,
      error: 'AI service unavailable',
      details: error.message,
      fallback: getFallbackResponse(req.body.question)
    });
  }
});

// ======================
// 6. DOCUMENTATION & ERROR HANDLING
// ======================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StudyBuddy API</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .status { padding: 1rem; background: #f5f5f5; border-radius: 5px; margin-bottom: 2rem; }
        .endpoint { background: #f0f0f0; padding: 1rem; border-radius: 5px; margin-bottom: 1rem; }
        code { background: #e0e0e0; padding: 0.2rem 0.4rem; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>StudyBuddy API</h1>
      <div class="status">
        <h2>Service Status</h2>
        <p><strong>AI Service:</strong> ${DEEPINFRA_API_KEY ? '✅ Configured' : '⚠️ Not Configured'}</p>
        <p><strong>PDF Processing:</strong> ✅ Available</p>
        <p><strong>Max File Size:</strong> ${MAX_FILE_SIZE / (1024 * 1024)}MB</p>
      </div>
      
      <h2>API Endpoints</h2>
      
      <div class="endpoint">
        <h3>POST /api/pdf/upload</h3>
        <p>Upload PDF files for processing</p>
        <pre>curl -X POST -F "pdf=@yourfile.pdf" http://localhost:3000/api/pdf/upload</pre>
      </div>
      
      <div class="endpoint">
        <h3>POST /api/ai/ask</h3>
        <p>Ask questions to the AI assistant</p>
        <pre>curl -X POST -H "Content-Type: application/json" -d '{"question":"Your question"}' http://localhost:3000/api/ai/ask</pre>
      </div>
    </body>
    </html>
  `);
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    documentation: 'http://localhost:3000'
  });
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
  AI Service: ${DEEPINFRA_API_KEY ? '✅ Ready' : '⚠️ Disabled'}
  PDF Processing: ✅ Enabled
  Max File Size: ${MAX_FILE_SIZE / (1024 * 1024)}MB
  Upload Directory: ${uploadsDir}
  ==========================================
  `);
});

// Cleanup temp files on exit
process.on('SIGINT', () => {
  console.log('\nCleaning up before shutdown...');
  process.exit();
});