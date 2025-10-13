"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  stage?: 'upload' | 'extract' | 'analyze' | 'complete'
  progress?: number
  message?: string
  currentStage?: 'decoding' | 'extracting' | 'validating' | 'ats_analysis' | 'ai_analysis' | 'finalizing' | 'complete'
}

export function LoadingScreen({
  stage = 'analyze',
  progress: externalProgress,
  message: externalMessage,
  currentStage,
}: LoadingScreenProps) {
  const [message, setMessage] = useState(externalMessage ?? 'Analyzing your resume...')
  const [progress, setProgress] = useState<number | null>(externalProgress ?? null)

  useEffect(() => {
    console.log('[LoadingScreen] update', {
      stage,
      externalProgress,
      externalMessage,
      currentStage,
    })
  }, [stage, externalProgress, externalMessage, currentStage])

  useEffect(() => {
    if (externalMessage) {
      setMessage(externalMessage)
    } else {
      setMessage('Analyzing your resume...')
    }
  }, [externalMessage])

  useEffect(() => {
    if (externalProgress === undefined || Number.isNaN(externalProgress)) {
      setProgress(null)
      return
    }
    setProgress(Math.max(0, Math.min(100, externalProgress)))
  }, [externalProgress])

  const stageLabels = useMemo(
    () => ({
      decoding: 'Decoding your PDF...',
      extracting: 'Extracting text from your resume...',
      validating: 'Validating resume content...',
      ats_analysis: 'Running ATS checks...',
      ai_analysis: 'Generating AI insights...',
      finalizing: 'Finalizing your report...',
      complete: 'Wrapping up...',
    }),
    []
  )

  const statusText = currentStage ? stageLabels[currentStage] ?? 'Processing your resume...' : 'Processing your resume...'

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-sm sm:max-w-md border-2 shadow-2xl my-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-full shadow-lg">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-center mb-1">Analyzing Your Resume</h2>
          <p className="text-center text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">{message}</p>
          <p className="text-center text-[11px] sm:text-xs text-muted-foreground mb-2">{statusText}</p>

          {progress !== null ? (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 sm:h-2" />
            </div>
          ) : (
            <div className="mb-3 h-2 rounded-full bg-muted animate-pulse" />
          )}

          <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-muted/50 rounded-lg border">
            <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
              💡 <span className="font-semibold">Tip:</span> Keep this tab open while we score your resume.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
