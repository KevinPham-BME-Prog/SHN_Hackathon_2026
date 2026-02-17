const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many upload requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Extract text from PDF
async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw error;
    }
}

// Generate questions using AI (OpenAI)
async function generateQuestions(text, numQuestions = 5) {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
        // Return mock questions if no API key is configured
        return generateMockQuestions(numQuestions);
    }

    try {
        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const prompt = `Based on the following text, generate ${numQuestions} educational questions. For each question, provide:
1. A multiple choice question with 4 options (A, B, C, D) and indicate the correct answer
2. A short answer question

Format the response as a JSON array with this structure:
[
  {
    "type": "multiple_choice",
    "question": "Question text",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correct_answer": "A"
  },
  {
    "type": "short_answer",
    "question": "Question text",
    "sample_answer": "A brief sample answer"
  }
]

Text to analyze:
${text.substring(0, 3000)}`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an educational assistant that generates high-quality questions based on provided text. Always respond with valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content;
        // Extract JSON from response (handle cases where AI includes markdown code blocks)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
    } catch (error) {
        console.error('Error generating questions with AI:', error);
        // Fallback to mock questions
        return generateMockQuestions(numQuestions);
    }
}

// Generate mock questions for demo purposes
function generateMockQuestions(numQuestions) {
    const questions = [];
    for (let i = 0; i < numQuestions; i++) {
        if (i % 2 === 0) {
            questions.push({
                type: "multiple_choice",
                question: `Sample Multiple Choice Question ${Math.floor(i / 2) + 1} based on the document content?`,
                options: {
                    A: "Option A - First possible answer",
                    B: "Option B - Second possible answer",
                    C: "Option C - Third possible answer",
                    D: "Option D - Fourth possible answer"
                },
                correct_answer: ["A", "B", "C", "D"][i % 4]
            });
        } else {
            questions.push({
                type: "short_answer",
                question: `Sample Short Answer Question ${Math.floor(i / 2) + 1} based on the document?`,
                sample_answer: "This is a sample answer that would be generated based on the document content."
            });
        }
    }
    return questions;
}

// Routes
app.post('/api/upload', uploadLimiter, upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const numQuestions = parseInt(req.body.numQuestions) || 5;

        // Extract text from PDF
        const text = await extractTextFromPDF(req.file.path);

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from PDF' });
        }

        // Generate questions using AI
        const questions = await generateQuestions(text, numQuestions);

        // Clean up uploaded file
        try {
            fs.unlinkSync(req.file.path);
        } catch (err) {
            console.error('Error deleting uploaded file:', err);
            // Continue execution even if file deletion fails
        }

        res.json({
            success: true,
            questions: questions,
            extractedTextLength: text.length
        });

    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: 'Error processing PDF: ' + error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Demo endpoint to test question generation
app.get('/api/demo', async (req, res) => {
    try {
        const numQuestions = parseInt(req.query.numQuestions) || 6;
        const sampleText = "Photosynthesis is the process by which green plants convert light energy into chemical energy.";
        const questions = await generateQuestions(sampleText, numQuestions);
        res.json({
            success: true,
            questions: questions,
            demo: true
        });
    } catch (error) {
        res.status(500).json({ error: 'Error generating demo questions: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
});
