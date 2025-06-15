// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const pdf = require('pdf-parse');
// const app = express();

// // Basic setup
// app.use(cors());
// app.use(express.json());

// // Create directories
// const ensureDirectoryExists = (dirPath) => {
//   if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
// };

// const uploadsDir = path.join(__dirname, 'uploads');
// ensureDirectoryExists(uploadsDir);

// // Configuration
// const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
// const DEEPINFRA_MODEL = process.env.DEEPINFRA_MODEL || 'meta-llama/Meta-Llama-3-70B-Instruct';
// const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024;

// // File upload setup
// const upload = multer({ 
//   storage: multer.diskStorage({
//     destination: uploadsDir,
//     filename: (req, file, cb) => {
//       const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
//       cb(null, `pdf-${uniqueName}`);
//     }
//   }),
//   limits: { fileSize: parseInt(MAX_FILE_SIZE) },
//   fileFilter: (req, file, cb) => {
//     path.extname(file.originalname).toLowerCase() === '.pdf' 
//       ? cb(null, true) 
//       : cb(new Error('Only PDF files allowed'), false);
//   }
// });

// // Helper functions
// const processPDF = async (filePath) => {
//   try {
//     const dataBuffer = fs.readFileSync(filePath);
//     return (await pdf(dataBuffer)).text;
//   } catch (error) {
//     console.error('PDF Processing Error:', error);
//     throw new Error('Failed to extract text');
//   }
// };

// const getAIResponse = async (prompt) => {
//   try {
//     const response = await axios.post(
//       'https://api.deepinfra.com/v1/openai/chat/completions',
//       {
//         model: DEEPINFRA_MODEL,
//         messages: [{ role: "user", content: prompt }],
//         max_tokens: 500,
//         temperature: 0.7
//       },
//       {
//         headers: { 
//           'Authorization': `Bearer ${DEEPINFRA_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 15000
//       }
//     );
//     return response.data.choices[0]?.message?.content || "No content";
//   } catch (error) {
//     console.error('AI API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // API Endpoints
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'operational',
//     services: { 
//       ai: DEEPINFRA_API_KEY ? 'available' : 'unavailable',
//       uploads: 'available'
//     }
//   });
// });

// app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
//     const pdfText = await processPDF(req.file.path);
//     let summary;
    
//     try {
//       summary = await getAIResponse(`Summarize this PDF:\n\n${pdfText.substring(0, 5000)}`);
//     } catch {
//       summary = "Summary unavailable - first 500 chars:\n" + pdfText.substring(0, 500);
//     }

//     res.json({
//       success: true,
//       filename: req.file.originalname,
//       summary: summary
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'PDF processing failed' });
//   }
// });

// app.post('/api/ai/ask', async (req, res) => {
//   try {
//     const { question } = req.body;
//     if (!question?.trim()) return res.status(400).json({ error: 'Question required' });
    
//     if (!DEEPINFRA_API_KEY) {
//       return res.json({
//         response: "AI service not configured",
//         suggestion: "Set DeepInfra API key"
//       });
//     }

//     const answer = await getAIResponse(question);
//     res.json({ success: true, response: answer });
//   } catch (error) {
//     res.status(500).json({ error: 'AI service unavailable' });
//   }
// });

// // Start server - PORT FIXED TO 4000
// const PORT = process.env.PORT || 4000; // Changed to 4000
// app.listen(PORT, () => {
//   console.log(`
//   ==================================
//    Server running on port ${PORT}
//   ==================================
//   Local: http://localhost:${PORT}
//   Health: http://localhost:${PORT}/api/health
//   `);
// });