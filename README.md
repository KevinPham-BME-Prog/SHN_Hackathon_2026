# 🤖 AI Question Generator - SHN Hackathon 2026

An intelligent web application that automatically generates educational questions (multiple choice and short answer) from PDF documents using AI technology.

## Features

- 📄 **PDF Upload**: Upload any PDF document for question generation
- 🤖 **AI-Powered**: Uses OpenAI's GPT model to generate intelligent questions
- ✅ **Multiple Choice Questions**: Generates questions with 4 options and correct answers
- ✍️ **Short Answer Questions**: Creates open-ended questions with sample answers
- 💾 **Download Results**: Export generated questions as a text file
- 🎨 **Modern UI**: Beautiful, responsive interface with drag-and-drop support
- 🔄 **Demo Mode**: Works without API key using mock questions for testing

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (optional, works with mock data without it)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KevinPham-BME-Prog/SHN_Hackathon_2026.git
cd SHN_Hackathon_2026
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Configuration

### OpenAI API Key (Optional)

To use real AI-powered question generation:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Create a `.env` file in the project root
3. Add your API key:
```
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

**Note**: The application works without an API key using demo/mock questions, perfect for testing!

## Usage

1. **Upload PDF**: Click the upload area or drag and drop a PDF file
2. **Set Question Count**: Choose how many questions you want (1-20)
3. **Generate**: Click "Generate Questions" and wait for AI processing
4. **Review**: View the generated multiple choice and short answer questions
5. **Download**: Save the questions as a text file for later use

## Project Structure

```
SHN_Hackathon_2026/
├── server.js              # Express backend server
├── public/                # Frontend files
│   ├── index.html        # Main HTML page
│   ├── styles.css        # CSS styling
│   └── script.js         # Frontend JavaScript
├── uploads/              # Temporary PDF storage
├── package.json          # Project dependencies
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework
- **Multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **OpenAI API**: AI question generation
- **dotenv**: Environment configuration

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling with gradients and animations
- **Vanilla JavaScript**: Interactive functionality
- **Fetch API**: Backend communication

## API Endpoints

### POST `/api/upload`
Upload a PDF and generate questions.

**Request:**
- Body: FormData with `pdf` file and `numQuestions` number

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text?",
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
      "question": "Question text?",
      "sample_answer": "Sample answer text"
    }
  ],
  "extractedTextLength": 5000
}
```

### GET `/api/health`
Check server status.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Features in Detail

### Multiple Choice Questions
- Each question has 4 options (A, B, C, D)
- Correct answer is highlighted in green
- Questions are generated based on document content

### Short Answer Questions
- Open-ended questions requiring written responses
- Sample answers provided for reference
- Tests deeper understanding of content

### File Upload
- Accepts PDF files only
- Drag and drop support
- Visual feedback during upload
- File name display

### Error Handling
- Validates file type (PDF only)
- Handles API errors gracefully
- Falls back to demo mode if API unavailable
- User-friendly error messages

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
The application can be tested without an OpenAI API key. It will use mock questions for demonstration purposes.

## Security Considerations

- Uploaded PDFs are automatically deleted after processing
- Environment variables used for sensitive data
- CORS enabled for API access
- File type validation on upload

## Troubleshooting

**Issue**: Cannot extract text from PDF
- **Solution**: Ensure the PDF contains actual text (not scanned images)

**Issue**: Questions seem generic
- **Solution**: Add your OpenAI API key for better AI-generated questions

**Issue**: Server won't start
- **Solution**: Check if port 3000 is available or change PORT in .env

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License - see LICENSE file for details

## Acknowledgments

- SHN Hackathon 2026
- OpenAI for GPT API
- All contributors and testers

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for SHN Hackathon 2026