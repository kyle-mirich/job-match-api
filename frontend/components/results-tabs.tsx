"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ResumeAnalysis, getScoreColor, getScoreLabel } from '@/lib/api'
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Share2,
  BarChart3,
} from 'lucide-react'
import { JobMatchBadge } from './job-match-badge'
import { ATSScoreCard } from './ats-score-card'

interface ResultsTabsProps {
  analysis: ResumeAnalysis
  onReset: () => void
}

type TabType = 'overview' | 'detailed' | 'ats' | 'match'

export function ResultsTabs({ analysis, onReset }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

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
    recommendations,
  } = analysis

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'detailed' as TabType, label: 'Detailed Analysis', icon: Target },
    { id: 'ats' as TabType, label: 'ATS Check', icon: Shield },
    ...(job_match_score ? [{ id: 'match' as TabType, label: 'Job Match', icon: CheckCircle2 }] : []),
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Analysis Complete</h2>
          <p className="text-muted-foreground mt-1">Review your resume insights below</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="default" size="sm" onClick={onReset}>
            Analyze Another
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'detailed' && <DetailedTab analysis={analysis} />}
        {activeTab === 'ats' && (
          <ATSScoreCard
            atsScore={ats_score}
            atsIssues={ats_issues}
            atsRecommendations={ats_recommendations}
          />
        )}
        {activeTab === 'match' && job_match_score && (
          <JobMatchBadge jobMatchScore={job_match_score} missingKeywords={missing_keywords} />
        )}
      </div>
    </div>
  )
}

function OverviewTab({ analysis }: { analysis: ResumeAnalysis }) {
  const { overall_score, section_scores, ats_score, job_match_score } = analysis

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Overall Score */}
      <Card className="border-2 col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Overall Score</CardTitle>
          <CardDescription>Your resume's total rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`text-6xl font-bold ${getScoreColor(overall_score)}`}>
              {overall_score}
            </div>
            <p className={`text-xl font-semibold mt-2 ${getScoreColor(overall_score)}`}>
              {getScoreLabel(overall_score)}
            </p>
            <Progress value={overall_score} className="w-full mt-4 h-3" />
          </div>
        </CardContent>
      </Card>

      {/* ATS Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            ATS Score
          </CardTitle>
          <CardDescription>Tracking system compatibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`text-5xl font-bold ${getScoreColor(ats_score)}`}>{ats_score}</div>
            <p className={`text-lg font-semibold mt-2 ${getScoreColor(ats_score)}`}>
              {getScoreLabel(ats_score)}
            </p>
            <Progress value={ats_score} className="w-full mt-4 h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Job Match Score */}
      {job_match_score !== undefined && job_match_score !== null && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Job Match
            </CardTitle>
            <CardDescription>Alignment with job description</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className={`text-5xl font-bold ${getScoreColor(job_match_score)}`}>
                {job_match_score}%
              </div>
              <p className={`text-lg font-semibold mt-2 ${getScoreColor(job_match_score)}`}>
                {getScoreLabel(job_match_score)}
              </p>
              <Progress value={job_match_score} className="w-full mt-4 h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Scores */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Section Breakdown
          </CardTitle>
          <CardDescription>Performance across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailedTab({ analysis }: { analysis: ResumeAnalysis }) {
  const { strengths, weaknesses, recommendations } = analysis

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Strengths */}
      {strengths.length > 0 && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="w-5 h-5" />
              Key Strengths ({strengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
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
              Areas for Improvement ({weaknesses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Lightbulb className="w-5 h-5" />
              Actionable Recommendations ({recommendations.length})
            </CardTitle>
            <CardDescription>Follow these steps to improve your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-4 sm:grid-cols-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg border">
                  <Badge variant="default" className="mt-0.5 flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm flex-1">{rec}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
