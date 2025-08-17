"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TrendingUp, Activity, Clock, CheckCircle, Pause, Archive } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { Project } from "@/components/project-dashboard"

interface ProjectTimelineProps {
  projects: Project[]
  userRole: string
}

interface TimelineEvent {
  id: string
  projectId: string
  projectTitle: string
  type: "created" | "status_change" | "activity"
  date: Date
  description: string
  status?: Project["status"]
}

const STATUS_COLORS = {
  active: "#a16207",
  paused: "#f59e0b",
  completed: "#0891b2",
  archived: "#6b7280",
}

const STATUS_ICONS = {
  active: Activity,
  paused: Pause,
  completed: CheckCircle,
  archived: Archive,
}

export function ProjectTimeline({ projects, userRole }: ProjectTimelineProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "year">("month")

  // Generate timeline events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = []

    projects.forEach((project) => {
      // Project creation event
      events.push({
        id: `${project.id}-created`,
        projectId: project.id,
        projectTitle: project.title,
        type: "created",
        date: project.createdAt,
        description: `Started "${project.title}"`,
        status: "active",
      })

      // Activity events (simulated based on lastActivity)
      if (project.lastActivity.getTime() !== project.createdAt.getTime()) {
        events.push({
          id: `${project.id}-activity`,
          projectId: project.id,
          projectTitle: project.title,
          type: "activity",
          date: project.lastActivity,
          description: `Updated "${project.title}"`,
          status: project.status,
        })
      }
    })

    return events.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [projects])

  // Filter events by timeframe
  const filteredEvents = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (selectedTimeframe) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return timelineEvents.filter((event) => event.date >= cutoffDate)
  }, [timelineEvents, selectedTimeframe])

  // Prepare chart data
  const activityData = useMemo(() => {
    const data: { [key: string]: number } = {}
    const now = new Date()

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      data[dateKey] = 0
    }

    // Count activities per day
    filteredEvents.forEach((event) => {
      const dateKey = event.date.toISOString().split("T")[0]
      if (data[dateKey] !== undefined) {
        data[dateKey]++
      }
    })

    return Object.entries(data).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      activity: count,
    }))
  }, [filteredEvents])

  const statusDistribution = useMemo(() => {
    const distribution = projects.reduce(
      (acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1
        return acc
      },
      {} as Record<Project["status"], number>,
    )

    return Object.entries(distribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status as Project["status"]],
    }))
  }, [projects])

  const projectTypeData = useMemo(() => {
    const typeCount = projects.reduce(
      (acc, project) => {
        acc[project.type] = (acc[project.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
    }))
  }, [projects])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Creative Journey
          </CardTitle>
          <CardDescription>Visualize your project activity and progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Last Week</TabsTrigger>
              <TabsTrigger value="month">Last Month</TabsTrigger>
              <TabsTrigger value="year">Last Year</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTimeframe} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Activity</CardTitle>
                    <CardDescription>Project interactions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="activity"
                          stroke="#a16207"
                          strokeWidth={2}
                          dot={{ fill: "#a16207", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Status</CardTitle>
                    <CardDescription>Current distribution of your projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {statusDistribution.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm">
                            {entry.name} ({entry.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Project Types */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Project Types</CardTitle>
                    <CardDescription>What you're working on</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={projectTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Activity Timeline
          </CardTitle>
          <CardDescription>
            Your project journey over the{" "}
            {selectedTimeframe === "week" ? "last week" : selectedTimeframe === "month" ? "last month" : "last year"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.slice(0, 10).map((event, index) => {
                const StatusIcon = STATUS_ICONS[event.status || "active"]
                const project = projects.find((p) => p.id === event.projectId)

                return (
                  <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                    <div className="flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${STATUS_COLORS[event.status || "active"]}20` }}
                      >
                        <StatusIcon className="h-4 w-4" style={{ color: STATUS_COLORS[event.status || "active"] }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{event.description}</p>
                        {project && (
                          <Badge variant="outline" className="text-xs">
                            {project.type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredEvents.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">Showing 10 of {filteredEvents.length} events</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No activity in this timeframe</h3>
              <p className="text-sm text-muted-foreground">
                Try selecting a different time period or start working on a project!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
