"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ResumeAnalysis, getScoreColor, getScoreLabel } from '@/lib/api'
import { TrendingUp, TrendingDown, Lightbulb, Target, Code } from 'lucide-react'
import { JobMatchBadge } from './job-match-badge'
import { ATSScoreCard } from './ats-score-card'

interface ScoringResultsProps {
  analysis: ResumeAnalysis
}

export function ScoringResults({ analysis }: ScoringResultsProps) {
  const {
    overall_score,
    section_scores,
    job_match_score,
    missing_keywords,
    ats_score,
    ats_issues,
    ats_recommendations,
    strengths,
    weaknesses,
    recommendations
  } = analysis

  // Debug log to see what data we're receiving
  console.log('Scoring Results Analysis:', {
    overall_score,
    ats_score,
    ats_issues,
    ats_recommendations,
    job_match_score,
    missing_keywords
  })

  return (
    <div className="space-y-6">
      {/* Job Match Score - Only show when job description was provided */}
      {job_match_score !== undefined && job_match_score !== null && (
        <JobMatchBadge
          jobMatchScore={job_match_score}
          missingKeywords={missing_keywords}
        />
      )}

      {/* Overall Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Score</span>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {overall_score}/100
            </Badge>
          </CardTitle>
          <CardDescription>
            Your resume scored {getScoreLabel(overall_score).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={overall_score} className="h-6" />
            <p className={`text-sm font-medium ${getScoreColor(overall_score)}`}>
              {getScoreLabel(overall_score)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Detailed Breakdown
          </CardTitle>
          <CardDescription>
            Performance across different categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(section_scores).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{category}</span>
                <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                  {score}/100
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ATS Compatibility Score */}
      <ATSScoreCard
        atsScore={ats_score}
        atsIssues={ats_issues}
        atsRecommendations={ats_recommendations}
      />

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="w-5 h-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <TrendingDown className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Lightbulb className="w-5 h-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Actionable steps to improve your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-sm flex-1">{rec}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* API Info */}
      <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <Code className="w-5 h-5" />
            Powered by AI API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This analysis was generated using a custom-built Flask API powered by:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit">Google Gemini AI</Badge>
              <p className="text-xs text-muted-foreground">LLM Model</p>
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit">LangChain</Badge>
              <p className="text-xs text-muted-foreground">AI Framework</p>
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit">Flask + Python</Badge>
              <p className="text-xs text-muted-foreground">Backend API</p>
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit">pdfplumber</Badge>
              <p className="text-xs text-muted-foreground">PDF Extraction</p>
            </div>
          </div>
          {analysis.metadata && (
            <div className="pt-3 border-t text-xs text-muted-foreground">
              <p>Resume: {analysis.metadata.resume_length_words} words, {analysis.metadata.resume_length_chars} characters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
