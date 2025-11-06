"use client"

import { useRef, useState, useEffect, type ChangeEvent } from 'react'
import { ResultsTabs } from '@/components/results-tabs'
import { LoadingScreen } from '@/components/loading-screen'
import { ApiWakeLoading } from '@/components/api-wake-loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { analyzeResumeWithProgress, checkHealth, ResumeAnalysis, ProgressUpdate } from '@/lib/api'
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
  Briefcase,
} from 'lucide-react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate | null>(null)
  const [jobDescriptionDialogOpen, setJobDescriptionDialogOpen] = useState(false)
  const [isWakingApi, setIsWakingApi] = useState(false)
  const [apiCheckedOnLoad, setApiCheckedOnLoad] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Check API health when page loads
  useEffect(() => {
    const checkApiOnLoad = async () => {
      try {
        await checkHealth()
        console.log('API health check on page load: healthy')
        setApiCheckedOnLoad(true)
      } catch (err) {
        console.log('API health check on page load: failed, will retry when user clicks button')
        setApiCheckedOnLoad(false)
      }
    }

    checkApiOnLoad()
  }, [])

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

    console.log('[handleAnalyze] Starting analysis', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      hasJobDescription: Boolean(jobDescription.trim()),
    })

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
      console.log('[handleAnalyze] Analysis complete, updating UI', {
        overallScore: result?.overall_score,
        atsScore: result?.ats_score,
      })
      setAnalysis(result)
      setShowUpload(false)
      setJobDescriptionDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
      console.error('Analysis error:', err)
    } finally {
      console.log('[handleAnalyze] Cleaning up after analysis')
      setLoading(false)
      setProgressUpdate(null)
    }
  }

  const clearUploadForm = () => {
    setSelectedFile(null)
    setJobDescription('')
    setError(null)
    setJobDescriptionDialogOpen(false)
  }

  const handleReset = () => {
    clearUploadForm()
    setAnalysis(null)
    setShowUpload(true) // Go back to upload page, not landing page
  }

  const handleGetStarted = async () => {
    setIsWakingApi(true)
    setError(null)

    try {
      // Check if API is healthy (backup check in case initial check failed)
      await checkHealth()
      // API is ready, proceed to upload screen
      setShowUpload(true)
      setJobDescriptionDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to API server')
      console.error('API health check error:', err)
    } finally {
      setIsWakingApi(false)
    }
  }

  // API Wake Loading State
  if (isWakingApi) {
    return <ApiWakeLoading />
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 animate-in fade-in duration-500">
        <ResultsTabs analysis={analysis} onReset={handleReset} />
      </div>
    )
  }

  // Upload State
  if (showUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2 shadow-xl animate-in slide-in-from-bottom duration-500">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold">Upload Resume</h1>
                <p className="text-sm text-muted-foreground">Get AI-powered feedback in 30 seconds</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUpload(false)
                  setJobDescriptionDialogOpen(false)
                }}
                className="gap-2 group"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back</span>
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
                className="w-full gap-2 h-12 text-base hover:scale-105 transition-transform"
                disabled={loading}
              >
                <Upload className="h-5 w-5" />
                {selectedFile ? 'Replace Resume' : 'Upload Resume'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">PDF files only, max 10MB</p>
              {selectedFile && (
                <div className="flex items-center justify-between rounded-lg border-2 bg-muted/40 p-3 animate-in slide-in-from-top duration-300">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={loading}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Dialog open={jobDescriptionDialogOpen} onOpenChange={setJobDescriptionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    disabled={loading}
                  >
                    <Briefcase className="h-4 w-4" />
                    {jobDescription ? 'Edit Job Description' : 'Add Job Description (Optional)'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Job Description</DialogTitle>
                    <DialogDescription>
                      Paste the job description to get tailored resume analysis and matching insights.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      className="min-h-[200px] resize-none"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setJobDescription('')
                        setJobDescriptionDialogOpen(false)
                      }}
                      disabled={loading}
                    >
                      Clear
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setJobDescriptionDialogOpen(false)}
                      disabled={loading}
                    >
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {jobDescription && (
                <div className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground animate-in fade-in duration-300">
                  ✓ Job description added ({jobDescription.split(' ').length} words)
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 animate-in slide-in-from-top duration-300">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="w-full gap-2 h-12 text-base font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                Analyze Resume
                <ChevronRight className="h-5 w-5" />
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Resume Insight AI</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  by Kyle Mirich
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://kyle-mirich.vercel.app" target="_blank" rel="noopener noreferrer">
                  Portfolio
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/kyle-mirich/job-match-api" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16 lg:py-20 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border bg-muted/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Portfolio Project by Kyle Mirich</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
              AI-Powered Resume Analysis
              <br />
              <span className="text-primary">Built with Modern Tech</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-4">
              A full-stack application demonstrating AI integration, real-time processing, and modern web development.
              Upload a resume to see Google Gemini AI analyze it in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleGetStarted} 
                size="lg" 
                className="gap-2"
              >
                Try the Demo
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                asChild
              >
                <a href="https://github.com/kyle-mirich/job-match-api" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Source Code
                </a>
              </Button>
            </div>
          </div>

          {/* Tech Stack */}
          <Card className="border mb-14 sm:mb-18 md:mb-24 lg:mb-28">
            <CardHeader>
              <CardTitle>Tech Stack</CardTitle>
              <CardDescription>Technologies used in this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h4 className="font-semibold mb-2">Frontend</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Next.js 14</li>
                    <li>• React 18</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• shadcn/ui</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backend</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Python Flask</li>
                    <li>• RESTful API</li>
                    <li>• PyPDF2</li>
                    <li>• CORS</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI/ML</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Google Gemini AI</li>
                    <li>• LangChain</li>
                    <li>• NLP Processing</li>
                    <li>• Real-time Analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• PDF Parsing</li>
                    <li>• ATS Scoring</li>
                    <li>• Job Matching</li>
                    <li>• AI Suggestions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border">
              <CardContent className="p-6">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered resume scoring with detailed breakdowns across multiple categories
                </p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-6">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">ATS Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Check compatibility with Applicant Tracking Systems used by employers
                </p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-6">
                <Brain className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Actionable Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get specific recommendations to improve your resume's effectiveness
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium">Kyle Mirich</p>
              <p className="text-xs text-muted-foreground">Full-Stack Developer</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://kyle-mirich.vercel.app" target="_blank" rel="noopener noreferrer">
                  Portfolio
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com/kyle-mirich/job-match-api" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
