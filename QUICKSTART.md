# Quick Start Guide

Get the Resume Insight Scoring API running in 5 minutes.

## Prerequisites
- Python 3.9+ installed
- Google AI API key ([Get one here](https://makersuite.google.com/app/apikey))
- A PDF resume to test

## Setup Steps

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your Google API key:
```env
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
API_KEY=my-secret-test-key
DEBUG=True
```

### 3. Run the Server
```bash
python app.py
```

You should see:
```
Starting Resume Insight Scoring API on 0.0.0.0:5000
 * Running on http://0.0.0.0:5000
```

### 4. Test the API
In a new terminal, test with a sample resume:
```bash
python test_api.py path/to/your/resume.pdf
```

That's it! The API will analyze your resume and return detailed scoring results.

## Example Output

```
================================================================================
RESUME ANALYSIS RESULTS
================================================================================

OVERALL SCORE: 86/100
[█████████████████████████████████████████░░░░░░░░░] 86%

--------------------------------------------------------------------------------
SECTION SCORES:
--------------------------------------------------------------------------------
  Skills         [████████████████████████████░░] 92/100
  Experience     [█████████████████████████░░░░░] 84/100
  Clarity        [██████████████████████████░░░░] 88/100
  Keywords       [████████████████████████░░░░░░] 81/100

--------------------------------------------------------------------------------
STRENGTHS:
--------------------------------------------------------------------------------
  1. Strong technical skills in modern technologies
  2. Clear quantified achievements with metrics
  3. Well-structured with logical flow

--------------------------------------------------------------------------------
AREAS FOR IMPROVEMENT:
--------------------------------------------------------------------------------
  1. Limited leadership examples
  2. Could use more industry-specific keywords

--------------------------------------------------------------------------------
RECOMMENDATIONS:
--------------------------------------------------------------------------------
  1. Add a professional summary section at the top
  2. Include more action verbs in bullet points
  3. Quantify more achievements with specific metrics
  4. Add relevant certifications if available
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the scoring rubric in `services/resume_scorer.py`
- Deploy to production using Docker or Cloud Run
- Add new endpoints for additional features

## Common Issues

**Q: Getting "GOOGLE_API_KEY is required" error**
A: Make sure your `.env` file exists and contains a valid `GOOGLE_API_KEY`

**Q: API returns 401 error**
A: Make sure you're passing the correct API key in the `X-API-Key` header

**Q: Slow response times**
A: First request may be slow. Consider using `gemini-1.5-flash` for faster responses

## Getting a Google AI API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

The free tier includes:
- 60 requests per minute
- 1,500 requests per day
- Perfect for testing and small-scale use
