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
  Download,
  Share2,
  BarChart3,
  Sparkles,
  ArrowRight,
  Briefcase,
  UserCheck,
  Zap,
} from 'lucide-react'
import { JobMatchBadge } from './job-match-badge'
import { ATSScoreCard } from './ats-score-card'
import { ResumeChat } from './resume-chat'

interface ResultsTabsProps {
  analysis: ResumeAnalysis
  onReset: () => void
}

type TabType = 'overview' | 'suggestions' | 'breakdown' | 'detailed' | 'ats' | 'match' | 'chat'

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
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'suggestions' as const, label: 'Suggestions', icon: Lightbulb },
    { id: 'chat' as const, label: 'AI Chat', icon: Sparkles },
    { id: 'breakdown' as const, label: 'Breakdown', icon: Target },
    { id: 'detailed' as const, label: 'Insights', icon: TrendingUp },
    { id: 'ats' as const, label: 'ATS', icon: Shield },
    ...(job_match_score ? [{ id: 'match' as const, label: 'Job Match', icon: CheckCircle2 }] : []),
  ]

  return (
    <div className="w-full">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
        {/* Top Header with Analyze Another Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base sm:text-lg font-bold">Resume Analysis</h2>
          <Button variant="default" size="sm" onClick={onReset} className="h-8 text-xs">
            Analyze Another
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto">
          <div className="flex gap-0.5 sm:gap-1 min-w-max px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b-2 transition-all whitespace-nowrap text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'suggestions' && <SuggestionsTab analysis={analysis} />}
        {activeTab === 'chat' && <ResumeChat analysis={analysis} sessionId={`session-${Date.now()}`} />}
        {activeTab === 'breakdown' && <BreakdownTab analysis={analysis} />}
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
  const { overall_score, ats_score, job_match_score } = analysis

  // Calculate predictive percentages based on scores
  const calculateInterviewChance = () => {
    const baseScore = overall_score * 0.4 + ats_score * 0.6
    const jobMatchBonus = job_match_score ? job_match_score * 0.15 : 0
    const total = Math.min(95, Math.round(baseScore + jobMatchBonus))
    return Math.max(5, total)
  }

  const calculateHiringChance = () => {
    const interviewChance = calculateInterviewChance()
    const reduction = job_match_score ? 15 : 25
    return Math.max(3, Math.round(interviewChance - reduction))
  }

  const interviewChance = calculateInterviewChance()
  const hiringChance = calculateHiringChance()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Score Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-4xl font-bold ${getScoreColor(overall_score)}`}>
                {overall_score}
              </div>
              <span className="text-muted-foreground">/100</span>
            </div>
            <p className={`text-sm font-medium mt-2 ${getScoreColor(overall_score)}`}>
              {getScoreLabel(overall_score)}
            </p>
            <Progress value={overall_score} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className={`text-4xl font-bold ${getScoreColor(ats_score)}`}>
                {ats_score}
              </div>
              <span className="text-muted-foreground">/100</span>
            </div>
            <p className={`text-sm font-medium mt-2 ${getScoreColor(ats_score)}`}>
              {getScoreLabel(ats_score)}
            </p>
            <Progress value={ats_score} className="mt-4 h-2" />
          </CardContent>
        </Card>

        {job_match_score !== undefined && job_match_score !== null ? (
          <Card className="border shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Job Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className={`text-4xl font-bold ${getScoreColor(job_match_score)}`}>
                  {job_match_score}
                </div>
                <span className="text-muted-foreground">%</span>
              </div>
              <p className={`text-sm font-medium mt-2 ${getScoreColor(job_match_score)}`}>
                {getScoreLabel(job_match_score)}
              </p>
              <Progress value={job_match_score} className="mt-4 h-2" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add a job description to see tailored matching insights and improve prediction accuracy
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Predictive Analysis */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Predictive Analysis
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            AI-powered predictions based on your resume scores and industry data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-full bg-blue-500/10 flex-shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Interview Chance</p>
                  <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                    <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(interviewChance)}`}>
                      {interviewChance}%
                    </span>
                  </div>
                </div>
              </div>
              <Progress value={interviewChance} className="h-1.5 sm:h-2" />
              <p className="text-xs text-muted-foreground">
                Likelihood of getting an interview callback with this resume
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-full bg-green-500/10 flex-shrink-0">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Hiring Chance</p>
                  <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                    <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(hiringChance)}`}>
                      {hiringChance}%
                    </span>
                  </div>
                </div>
              </div>
              <Progress value={hiringChance} className="h-1.5 sm:h-2" />
              <p className="text-xs text-muted-foreground">
                Estimated chance of receiving a job offer based on current resume quality
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SuggestionsTab({ analysis }: { analysis: ResumeAnalysis }) {
  const { recommendations } = analysis

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            AI-Powered Suggestions
          </CardTitle>
          <CardDescription>
            Actionable recommendations to improve your resume based on our analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{rec}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BreakdownTab({ analysis }: { analysis: ResumeAnalysis }) {
  const { section_scores } = analysis

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Section Breakdown
        </CardTitle>
        <CardDescription>Performance across different resume categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(section_scores).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{category}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DetailedTab({ analysis }: { analysis: ResumeAnalysis }) {
  const { strengths, weaknesses } = analysis

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {strengths.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="w-5 h-5" />
              Strengths
            </CardTitle>
            <CardDescription>What your resume does well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {weaknesses.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <TrendingDown className="w-5 h-5" />
              Areas to Improve
            </CardTitle>
            <CardDescription>Opportunities for enhancement</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
