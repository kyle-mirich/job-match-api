"use client"

import { useRef, useState, type ChangeEvent } from 'react'
import { ResultsTabs } from '@/components/results-tabs'
import { LoadingScreen } from '@/components/loading-screen'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { analyzeResumeWithProgress, ResumeAnalysis, ProgressUpdate } from '@/lib/api'
import {
  Sparkles,
  Github,
  Target,
  Shield,
  Brain,
  ChevronRight,
  AlertCircle,
  Upload,
  ChevronDown,
  ChevronLeft,
  X,
} from 'lucide-react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate | null>(null)
  const [jobDescriptionExpanded, setJobDescriptionExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
    } else {
      setSelectedFile(file)
    }

    event.target.value = ''
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    setProgressUpdate(null)

    try {
      const result = await analyzeResumeWithProgress(
        selectedFile,
        jobDescription.trim() || undefined,
        (update: ProgressUpdate) => {
          setProgressUpdate(update)
          console.log('Progress update:', update)
        }
      )
      setAnalysis(result)
      setShowUpload(false)
      setJobDescriptionExpanded(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
      setProgressUpdate(null)
    }
  }

  const clearUploadForm = () => {
    setSelectedFile(null)
    setJobDescription('')
    setError(null)
    setJobDescriptionExpanded(false)
  }

  const handleReset = () => {
    clearUploadForm()
    setAnalysis(null)
    setShowUpload(false)
  }

  const handleGetStarted = () => {
    setShowUpload(true)
    setJobDescriptionExpanded(false)
  }

  // Loading State
  if (loading) {
    return (
      <LoadingScreen
        progress={progressUpdate?.progress}
        message={progressUpdate?.message}
        currentStage={progressUpdate?.stage}
      />
    )
  }

  // Results State
  if (analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <ResultsTabs analysis={analysis} onReset={handleReset} />
        </div>
      </div>
    )
  }

  // Upload State
  if (showUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-semibold">Upload Resume</h1>
                <p className="text-sm text-muted-foreground">Get AI-powered feedback in 30 seconds.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUpload(false)
                  setJobDescriptionExpanded(false)
                }}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={loading}
              />
              <Button
                type="button"
                onClick={handleFileButtonClick}
                className="w-full gap-2"
                disabled={loading}
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? 'Replace Resume' : 'Upload Resume'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">PDF files only</p>
              {selectedFile && (
                <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setJobDescriptionExpanded((prev) => !prev)}
                className="w-full justify-between"
                disabled={loading}
              >
                <span className="text-sm">
                  {jobDescription ? 'View / Edit Job Description' : 'Paste Job Description (optional)'}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${jobDescriptionExpanded ? 'rotate-180' : ''}`}
                />
              </Button>
              {jobDescription && !jobDescriptionExpanded && (
                <div className="rounded-md border border-dashed border-muted bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Job description saved. Click to view or edit.
                </div>
              )}
              {jobDescriptionExpanded && (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description for tailored analysis..."
                  className="h-32 w-full resize-none rounded-md border bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="w-full gap-2"
              >
                Analyze Resume
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearUploadForm}
                disabled={loading}
                className="w-full text-sm"
              >
                Clear selections
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  // Landing Page (Hero)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Resume Insight</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  AI-Powered Resume Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Portfolio Demo
              </Badge>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href="https://github.com/kyle-mirich/job-match-api/tree/main" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 text-sm px-4 py-2" variant="outline">
              Powered by Google Gemini AI & LangChain
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Get Your Resume
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Interview-Ready
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Upload your resume and receive instant AI-powered feedback with detailed scoring, ATS
              compatibility check, and actionable recommendations to land more interviews
            </p>
            <Button onClick={handleGetStarted} size="lg" className="h-14 px-8 text-lg gap-2">
              <Sparkles className="w-5 h-5" />
              Analyze Your Resume Free
              <ChevronRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No signup required &bull; Results in 30 seconds &bull; 100% private
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Job Match Score</h3>
                <p className="text-muted-foreground">
                  See exactly how well your resume aligns with job descriptions and discover missing
                  keywords
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">ATS Compatibility</h3>
                <p className="text-muted-foreground">
                  Check if your resume passes Applicant Tracking Systems used by 75% of employers
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Get detailed analysis with strengths, weaknesses, and personalized recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <Card className="bg-muted/50 border-2">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <p className="text-sm text-muted-foreground">Average Score Improvement</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">30sec</div>
                  <p className="text-sm text-muted-foreground">Analysis Time</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">Private & Secure</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Flask, Google Gemini AI, LangChain, Next.js, and shadcn/ui
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Portfolio Project - Demonstrating Full-Stack Development & AI Integration
          </p>
        </div>
      </footer>
    </div>
  )
}
