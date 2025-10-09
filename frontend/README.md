# Resume Insight API - Frontend

A modern Next.js frontend showcasing the Resume Scoring API as a portfolio piece.

## Features

- Drag-and-drop PDF upload
- Real-time resume analysis
- Beautiful AI-generated results display
- Optional job description matching
- Fully responsive design
- Built with Next.js 14, TypeScript, and shadcn/ui

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_KEY=1234
```

Make sure the Flask API is running on port 5000.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Resume**: Drag and drop a PDF resume or click to browse
2. **Add Job Description** (Optional): Paste a job description for tailored scoring
3. **Click Analyze**: The API will process the resume using Google Gemini AI
4. **View Results**: See detailed scoring, strengths, weaknesses, and recommendations

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page (portfolio showcase)
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── progress.tsx
│   ├── resume-upload.tsx   # File upload component
│   └── scoring-results.tsx # Results display component
├── lib/
│   ├── api.ts             # API integration & types
│   └── utils.ts           # Utility functions
└── package.json
```

## API Integration

The frontend communicates with the Flask backend API:

```typescript
// lib/api.ts
export async function analyzeResume(
  pdfFile: File,
  jobDescription?: string
): Promise<ResumeAnalysis>
```

Response format:
```json
{
  "overall_score": 86,
  "section_scores": {
    "skills": 90,
    "experience": 80,
    "clarity": 85,
    "keywords": 88
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."]
}
```

## Customization

### Change API URL

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Update Styling

Tailwind configuration is in `tailwind.config.ts`. shadcn/ui theme colors are in `app/globals.css`.

### Add Features

The component architecture makes it easy to add new features:
- Add new sections to `scoring-results.tsx`
- Create custom UI components in `components/ui/`
- Extend API types in `lib/api.ts`

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your production API URL
- `NEXT_PUBLIC_API_KEY`: Your API key

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Portfolio Highlights

This project demonstrates:

- **Modern React Development**: Next.js 14 with App Router
- **TypeScript**: Full type safety across the application
- **API Integration**: REST API consumption with error handling
- **UI/UX Design**: Professional interface with shadcn/ui
- **File Handling**: Drag-and-drop file upload with base64 encoding
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Architecture**: Reusable, modular components

## License

MIT License - This is a portfolio project demonstrating full-stack development skills.
