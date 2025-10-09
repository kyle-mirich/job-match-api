"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle2, Lightbulb, Info } from 'lucide-react'
import { useState } from 'react'

interface ATSScoreCardProps {
  atsScore: number
  atsIssues: string[]
  atsRecommendations: string[]
}

function getATSColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-500'
}

function getATSLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Very Good'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fair'
  return 'Needs Improvement'
}

function getATSBgColor(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200 dark:bg-green-950/20'
  if (score >= 60) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20'
  return 'bg-red-50 border-red-200 dark:bg-red-950/20'
}

function getATSTextColor(score: number): string {
  if (score >= 80) return 'text-green-700 dark:text-green-400'
  if (score >= 60) return 'text-yellow-700 dark:text-yellow-400'
  return 'text-red-700 dark:text-red-400'
}

export function ATSScoreCard({ atsScore, atsIssues, atsRecommendations }: ATSScoreCardProps) {
  const [showInfo, setShowInfo] = useState(false)

  // Handle undefined/null arrays and score
  const issues = atsIssues || []
  const recommendations = atsRecommendations || []
  const score = atsScore ?? 0  // Default to 0 if undefined

  // Debug log
  console.log('ATS Score Card Props:', { atsScore, score, atsIssues, atsRecommendations })

  return (
    <Card className={`border-2 ${getATSBgColor(score)}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getATSTextColor(score)}`}>
          <Shield className="w-6 h-6" />
          ATS Compatibility Score
        </CardTitle>
        <CardDescription>
          How well your resume works with Applicant Tracking Systems
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Info className="w-3 h-3" />
            Why this matters
          </button>
        </CardDescription>
        {showInfo && (
          <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
            <p>
              <strong>Applicant Tracking Systems (ATS)</strong> are software used by 75% of employers to scan and rank resumes.
              A low ATS score means your resume may be rejected before a human ever sees it, even if you're qualified.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ATS Score Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-4xl font-bold ${getATSColor(score)}`}>
              {score}/100
            </div>
            <p className={`text-sm font-medium mt-1 ${getATSColor(score)}`}>
              {getATSLabel(score)}
            </p>
          </div>
          <div className="flex-1 ml-6">
            <Progress value={score} className="h-3" />
          </div>
        </div>

        {/* Perfect Score Message */}
        {score >= 90 && issues.length === 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 rounded-md">
            <div className="flex items-start gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Excellent ATS Compatibility!</p>
                <p className="text-xs mt-1">
                  Your resume follows ATS best practices and should parse correctly through most systems.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Issues Section */}
        {issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-sm">Detected Issues ({issues.length})</h4>
            </div>
            <ul className="space-y-2">
              {issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-0.5">▸</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-sm">How to Fix</h4>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Message */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {score >= 80 ? (
              'Your resume should pass through most ATS systems successfully.'
            ) : score >= 60 ? (
              'Your resume may have some parsing issues in certain ATS systems. Consider the recommendations above.'
            ) : (
              'Your resume is likely to have significant parsing issues with ATS. We strongly recommend addressing the issues above.'
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
