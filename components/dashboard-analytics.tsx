"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Activity, Target, Zap, Brain, Heart, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Project } from "@/components/project-dashboard"

interface DashboardAnalyticsProps {
  projects: Project[]
  userRole: string
}

interface WeeklyInsight {
  type: "achievement" | "concern" | "opportunity" | "reflection"
  title: string
  description: string
  actionable?: string
  icon: any
  color: string
}

interface EngagementMetrics {
  activeEngagement: number
  passiveActivity: number
  totalProjects: number
  completionRate: number
  averageProjectDuration: number
  weeklyActivity: number
}

export function DashboardAnalytics({ projects, userRole }: DashboardAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter">("week")

  // Calculate engagement metrics
  const engagementMetrics = useMemo((): EngagementMetrics => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentlyActive = projects.filter((p) => p.lastActivity >= weekAgo)
    const completed = projects.filter((p) => p.status === "completed")
    const totalDuration = projects.reduce((acc, p) => {
      const duration = Math.floor((p.lastActivity.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      return acc + Math.max(duration, 1)
    }, 0)

    // Simulate engagement vs passivity (in real app, this would track actual user interactions)
    const activeEngagement = Math.min(recentlyActive.length * 15 + Math.random() * 20, 100)
    const passiveActivity = Math.max(100 - activeEngagement - Math.random() * 10, 0)

    return {
      activeEngagement,
      passiveActivity,
      totalProjects: projects.length,
      completionRate: projects.length > 0 ? (completed.length / projects.length) * 100 : 0,
      averageProjectDuration: projects.length > 0 ? totalDuration / projects.length : 0,
      weeklyActivity: recentlyActive.length,
    }
  }, [projects])

  // Generate weekly insights
  const weeklyInsights = useMemo((): WeeklyInsight[] => {
    const insights: WeeklyInsight[] = []
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const activeProjects = projects.filter((p) => p.status === "active")
    const recentlyActive = projects.filter((p) => p.lastActivity >= weekAgo)
    const staleProjects = activeProjects.filter((p) => p.lastActivity < weekAgo)
    const completedThisWeek = projects.filter((p) => p.status === "completed" && p.lastActivity >= weekAgo)

    // Achievement insights
    if (completedThisWeek.length > 0) {
      insights.push({
        type: "achievement",
        title: `Completed ${completedThisWeek.length} project${completedThisWeek.length > 1 ? "s" : ""}!`,
        description: `You finished: ${completedThisWeek.map((p) => p.title).join(", ")}`,
        icon: CheckCircle,
        color: "text-chart-5",
      })
    }

    if (recentlyActive.length > activeProjects.length * 0.7) {
      insights.push({
        type: "achievement",
        title: "High engagement week!",
        description: `You actively worked on ${recentlyActive.length} projects this week`,
        icon: Zap,
        color: "text-primary",
      })
    }

    // Concern insights
    if (staleProjects.length > 2) {
      insights.push({
        type: "concern",
        title: `${staleProjects.length} projects need attention`,
        description: "Some active projects haven't been touched in over a week",
        actionable: "Consider reflecting on these projects or pausing them intentionally",
        icon: AlertTriangle,
        color: "text-accent",
      })
    }

    if (engagementMetrics.passiveActivity > 60) {
      insights.push({
        type: "concern",
        title: "Low hands-on engagement detected",
        description: "You might be relying too heavily on automated tools",
        actionable: "Try doing one task manually to reconnect with your work",
        icon: Brain,
        color: "text-accent",
      })
    }

    // Opportunity insights
    if (activeProjects.length < 3 && projects.length > 5) {
      insights.push({
        type: "opportunity",
        title: "Room for more active projects",
        description: "You have capacity to revive some paused projects",
        actionable: "Review your paused projects for potential revival",
        icon: TrendingUp,
        color: "text-chart-2",
      })
    }

    // Reflection insights
    if (projects.length > 0 && completedThisWeek.length === 0 && recentlyActive.length < 2) {
      insights.push({
        type: "reflection",
        title: "Quiet creative week",
        description: "Sometimes rest is part of the creative process",
        actionable: "Consider what would make your projects more engaging",
        icon: Heart,
        color: "text-muted-foreground",
      })
    }

    return insights.slice(0, 4) // Limit to 4 insights
  }, [projects, engagementMetrics])

  // Prepare momentum data
  const momentumData = useMemo(() => {
    const data = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]

      // Simulate daily momentum (in real app, track actual interactions)
      const projectsWorkedOn = projects.filter((p) => {
        const activityDate = p.lastActivity.toISOString().split("T")[0]
        return activityDate === dateKey
      }).length

      const momentum = Math.min(projectsWorkedOn * 20 + Math.random() * 30, 100)

      data.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        momentum: Math.round(momentum),
        projects: projectsWorkedOn,
      })
    }

    return data
  }, [projects])

  const agencyScore = Math.round(engagementMetrics.activeEngagement)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Creative Analytics</h2>
        <p className="text-muted-foreground">Insights into your project engagement, momentum, and creative patterns</p>
      </div>

      {/* Weekly Pulse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Pulse Check
          </CardTitle>
          <CardDescription>Your creative journey this week at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{engagementMetrics.weeklyActivity}</div>
              <div className="text-sm text-muted-foreground">Projects Touched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-5">{Math.round(engagementMetrics.completionRate)}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(engagementMetrics.averageProjectDuration)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Days/Project</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-2">{agencyScore}%</div>
              <div className="text-sm text-muted-foreground">Agency Score</div>
            </div>
          </div>

          {/* Weekly Insights */}
          {weeklyInsights.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">This Week's Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weeklyInsights.map((insight, index) => {
                  const Icon = insight.icon
                  return (
                    <div key={index} className="p-3 rounded-lg border bg-card/50">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm">{insight.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                          {insight.actionable && (
                            <p className="text-xs text-primary mt-2 font-medium">{insight.actionable}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agency Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Agency Tracker
            </CardTitle>
            <CardDescription>How actively engaged are you vs. relying on automation?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Active Engagement</span>
                  <span className="font-medium">{agencyScore}%</span>
                </div>
                <Progress value={agencyScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Hands-on work, original thinking, manual tasks</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tool Assistance</span>
                  <span className="font-medium">{Math.round(engagementMetrics.passiveActivity)}%</span>
                </div>
                <Progress value={engagementMetrics.passiveActivity} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">AI help, automation, delegated tasks</p>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg mt-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Balance is key:</strong> Tools should enhance your creativity, not replace your thinking. Aim
                  for 60-80% active engagement to stay connected to your work.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Momentum Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Creative Momentum
            </CardTitle>
            <CardDescription>Your engagement energy over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={momentumData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "momentum" ? `${value}% momentum` : `${value} projects`,
                    name === "momentum" ? "Momentum" : "Projects",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="momentum"
                  stroke="#a16207"
                  strokeWidth={2}
                  dot={{ fill: "#a16207", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Current momentum:{" "}
                <span className="font-medium text-primary">
                  {momentumData[momentumData.length - 1]?.momentum || 0}%
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>Based on your patterns and {userRole} focus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agencyScore < 50 && (
              <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  Increase Hands-On Work
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Try doing one task manually today to reconnect with your creative process.
                </p>
                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                  Find Manual Task
                </Button>
              </div>
            )}

            {engagementMetrics.weeklyActivity < 2 && (
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Boost Weekly Activity
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Aim to touch at least 3 projects per week to maintain momentum.
                </p>
                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                  Pick Quick Task
                </Button>
              </div>
            )}

            {engagementMetrics.completionRate < 20 && projects.length > 3 && (
              <div className="p-4 rounded-lg border border-chart-5/20 bg-chart-5/5">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-5" />
                  Focus on Completion
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Consider focusing on fewer projects to increase your completion rate.
                </p>
                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                  Review Projects
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
