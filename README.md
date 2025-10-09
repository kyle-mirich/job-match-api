# Resume Insight - AI-Powered Resume Analysis

A full-stack application that analyzes PDF resumes using Google's Generative AI (Gemini) and LangChain. Features a modern Next.js frontend with real-time progress updates and a Flask REST API backend.

## Features

### Backend API
- PDF resume upload and text extraction
- AI-powered resume analysis using Google Gemini via LangChain
- **Real-time progress updates** using Server-Sent Events (SSE)
- Comprehensive scoring across multiple categories:
  - Skills Match
  - Experience Depth
  - Clarity & Structure
  - Keyword Optimization
- **ATS (Applicant Tracking System) compatibility scoring**
- **Job Match Score** when job description provided
- **Missing Keywords Detection** for job description matching
- Detailed feedback with strengths, weaknesses, and recommendations
- API key authentication
- Docker support for easy deployment
- Error handling and validation

### Frontend
- Modern Next.js 14 (App Router) with TypeScript
- Tailwind CSS + shadcn/ui components
- Real-time loading screen with progress updates
- Tabbed results interface:
  - Overview Dashboard
  - Detailed Analysis
  - ATS Compatibility Check
  - Job Match Analysis
- Fully responsive design (mobile + desktop)
- Dark mode support

## Project Structure

```
job-match-api/
├── app.py                      # Main Flask application with SSE support
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
│
├── middleware/                # Backend middleware
│   ├── __init__.py
│   └── auth.py               # API key authentication
│
├── services/                  # Core business logic
│   ├── __init__.py
│   ├── resume_scorer.py      # LangChain + Google AI scoring
│   └── ats_analyzer.py       # ATS compatibility checker
│
├── utils/                     # Utility functions
│   ├── __init__.py
│   └── pdf_extractor.py      # PDF text extraction
│
├── tests/                     # Test scripts
│   ├── test_api.py           # API integration tests
│   ├── test_sse_endpoint.py  # SSE streaming tests
│   ├── test_simple.py        # Basic functionality tests
│   ├── test_new_features.py  # ATS & Job Match tests
│   ├── test_scorer_directly.py
│   └── test_frontend_simulation.py
│
└── frontend/                  # Next.js frontend application
    ├── app/
    │   ├── page.tsx          # Main application page
    │   ├── layout.tsx        # Root layout
    │   └── globals.css       # Global styles
    ├── components/
    │   ├── loading-screen.tsx    # Real-time progress display
    │   ├── results-tabs.tsx      # Tabbed results interface
    │   ├── resume-upload.tsx     # File upload component
    │   ├── ats-score-card.tsx    # ATS compatibility display
    │   ├── job-match-badge.tsx   # Job match score display
    │   └── ui/                   # shadcn/ui components
    ├── lib/
    │   ├── api.ts            # API client with SSE support
    │   └── utils.ts          # Utility functions
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

## Prerequisites

- Python 3.9+
- Google AI API Key (get one at https://makersuite.google.com/app/apikey)
- pip (Python package manager)

## Local Setup

### 1. Clone or Navigate to Project Directory

```bash
cd job-match-api
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Google AI Configuration
GOOGLE_API_KEY=your_actual_google_api_key_here
MODEL_NAME=gemini-1.5-pro

# API Authentication
API_KEY=your-secure-api-key-here

# Flask Configuration
DEBUG=True
HOST=0.0.0.0
PORT=5000
```

**Important:**
- Get your Google AI API key from https://makersuite.google.com/app/apikey
- Change `API_KEY` to a secure random string

### 5. Run the Application

```bash
python app.py
```

The API will start at `http://localhost:5000`

You should see:
```
Starting Resume Insight Scoring API on 0.0.0.0:5000
Debug mode: True
 * Running on http://0.0.0.0:5000
```

## Running the Frontend

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_KEY=1234
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

The frontend will start at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

## Testing the API

### Option 1: Using the Test Scripts

Navigate to the `tests/` directory and run:

**Basic API Test:**
```bash
python tests/test_api.py path/to/your/resume.pdf
```

**Test SSE Streaming:**
```bash
python tests/test_sse_endpoint.py
```

**Test New Features (ATS & Job Match):**
```bash
python tests/test_new_features.py
```

These scripts will:
1. Convert your PDF to base64
2. Send it to the API
3. Display the analysis results with real-time progress

### Option 2: Using cURL

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Analyze Resume:**

First, convert your PDF to base64:

**Windows (PowerShell):**
```powershell
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("resume.pdf"))
```

**macOS/Linux:**
```bash
base64 -i resume.pdf > resume_base64.txt
```

Then make the API call:

```bash
curl -X POST http://localhost:5000/analyze-resume \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "file": "BASE64_ENCODED_PDF_HERE",
    "job_description": "Looking for a Senior Python Developer with 5+ years experience..."
  }'
```

### Option 3: Using Python Requests

```python
import requests
import base64

# Read and encode PDF
with open('resume.pdf', 'rb') as f:
    pdf_base64 = base64.b64encode(f.read()).decode('utf-8')

# Make request
response = requests.post(
    'http://localhost:5000/analyze-resume',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here'
    },
    json={
        'file': pdf_base64,
        'job_description': 'Optional job description here...'
    }
)

# Print results
print(response.json())
```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Resume Insight Scoring API",
  "version": "1.0.0"
}
```

### GET /
API information and available endpoints.

### POST /analyze-resume
Analyze a resume and get detailed scoring (non-streaming).

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Request Body:**
```json
{
  "file": "<base64 encoded PDF>",
  "job_description": "Optional JD text for tailored scoring"
}
```

**Response (Success - 200):**
```json
{
  "overall_score": 86,
  "section_scores": {
    "skills": 90,
    "experience": 80,
    "clarity": 85,
    "keywords": 88
  },
  "ats_score": 92,
  "ats_issues": [
    "Consider using standard section headers"
  ],
  "ats_recommendations": [
    "Use standard fonts like Arial or Calibri",
    "Avoid tables and complex layouts"
  ],
  "job_match_score": 85,
  "missing_keywords": [
    "Docker",
    "Kubernetes",
    "CI/CD"
  ],
  "strengths": [
    "Strong technical skills in Python and cloud technologies",
    "Clear project outcomes with quantified results"
  ],
  "weaknesses": [
    "Limited leadership examples",
    "Could benefit from more industry keywords"
  ],
  "recommendations": [
    "Add metrics to describe impact (e.g., 'improved performance by 40%')",
    "Include a summary section highlighting top 3-5 skills",
    "Add more action verbs at the start of bullet points",
    "Quantify achievements wherever possible"
  ],
  "metadata": {
    "resume_length_chars": 3421,
    "resume_length_words": 542,
    "has_job_description": true
  }
}
```

### POST /analyze-resume-stream
Analyze a resume with real-time progress updates via Server-Sent Events (SSE).

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Request Body:** Same as `/analyze-resume`

**Response:** Server-Sent Events stream

**Progress Event:**
```
event: progress
data: {"stage": "ai_analysis", "progress": 70, "message": "Evaluating skills and experience..."}
```

**Result Event:**
```
event: result
data: {<full analysis JSON>}
```

**Error Event:**
```
event: error
data: {"error": "Analysis failed", "message": "Error details"}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "error": "Authentication required",
  "message": "X-API-Key header is required"
}
```

*400 Bad Request:*
```json
{
  "error": "Invalid PDF",
  "message": "Invalid base64 encoded PDF"
}
```

*500 Internal Server Error:*
```json
{
  "error": "Analysis failed",
  "message": "An error occurred while analyzing the resume"
}
```

## Docker Deployment

### Build Image

```bash
docker build -t resume-scoring-api .
```

### Run Container

```bash
docker run -p 5000:5000 \
  -e GOOGLE_API_KEY=your_google_api_key \
  -e API_KEY=your_secure_api_key \
  resume-scoring-api
```

Or use an `.env` file:

```bash
docker run -p 5000:5000 --env-file .env resume-scoring-api
```

### Deploy to Google Cloud Run

1. **Build and push to Google Container Registry:**

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/resume-scoring-api
```

2. **Deploy to Cloud Run:**

```bash
gcloud run deploy resume-scoring-api \
  --image gcr.io/YOUR_PROJECT_ID/resume-scoring-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=your_key,API_KEY=your_api_key
```

## Scoring Rubric

The API evaluates resumes based on:

| Category | Description | Weight |
|----------|-------------|--------|
| **Skills Match** | Relevance of skills to role/industry, depth and breadth, modern technologies | 25% |
| **Experience Depth** | Clear responsibilities, career progression, quantified achievements, leadership | 25% |
| **Clarity & Structure** | Professional formatting, concise language, grammar, logical flow | 25% |
| **Keyword Optimization** | Industry keywords, ATS-friendliness, role-specific vocabulary | 25% |

Scores range from 0-100 for each category and overall.

## Customization

### Changing the AI Model

Edit `config.py` or set `MODEL_NAME` in `.env`:

```env
MODEL_NAME=gemini-1.5-flash  # Faster, cheaper
MODEL_NAME=gemini-1.5-pro    # More accurate (default)
```

### Adjusting Scoring Prompts

Edit the prompt in `services/resume_scorer.py`:

```python
def _build_scoring_prompt(self, job_description: Optional[str] = None):
    # Customize the system template here
    system_template = """Your custom instructions..."""
```

### Adding New Endpoints

Add new routes in `app.py`:

```python
@app.route('/compare-resumes', methods=['POST'])
@require_api_key
def compare_resumes():
    # Your implementation
    pass
```

## Troubleshooting

**Error: "GOOGLE_API_KEY is required"**
- Make sure you've set `GOOGLE_API_KEY` in your `.env` file
- Verify the `.env` file is in the project root directory

**Error: "No text could be extracted from the PDF"**
- Ensure the PDF is not password-protected
- Try a different PDF - some PDFs are image-based and need OCR
- Check if the PDF is corrupted

**Error: "Invalid API key"**
- Make sure you're sending the `X-API-Key` header
- Verify the key matches what's in your `.env` file

**Slow responses:**
- The first request may be slow while the model loads
- Consider using `gemini-1.5-flash` for faster responses
- Increase timeout in Dockerfile if needed

## Security Considerations

- Always use strong, random API keys in production
- Never commit `.env` files to version control
- Use HTTPS in production
- Consider rate limiting for production deployments
- Rotate API keys regularly

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs for error details
3. Ensure all dependencies are correctly installed
4. Verify your Google AI API key is valid and has quota remaining
