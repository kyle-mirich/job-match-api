"use client"

import { useState } from 'react'
import { ResumeUpload } from '@/components/resume-upload'
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
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate | null>(null)

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
      setProgressUpdate(null)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setJobDescription('')
    setAnalysis(null)
    setError(null)
    setShowUpload(false)
  }

  const handleGetStarted = () => {
    setShowUpload(true)
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
        {/* Compact Header */}
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <Button variant="ghost" onClick={() => setShowUpload(false)} size="sm" className="gap-2">
                â† Back
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Step 1 of 2</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-5xl">
            <div className="grid lg:grid-cols-[1fr,300px] gap-6">
              {/* Left: Upload Form */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Upload Your Resume</h1>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered insights in 30 seconds
                  </p>
                </div>

                <Card className="border-2">
                  <CardContent className="p-4 md:p-6 space-y-4">
                    {/* Resume Upload */}
                    <div>
                      <label className="block text-xs font-semibold mb-2">
                        Resume (PDF) *
                      </label>
                      <ResumeUpload
                        onFileSelect={setSelectedFile}
                        selectedFile={selectedFile}
                        onClear={() => setSelectedFile(null)}
                        disabled={loading}
                      />
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="block text-xs font-semibold mb-2">
                        Job Description (Optional)
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste job description for tailored analysis..."
                        className="w-full h-[120px] p-3 text-sm rounded-lg border-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        disabled={loading}
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-destructive">{error}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || loading}
                      className="w-full h-11 gap-2"
                      size="lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      Analyze Resume
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Features */}
              <div className="hidden lg:block space-y-3">
                <h3 className="text-sm font-semibold mb-3">What You'll Get:</h3>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs">Job Match Score</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          See alignment with job requirements
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs">ATS Check</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ensure tracking system compatibility
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs">AI Insights</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Get actionable recommendations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
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
