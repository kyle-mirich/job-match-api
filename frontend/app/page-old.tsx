"use client"

import { useState } from 'react'
import { ResumeUpload } from '@/components/resume-upload'
import { ScoringResults } from '@/components/scoring-results'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { analyzeResume, ResumeAnalysis } from '@/lib/api'
import { Sparkles, Github, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)

    try {
      const result = await analyzeResume(
        selectedFile,
        jobDescription.trim() || undefined
      )
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setJobDescription('')
    setAnalysis(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Resume Insight API</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Resume Scoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Portfolio Demo</Badge>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              Full-Stack Portfolio Project
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Intelligent Resume Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your resume and get instant AI-powered feedback with detailed scoring,
              strengths analysis, and actionable recommendations
            </p>
          </div>

          {/* Tech Stack Info */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                REST API Integration
              </CardTitle>
              <CardDescription>
                This demo showcases a production-ready Flask API with Google Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm">Backend</p>
                  <p className="text-xs text-muted-foreground">Flask + Python</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm">AI Model</p>
                  <p className="text-xs text-muted-foreground">Google Gemini</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm">Framework</p>
                  <p className="text-xs text-muted-foreground">LangChain</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm">Frontend</p>
                  <p className="text-xs text-muted-foreground">Next.js + shadcn</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Controls */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Upload Resume</CardTitle>
                  <CardDescription>
                    Upload a PDF resume to analyze (max 16MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResumeUpload
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    onClear={() => setSelectedFile(null)}
                    disabled={loading}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Job Description (Optional)</CardTitle>
                  <CardDescription>
                    Add a job description for tailored scoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description here for better matching..."
                    className="w-full min-h-[150px] p-3 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </Button>
                {analysis && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    disabled={loading}
                  >
                    Reset
                  </Button>
                )}
              </div>

              {error && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-semibold text-destructive">Error</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Results */}
            <div>
              {analysis ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold">Analysis Results</h3>
                    <p className="text-muted-foreground">
                      AI-generated insights for your resume
                    </p>
                  </div>
                  <ScoringResults analysis={analysis} />
                </>
              ) : (
                <Card className="h-full flex items-center justify-center border-2 border-dashed">
                  <CardContent className="text-center py-12">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Upload a PDF resume and click "Analyze Resume" to see AI-powered
                      insights and recommendations
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* API Documentation Link */}
          <Card className="mt-8 bg-muted/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Interested in the API?</p>
                  <p className="text-sm text-muted-foreground">
                    This is a fully functional REST API. Check out the documentation and source code.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="https://job-match-api-998y.onrender.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    API Docs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Flask, Google Gemini AI, LangChain, Next.js, and shadcn/ui</p>
          <p className="mt-2">Portfolio Project - Demonstrating Full-Stack Development & AI Integration</p>
        </div>
      </footer>
    </div>
  )
}
