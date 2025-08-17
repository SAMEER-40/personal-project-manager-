"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Mic,
  MicOff,
  Search,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
  FileText,
  Bell,
  BellOff,
  Timer,
  Target,
  Lightbulb,
} from "lucide-react"
import type { Project } from "./project-dashboard"

interface LaunchReadyFeaturesProps {
  projects: Project[]
  userRole: string
  onUpdateProject: (project: Project) => void
  onAddProject: (project: Omit<Project, "id" | "createdAt" | "lastActivity">) => void
}

// Project Templates by Role
const PROJECT_TEMPLATES = {
  developer: [
    {
      title: "React Component Library",
      type: "Library",
      description: "Build reusable UI components for future projects",
      notes: "Start with Button, Input, and Card components. Set up Storybook for documentation.",
      tags: ["react", "typescript", "storybook"],
    },
    {
      title: "Personal Portfolio Website",
      type: "Web App",
      description: "Showcase your work and skills",
      notes: "Include projects section, about page, contact form. Deploy on Vercel.",
      tags: ["portfolio", "nextjs", "tailwind"],
    },
  ],
  writer: [
    {
      title: "Daily Writing Practice",
      type: "Blog Post",
      description: "Establish a consistent writing routine",
      notes: "Write 500 words daily. Focus on different topics each week.",
      tags: ["practice", "routine", "creativity"],
    },
    {
      title: "Short Story Collection",
      type: "Story",
      description: "Collection of interconnected short stories",
      notes: "Start with character sketches. Aim for 5-7 stories, 2000 words each.",
      tags: ["fiction", "collection", "characters"],
    },
  ],
  student: [
    {
      title: "Research Paper Outline",
      type: "Research Paper",
      description: "Structured approach to academic writing",
      notes: "Create thesis statement, gather sources, outline main arguments.",
      tags: ["research", "academic", "writing"],
    },
  ],
  entrepreneur: [
    {
      title: "Market Validation Study",
      type: "Market Research",
      description: "Validate your business idea with real data",
      notes: "Survey target audience, analyze competitors, identify pain points.",
      tags: ["validation", "research", "customers"],
    },
  ],
  creative: [
    {
      title: "30-Day Art Challenge",
      type: "Art Project",
      description: "Daily creative practice to build skills",
      notes: "Different theme each day. Share progress on social media.",
      tags: ["challenge", "practice", "skills"],
    },
  ],
}

export function LaunchReadyFeatures({ projects, userRole, onUpdateProject, onAddProject }: LaunchReadyFeaturesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isRecording, setIsRecording] = useState(false)
  const [voiceNote, setVoiceNote] = useState("")
  const [focusSession, setFocusSession] = useState<{
    projectId: string
    duration: number
    isActive: boolean
    timeLeft: number
  } | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [smartScheduling, setSmartScheduling] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showQuickCapture, setShowQuickCapture] = useState(false)
  const [quickCaptureText, setQuickCaptureText] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null)

  const templates = PROJECT_TEMPLATES[userRole as keyof typeof PROJECT_TEMPLATES] || []

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        // In a real app, you'd send this to a speech-to-text service
        setVoiceNote("Voice note recorded - would be transcribed in production")
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Focus Session Timer
  const startFocusSession = (projectId: string, duration: number) => {
    setFocusSession({
      projectId,
      duration,
      isActive: true,
      timeLeft: duration * 60, // Convert to seconds
    })

    focusTimerRef.current = setInterval(() => {
      setFocusSession((prev) => {
        if (!prev || prev.timeLeft <= 1) {
          if (focusTimerRef.current) clearInterval(focusTimerRef.current)
          // Show completion notification
          if (notifications && "Notification" in window) {
            new Notification("Focus session complete!", {
              body: "Great work! Take a break and reflect on your progress.",
              icon: "/favicon.ico",
            })
          }
          return null
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
  }

  const pauseFocusSession = () => {
    if (focusTimerRef.current) {
      clearInterval(focusTimerRef.current)
      setFocusSession((prev) => (prev ? { ...prev, isActive: false } : null))
    }
  }

  const resumeFocusSession = () => {
    if (focusSession && !focusSession.isActive) {
      setFocusSession((prev) => (prev ? { ...prev, isActive: true } : null))
      // Restart timer logic here
    }
  }

  // Smart Search and Filtering
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.notes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    const matchesType = filterType === "all" || project.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  // Export/Import Functions
  const exportProjects = () => {
    const dataStr = JSON.stringify(projects, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `projects-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedProjects = JSON.parse(e.target?.result as string)
        // In a real app, you'd merge these with existing projects
        console.log("Imported projects:", importedProjects)
      } catch (error) {
        console.error("Error importing projects:", error)
      }
    }
    reader.readAsText(file)
  }

  // Quick Capture
  const handleQuickCapture = () => {
    if (!quickCaptureText.trim()) return

    console.log("[v0] Quick capturing project:", quickCaptureText.substring(0, 50))

    const newProject = {
      title: quickCaptureText.split("\n")[0] || "Quick Capture",
      type: "Quick Idea",
      status: "active" as const,
      description: quickCaptureText,
      notes: voiceNote || "",
      userRole,
    }

    onAddProject(newProject)
    setQuickCaptureText("")
    setVoiceNote("")
    setShowQuickCapture(false)
    console.log("[v0] Quick capture completed")
  }

  // Project Templates
  const applyTemplate = (template: any) => {
    console.log("[v0] Applying template:", template.title)

    const newProject = {
      ...template,
      status: "active" as const,
      userRole,
    }
    onAddProject(newProject)
    setShowTemplates(false)
    console.log("[v0] Template applied successfully")
  }

  // Request notification permission
  useEffect(() => {
    if (notifications && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [notifications])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (focusTimerRef.current) clearInterval(focusTimerRef.current)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const uniqueTypes = [...new Set(projects.map((p) => p.type))]

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
            {/* Quick Capture */}
            <Dialog open={showQuickCapture} onOpenChange={setShowQuickCapture}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Capture
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>Quick Capture</DialogTitle>
                  <DialogDescription>Quickly capture an idea or project. You can refine it later.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind? Describe your idea..."
                    value={quickCaptureText}
                    onChange={(e) => setQuickCaptureText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={isRecording ? stopRecording : startRecording}>
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span className="ml-2">{isRecording ? "Stop Recording" : "Voice Note"}</span>
                    </Button>
                    {voiceNote && (
                      <Badge variant="secondary" className="text-xs">
                        Voice note added
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => setShowQuickCapture(false)}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleQuickCapture}
                      disabled={!quickCaptureText.trim()}
                      className="flex-1 sm:flex-none"
                    >
                      Capture Idea
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Project Templates */}
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Project Templates</DialogTitle>
                  <DialogDescription>Start with proven project structures tailored to your role.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {templates.map((template, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => applyTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base">{template.title}</h3>
                          <Badge variant="outline" className="self-start">
                            {template.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <p className="text-xs text-muted-foreground mb-2">{template.notes}</p>
                        <div className="flex gap-1 flex-wrap">
                          {template.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Export/Import */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportProjects}
                className="flex-1 sm:flex-none bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              <label className="cursor-pointer flex-1 sm:flex-none">
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Import</span>
                  </span>
                </Button>
                <input type="file" accept=".json" onChange={importProjects} className="hidden" />
              </label>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-4 w-full sm:w-auto sm:ml-auto">
              <div className="flex items-center gap-2">
                <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                <Label htmlFor="notifications" className="text-sm flex items-center gap-1">
                  {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  <span className="hidden sm:inline">Notifications</span>
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="smart-scheduling" checked={smartScheduling} onCheckedChange={setSmartScheduling} />
                <Label htmlFor="smart-scheduling" className="text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Smart</span>
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Focus Session Timer */}
      {focusSession && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Focus Session</span>
                </div>
                <Badge variant="outline" className="self-start sm:self-auto">
                  {projects.find((p) => p.id === focusSession.projectId)?.title}
                </Badge>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="text-2xl font-mono font-bold">{formatTime(focusSession.timeLeft)}</div>

                <div className="flex gap-2">
                  {focusSession.isActive ? (
                    <Button size="sm" variant="outline" onClick={pauseFocusSession}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={resumeFocusSession}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}

                  <Button size="sm" variant="outline" onClick={() => setFocusSession(null)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, descriptions, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || filterStatus !== "all" || filterType !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterStatus("all")
                    setFilterType("all")
                  }}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {searchQuery && (
              <div className="text-sm text-muted-foreground">
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Focus Session Starters */}
      {projects.filter((p) => p.status === "active").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Start a Focus Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects
                .filter((p) => p.status === "active")
                .slice(0, 6)
                .map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 text-sm">{project.title}</h3>
                      <div className="flex gap-2 w-full">
                        <Button
                          size="sm"
                          onClick={() => startFocusSession(project.id, 25)}
                          disabled={!!focusSession}
                          className="flex-1"
                        >
                          25min
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startFocusSession(project.id, 45)}
                          disabled={!!focusSession}
                          className="flex-1"
                        >
                          45min
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Suggestions */}
      {smartScheduling && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects
                .filter((p) => {
                  const daysSinceActivity = Math.floor((Date.now() - p.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
                  return daysSinceActivity >= 3 && daysSinceActivity <= 14 && p.status === "active"
                })
                .slice(0, 3)
                .map((project) => {
                  const daysSinceActivity = Math.floor(
                    (Date.now() - project.lastActivity.getTime()) / (1000 * 60 * 60 * 24),
                  )
                  return (
                    <div key={project.id} className="flex flex-col gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm break-words">{project.title}</p>
                        <p className="text-sm text-muted-foreground">Last worked on {daysSinceActivity} days ago</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => startFocusSession(project.id, 25)}
                        disabled={!!focusSession}
                        className="w-full"
                      >
                        Focus Now
                      </Button>
                    </div>
                  )
                })}

              <div className="grid grid-cols-1 gap-3 mt-6">
                <div className="flex flex-col gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-sm">Log Mood & Energy</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Track how you feel to optimize your productivity</p>
                  <Button size="sm" variant="outline" className="w-full bg-white/50 dark:bg-gray-900/50">
                    Quick Log
                  </Button>
                </div>

                <div className="flex flex-col gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-sm">Social Achievements</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Share your progress and celebrate wins</p>
                  <Button size="sm" variant="outline" className="w-full bg-white/50 dark:bg-gray-900/50">
                    Share Progress
                  </Button>
                </div>
              </div>

              {projects.filter((p) => p.status === "active").length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No active projects to suggest. Create a new project to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
