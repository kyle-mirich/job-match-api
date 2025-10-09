"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, CheckCircle2, XCircle } from 'lucide-react'

interface JobMatchBadgeProps {
  jobMatchScore: number
  missingKeywords?: string[]
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-500'
}

function getMatchLabel(score: number): string {
  if (score >= 90) return 'Excellent Match'
  if (score >= 80) return 'Strong Match'
  if (score >= 70) return 'Good Match'
  if (score >= 60) return 'Moderate Match'
  return 'Weak Match'
}

function getMatchBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200 dark:bg-green-950/20'
  if (score >= 60) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20'
  return 'bg-red-50 border-red-200 dark:bg-red-950/20'
}

function getMatchTextColor(score: number): string {
  if (score >= 80) return 'text-green-700 dark:text-green-400'
  if (score >= 60) return 'text-yellow-700 dark:text-yellow-400'
  return 'text-red-700 dark:text-red-400'
}

export function JobMatchBadge({ jobMatchScore, missingKeywords }: JobMatchBadgeProps) {
  // Handle undefined/null arrays
  const keywords = missingKeywords || []

  return (
    <Card className={`border-2 ${getMatchBgColor(jobMatchScore)}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getMatchTextColor(jobMatchScore)}`}>
          <Target className="w-6 h-6" />
          Job Match Score
        </CardTitle>
        <CardDescription>
          How well your resume aligns with the job description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Large Match Percentage */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className={`text-6xl font-bold ${getMatchColor(jobMatchScore)}`}>
              {jobMatchScore}%
            </div>
            <p className={`text-center text-sm font-medium mt-2 ${getMatchColor(jobMatchScore)}`}>
              {getMatchLabel(jobMatchScore)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={jobMatchScore} className="h-4" />
          <p className="text-xs text-muted-foreground text-center">
            {jobMatchScore >= 80 ? 'Your resume closely matches the requirements' :
             jobMatchScore >= 60 ? 'Your resume meets most requirements' :
             'Consider adding more relevant experience or skills'}
          </p>
        </div>

        {/* Missing Keywords Section */}
        {keywords.length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-sm">Missing from Your Resume</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/30"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Consider incorporating these keywords naturally into your resume to improve your match score
            </p>
          </div>
        )}

        {/* Perfect Match Message */}
        {keywords.length === 0 && jobMatchScore >= 90 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <p className="text-sm font-medium">
                Excellent! Your resume includes all key requirements from the job description.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
