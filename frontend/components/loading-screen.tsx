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
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-sm sm:max-w-md border-2 shadow-2xl my-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-center mb-2 sm:mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 p-2 sm:p-3 rounded-full shadow-lg">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
              </div>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-center mb-1">
            Analyzing Your Resume
          </h2>
          <p className="text-center text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">
            {message}
          </p>

          <div className="mb-2 sm:mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 sm:h-2" />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep || progress === 100

              return (
                <div
                  key={index}
                  className={`flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 border-2 border-primary/20 shadow-lg'
                      : 'bg-muted/30 border-2 border-transparent'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 p-1 rounded-full transition-all duration-300 ${
                      isComplete
                        ? 'bg-green-100 dark:bg-green-950 shadow-md'
                        : isActive
                        ? 'bg-primary/20 shadow-md'
                        : 'bg-muted'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Icon
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-xs transition-colors ${
                        isActive ? 'text-primary' : ''
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-muted/50 rounded-lg border">
            <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
              💡 <span className="font-semibold">Did you know?</span> 75% of resumes are rejected by ATS before reaching a human recruiter
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
