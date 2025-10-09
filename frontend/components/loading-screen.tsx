"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, FileText, Brain, CheckCircle, Loader2, Shield } from 'lucide-react'

interface LoadingScreenProps {
  stage?: 'upload' | 'extract' | 'analyze' | 'complete'
  progress?: number
  message?: string
  currentStage?: 'decoding' | 'extracting' | 'validating' | 'ats_analysis' | 'ai_analysis' | 'finalizing' | 'complete'
}

export function LoadingScreen({ stage = 'analyze', progress: externalProgress, message: externalMessage, currentStage }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [message, setMessage] = useState('Analyzing your resume...')

  const steps = [
    { icon: FileText, label: 'Reading PDF', description: 'Extracting text from your resume', stage: 'extracting' },
    { icon: Shield, label: 'ATS Check', description: 'Checking for compatibility', stage: 'ats_analysis' },
    { icon: Brain, label: 'AI Analysis', description: 'Generating insights with Google Gemini', stage: 'ai_analysis' },
    { icon: CheckCircle, label: 'Finalizing', description: 'Preparing your results', stage: 'finalizing' },
  ]

  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
    }
  }, [externalProgress])

  useEffect(() => {
    if (externalMessage) {
      setMessage(externalMessage)
    }
  }, [externalMessage])

  useEffect(() => {
    if (currentStage) {
      const stageMap: Record<string, number> = {
        'decoding': 0,
        'extracting': 0,
        'validating': 0,
        'ats_analysis': 1,
        'ai_analysis': 2,
        'finalizing': 3,
        'complete': 3,
      }
      setCurrentStep(stageMap[currentStage] || 0)
    }
  }, [currentStage])

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

  useEffect(() => {
    if (!currentStage) {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length)
      }, 2500)

      return () => clearInterval(stepInterval)
    }
  }, [currentStage, steps.length])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-2 shadow-2xl my-8 scale-90 md:scale-100">
        <CardContent className="p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 p-6 rounded-full shadow-lg">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            Analyzing Your Resume
          </h2>
          <p className="text-center text-muted-foreground mb-6 text-sm">
            {message}
          </p>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep || progress === 100

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary/20 scale-105 shadow-lg'
                      : 'bg-muted/30 border-2 border-transparent'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                      isComplete
                        ? 'bg-green-100 dark:bg-green-950 shadow-md'
                        : isActive
                        ? 'bg-primary/20 shadow-md'
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
                      className={`font-semibold text-sm transition-colors ${
                        isActive ? 'text-primary' : ''
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
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

          <div className="mt-6 p-3 bg-muted/50 rounded-lg border">
            <p className="text-xs text-center text-muted-foreground">
              💡 <span className="font-semibold">Did you know?</span> 75% of resumes are rejected by ATS before reaching a human recruiter
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
