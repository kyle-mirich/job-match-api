"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, FileText, Brain, CheckCircle, Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  stage?: 'upload' | 'extracting' | 'analyzing' | 'complete'
  progress?: number
  message?: string
  currentStage?: 'decoding' | 'extracting' | 'validating' | 'ats_analysis' | 'ai_analysis' | 'finalizing' | 'complete'
}

export function LoadingScreen({
  stage = 'analyzing',
  progress: externalProgress,
  message: externalMessage,
  currentStage
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [message, setMessage] = useState('Analyzing your resume...')

  const steps = [
    { icon: FileText, label: 'Reading PDF', description: 'Extracting text from your resume', stage: 'extracting' },
    { icon: Brain, label: 'ATS Analysis', description: 'Checking compatibility with tracking systems', stage: 'ats_analysis' },
    { icon: Sparkles, label: 'AI Analysis', description: 'Generating insights with Google Gemini', stage: 'ai_analysis' },
    { icon: CheckCircle, label: 'Finalizing', description: 'Preparing your results', stage: 'finalizing' },
  ]

  // Update progress when external progress is provided
  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
    }
  }, [externalProgress])

  // Update message when external message is provided
  useEffect(() => {
    if (externalMessage) {
      setMessage(externalMessage)
    }
  }, [externalMessage])

  // Update current step based on stage
  useEffect(() => {
    if (currentStage) {
      const stageToStep: Record<string, number> = {
        'decoding': 0,
        'extracting': 0,
        'validating': 0,
        'ats_analysis': 1,
        'ai_analysis': 2,
        'finalizing': 3,
        'complete': 3
      }
      setCurrentStep(stageToStep[currentStage] || 0)
    }
  }, [currentStage])

  // Fallback animation when no external progress provided
  useEffect(() => {
    if (externalProgress === undefined) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [externalProgress])

  // Fallback step animation when no external stage provided
  useEffect(() => {
    if (!currentStage) {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length)
      }, 2500)

      return () => clearInterval(stepInterval)
    }
  }, [currentStage, steps.length])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 shadow-2xl">
        <CardContent className="p-8 md:p-12">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-primary/10 p-6 rounded-full">
                <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-primary animate-spin" />
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Analyzing Your Resume
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            {message}
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep || progress === 100

              return (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary/20 scale-105'
                      : 'bg-muted/30'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                      isComplete
                        ? 'bg-green-100 dark:bg-green-950'
                        : isActive
                        ? 'bg-primary/20'
                        : 'bg-muted'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm md:text-base transition-colors ${
                        isActive ? 'text-primary' : ''
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Fun Fact */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs md:text-sm text-center text-muted-foreground">
              💡 <span className="font-semibold">Did you know?</span> 75% of resumes are rejected by
              ATS before reaching a human recruiter
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
