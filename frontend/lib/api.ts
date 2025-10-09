export interface SectionScores {
  skills: number
  experience: number
  clarity: number
  keywords: number
}

export interface ResumeAnalysis {
  overall_score: number
  section_scores: SectionScores
  job_match_score?: number  // Optional: only when job description provided
  missing_keywords?: string[]  // Optional: keywords from JD not in resume
  ats_score: number  // ATS compatibility score
  ats_issues: string[]  // List of ATS problems
  ats_recommendations: string[]  // Fixes for ATS issues
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  metadata?: {
    resume_length_chars: number
    resume_length_words: number
    has_job_description: boolean
  }
}

export interface AnalyzeRequest {
  file: string // base64 encoded PDF
  job_description?: string
}

export interface ProgressUpdate {
  stage: 'decoding' | 'extracting' | 'validating' | 'ats_analysis' | 'ai_analysis' | 'finalizing' | 'complete'
  progress: number
  message: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://job-match-api-998y.onrender.com'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '1234'

export async function analyzeResume(
  pdfFile: File,
  jobDescription?: string
): Promise<ResumeAnalysis> {
  // Convert file to base64
  const base64 = await fileToBase64(pdfFile)

  const payload: AnalyzeRequest = {
    file: base64,
  }

  if (jobDescription) {
    payload.job_description = jobDescription
  }

  const response = await fetch(`${API_BASE_URL}/analyze-resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to analyze resume')
  }

  return response.json()
}

export async function analyzeResumeWithProgress(
  pdfFile: File,
  jobDescription: string | undefined,
  onProgress: (update: ProgressUpdate) => void
): Promise<ResumeAnalysis> {
  // Convert file to base64
  const base64 = await fileToBase64(pdfFile)

  const payload: AnalyzeRequest = {
    file: base64,
  }

  if (jobDescription) {
    payload.job_description = jobDescription
  }

  return new Promise((resolve, reject) => {
    // Use fetch with streaming for POST request
    fetch(`${API_BASE_URL}/analyze-resume-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(payload),
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text()
        console.error('SSE request failed:', response.status, errorText)
        reject(new Error('Failed to analyze resume'))
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        reject(new Error('No response body'))
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Split by double newline (SSE message separator)
          const messages = buffer.split('\n\n')
          buffer = messages.pop() || ''

          for (const message of messages) {
            if (!message.trim()) continue

            // Parse SSE message format: "event: xxx\ndata: {...}"
            const lines = message.split('\n')
            let eventType = ''
            let dataStr = ''

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.substring(7).trim()
              } else if (line.startsWith('data: ')) {
                dataStr = line.substring(6).trim()
              }
            }

            if (eventType && dataStr) {
              console.log('SSE Message:', eventType, dataStr)

              try {
                const data = JSON.parse(dataStr)

                if (eventType === 'progress') {
                  onProgress(data as ProgressUpdate)
                } else if (eventType === 'result') {
                  console.log('Analysis complete, resolving with result')
                  resolve(data as ResumeAnalysis)
                  return
                } else if (eventType === 'error') {
                  console.error('SSE Error:', data)
                  reject(new Error(data.message || 'Analysis failed'))
                  return
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', dataStr, parseError)
              }
            }
          }
        }
      } catch (error) {
        console.error('SSE stream error:', error)
        reject(error)
      }
    }).catch((error) => {
      console.error('Fetch error:', error)
      reject(error)
    })
  })
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error('API is not available')
  }

  return response.json()
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix (data:application/pdf;base64,)
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-green-500'
  if (score >= 70) return 'text-yellow-600'
  if (score >= 60) return 'text-orange-500'
  return 'text-red-500'
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fair'
  return 'Needs Improvement'
}
