"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Server } from 'lucide-react'

interface ApiWakeLoadingProps {
  onComplete?: () => void
  onError?: (error: string) => void
}

export function ApiWakeLoading({ onComplete, onError }: ApiWakeLoadingProps) {
  const [dots, setDots] = useState('')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    // Track elapsed time
    const timeInterval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const getMessage = () => {
    if (elapsed < 10) {
      return 'Waking up the API server'
    } else if (elapsed < 30) {
      return 'Server is starting up, please wait'
    } else if (elapsed < 50) {
      return 'This may take up to a minute on first load'
    } else {
      return 'Almost there, just a few more moments'
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto z-50">
      <Card className="w-full max-w-sm sm:max-w-md border-2 shadow-2xl my-4">
        <CardContent className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-full shadow-lg">
                <Server className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-center mb-3">
            Starting API Server
          </h2>

          <p className="text-center text-muted-foreground mb-6 text-sm sm:text-base">
            {getMessage()}{dots}
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">
              {elapsed}s elapsed
            </span>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              <span className="font-semibold">💡 Why the wait?</span>
              <br />
              The API is hosted on a free tier that goes to sleep after periods of inactivity.
              First load may take up to 60 seconds.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
