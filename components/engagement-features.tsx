"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Users,
  Bell,
  Zap,
  Heart,
  Trophy,
  Flame,
  Target,
  Share2,
  Frown,
  Meh,
  Battery,
  BatteryLow,
  Sparkles,
  Star,
} from "lucide-react"
import type { Project } from "./project-dashboard"

interface MoodEntry {
  id: string
  date: Date
  mood: "energized" | "focused" | "creative" | "tired" | "stressed" | "neutral"
  energy: number // 1-5
  notes?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  progress: number
  maxProgress: number
}

interface AccountabilityPartner {
  id: string
  name: string
  email: string
  sharedProjects: string[]
  lastCheckIn: Date
}

interface Reminder {
  id: string
  projectId: string
  type: "daily" | "weekly" | "custom"
  time: string
  message: string
  enabled: boolean
  smartScheduling: boolean
}

interface EngagementFeaturesProps {
  projects: Project[]
  userRole: string
  onUpdateProject: (project: Project) => void
}

export function EngagementFeatures({ projects, userRole, onUpdateProject }: EngagementFeaturesProps) {
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null)
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [streak, setStreak] = useState(0)
  const [showMoodDialog, setShowMoodDialog] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSocialFeatures, setShowSocialFeatures] = useState(false)
  const [accountabilityPartners, setAccountabilityPartners] = useState<AccountabilityPartner[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])

  // Initialize achievements
  useEffect(() => {
    const defaultAchievements: Achievement[] = [
      {
        id: "first-project",
        title: "First Steps",
        description: "Created your first project",
        icon: "🌱",
        progress: projects.length > 0 ? 1 : 0,
        maxProgress: 1,
      },
      {
        id: "project-master",
        title: "Project Master",
        description: "Manage 10 active projects",
        icon: "🎯",
        progress: projects.filter((p) => p.status === "active").length,
        maxProgress: 10,
      },
      {
        id: "completer",
        title: "The Completer",
        description: "Complete 5 projects",
        icon: "✅",
        progress: projects.filter((p) => p.status === "completed").length,
        maxProgress: 5,
      },
      {
        id: "streak-warrior",
        title: "Streak Warrior",
        description: "Maintain a 7-day activity streak",
        icon: "🔥",
        progress: streak,
        maxProgress: 7,
      },
      {
        id: "reflective-soul",
        title: "Reflective Soul",
        description: "Log mood 30 times",
        icon: "🧘",
        progress: moodHistory.length,
        maxProgress: 30,
      },
    ]

    setAchievements((prev) => {
      const updated = defaultAchievements.map((newAch) => {
        const existing = prev.find((a) => a.id === newAch.id)
        return {
          ...newAch,
          unlockedAt: existing?.unlockedAt || (newAch.progress >= newAch.maxProgress ? new Date() : undefined),
        }
      })
      return updated
    })
  }, [projects, moodHistory.length, streak])

  // Load saved data
  useEffect(() => {
    const savedMoodHistory = localStorage.getItem("moodHistory")
    if (savedMoodHistory) {
      setMoodHistory(
        JSON.parse(savedMoodHistory).map((m: any) => ({
          ...m,
          date: new Date(m.date),
        })),
      )
    }

    const savedStreak = localStorage.getItem("activityStreak")
    if (savedStreak) {
      setStreak(Number.parseInt(savedStreak))
    }

    const savedPartners = localStorage.getItem("accountabilityPartners")
    if (savedPartners) {
      setAccountabilityPartners(JSON.parse(savedPartners))
    }

    const savedReminders = localStorage.getItem("projectReminders")
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [])

  // Save data
  useEffect(() => {
    if (moodHistory.length > 0) {
      localStorage.setItem("moodHistory", JSON.stringify(moodHistory))
    }
  }, [moodHistory])

  useEffect(() => {
    localStorage.setItem("activityStreak", streak.toString())
  }, [streak])

  const handleMoodSubmit = (mood: MoodEntry["mood"], energy: number, notes: string) => {
    const newMood: MoodEntry = {
      id: Date.now().toString(),
      date: new Date(),
      mood,
      energy,
      notes,
    }
    setCurrentMood(newMood)
    setMoodHistory((prev) => [newMood, ...prev.slice(0, 29)]) // Keep last 30 entries
    setShowMoodDialog(false)
  }

  const getMoodIcon = (mood: MoodEntry["mood"]) => {
    switch (mood) {
      case "energized":
        return <Zap className="h-4 w-4 text-yellow-500" />
      case "focused":
        return <Target className="h-4 w-4 text-blue-500" />
      case "creative":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "tired":
        return <BatteryLow className="h-4 w-4 text-gray-500" />
      case "stressed":
        return <Frown className="h-4 w-4 text-red-500" />
      default:
        return <Meh className="h-4 w-4 text-gray-400" />
    }
  }

  const getEnergyIcon = (energy: number) => {
    if (energy >= 4) return <Battery className="h-4 w-4 text-green-500" />
    if (energy >= 3) return <Battery className="h-4 w-4 text-yellow-500" />
    return <BatteryLow className="h-4 w-4 text-red-500" />
  }

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt)
  const recentAchievements = unlockedAchievements.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
              <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-transparent w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Heart className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Log Mood & Energy</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>How are you feeling?</DialogTitle>
                    <DialogDescription>
                      Track your mood and energy to align tasks with your current state
                    </DialogDescription>
                  </DialogHeader>
                  <MoodTracker onSubmit={handleMoodSubmit} />
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSocialFeatures(true)}
                className="w-full sm:w-auto justify-center sm:justify-start"
              >
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Social</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAchievements(true)}
                className="w-full sm:w-auto justify-center sm:justify-start"
              >
                <Trophy className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Achievements ({unlockedAchievements.length})</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
              {currentMood && (
                <div className="flex items-center gap-2 text-sm w-full sm:w-auto">
                  {getMoodIcon(currentMood.mood)}
                  {getEnergyIcon(currentMood.energy)}
                  <span className="capitalize truncate">{currentMood.mood}</span>
                </div>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="font-semibold truncate">{streak} day streak</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 w-full sm:flex-1"
                >
                  <span className="text-2xl flex-shrink-0">{achievement.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood-Based Recommendations */}
      {currentMood && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getMoodIcon(currentMood.mood)}
              Recommended for your current state
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodBasedRecommendations
              mood={currentMood}
              projects={projects}
              userRole={userRole}
              onUpdateProject={onUpdateProject}
            />
          </CardContent>
        </Card>
      )}

      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Your Achievements</DialogTitle>
            <DialogDescription>Celebrate your progress and milestones</DialogDescription>
          </DialogHeader>
          <AchievementsList achievements={achievements} />
        </DialogContent>
      </Dialog>

      {/* Social Features Dialog */}
      <Dialog open={showSocialFeatures} onOpenChange={setShowSocialFeatures}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Social & Accountability</DialogTitle>
            <DialogDescription>Connect with others and stay accountable</DialogDescription>
          </DialogHeader>
          <SocialFeatures
            projects={projects}
            partners={accountabilityPartners}
            onUpdatePartners={setAccountabilityPartners}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MoodTracker({ onSubmit }: { onSubmit: (mood: MoodEntry["mood"], energy: number, notes: string) => void }) {
  const [selectedMood, setSelectedMood] = useState<MoodEntry["mood"]>("neutral")
  const [energy, setEnergy] = useState(3)
  const [notes, setNotes] = useState("")

  const moods: { value: MoodEntry["mood"]; label: string; icon: string; color: string }[] = [
    { value: "energized", label: "Energized", icon: "⚡", color: "text-yellow-500" },
    { value: "focused", label: "Focused", icon: "🎯", color: "text-blue-500" },
    { value: "creative", label: "Creative", icon: "✨", color: "text-purple-500" },
    { value: "neutral", label: "Neutral", icon: "😐", color: "text-gray-500" },
    { value: "tired", label: "Tired", icon: "😴", color: "text-gray-400" },
    { value: "stressed", label: "Stressed", icon: "😰", color: "text-red-500" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label>How are you feeling?</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              onClick={() => setSelectedMood(mood.value)}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <span className="text-lg">{mood.icon}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Energy Level: {energy}/5</Label>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              variant={energy >= level ? "default" : "outline"}
              size="sm"
              onClick={() => setEnergy(level)}
              className="w-8 h-8 p-0"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="mood-notes">Notes (optional)</Label>
        <Textarea
          id="mood-notes"
          placeholder="What's on your mind?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button onClick={() => onSubmit(selectedMood, energy, notes)} className="w-full">
        Log Mood & Energy
      </Button>
    </div>
  )
}

function MoodBasedRecommendations({
  mood,
  projects,
  userRole,
  onUpdateProject,
}: {
  mood: MoodEntry
  projects: Project[]
  userRole: string
  onUpdateProject: (project: Project) => void
}) {
  const getRecommendations = () => {
    const activeProjects = projects.filter((p) => p.status === "active")

    switch (mood.mood) {
      case "energized":
        return {
          message: "Great energy! Perfect time for challenging tasks.",
          suggestions: [
            "Start a new feature or major component",
            "Tackle that complex problem you've been avoiding",
            "Refactor or optimize existing code",
          ],
          projects: activeProjects.slice(0, 2),
        }
      case "focused":
        return {
          message: "Deep focus mode activated. Ideal for detailed work.",
          suggestions: ["Write documentation or detailed specs", "Debug complex issues", "Plan project architecture"],
          projects: activeProjects.slice(0, 2),
        }
      case "creative":
        return {
          message: "Creative juices flowing! Time for innovation.",
          suggestions: [
            "Brainstorm new features or ideas",
            "Design user interfaces or experiences",
            "Experiment with new approaches",
          ],
          projects: activeProjects.slice(0, 2),
        }
      case "tired":
        return {
          message: "Low energy detected. Let's keep it light.",
          suggestions: ["Review and organize project notes", "Update project documentation", "Plan tomorrow's tasks"],
          projects: [],
        }
      case "stressed":
        return {
          message: "Feeling overwhelmed? Let's simplify.",
          suggestions: [
            "Take a 10-minute break",
            "Focus on one small, easy task",
            "Archive projects that aren't essential",
          ],
          projects: [],
        }
      default:
        return {
          message: "Ready for whatever comes your way.",
          suggestions: ["Check in on paused projects", "Make progress on active work", "Plan your next steps"],
          projects: activeProjects.slice(0, 2),
        }
    }
  }

  const recommendations = getRecommendations()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{recommendations.message}</p>

      <div>
        <h4 className="font-medium mb-2">Suggested Actions:</h4>
        <ul className="space-y-1">
          {recommendations.suggestions.map((suggestion, index) => (
            <li key={index} className="text-sm flex items-center gap-2">
              <Star className="h-3 w-3 text-yellow-500" />
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {recommendations.projects.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Recommended Projects:</h4>
          <div className="space-y-2">
            {recommendations.projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm font-medium">{project.title}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const updated = { ...project, lastActivity: new Date() }
                    onUpdateProject(updated)
                  }}
                >
                  Work on this
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {achievements.map((achievement) => (
        <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="text-3xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{achievement.title}</h4>
              {achievement.unlockedAt && <Badge variant="secondary">Unlocked!</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            <div className="mt-2">
              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {achievement.progress} / {achievement.maxProgress}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SocialFeatures({
  projects,
  partners,
  onUpdatePartners,
}: {
  projects: Project[]
  partners: AccountabilityPartner[]
  onUpdatePartners: (partners: AccountabilityPartner[]) => void
}) {
  const [newPartnerEmail, setNewPartnerEmail] = useState("")
  const [shareableProjects, setShareableProjects] = useState<string[]>([])

  const handleAddPartner = () => {
    if (!newPartnerEmail.trim()) return

    const newPartner: AccountabilityPartner = {
      id: Date.now().toString(),
      name: newPartnerEmail.split("@")[0],
      email: newPartnerEmail,
      sharedProjects: shareableProjects,
      lastCheckIn: new Date(),
    }

    onUpdatePartners([...partners, newPartner])
    setNewPartnerEmail("")
    setShareableProjects([])
  }

  const generateShareableLink = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return ""

    const shareData = {
      title: project.title,
      description: project.description,
      type: project.type,
      status: project.status,
    }

    return `${window.location.origin}/shared-project?data=${encodeURIComponent(JSON.stringify(shareData))}`
  }

  return (
    <div className="space-y-6">
      {/* Accountability Partners */}
      <div>
        <h3 className="font-medium mb-4">Accountability Partners</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Partner's email"
              value={newPartnerEmail}
              onChange={(e) => setNewPartnerEmail(e.target.value)}
            />
            <Button onClick={handleAddPartner}>Add Partner</Button>
          </div>

          {partners.map((partner) => (
            <div key={partner.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{partner.name}</div>
                <div className="text-sm text-muted-foreground">{partner.email}</div>
                <div className="text-xs text-muted-foreground">Shared projects: {partner.sharedProjects.length}</div>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Check In
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Sharing */}
      <div>
        <h3 className="font-medium mb-4">Share Projects</h3>
        <div className="space-y-2">
          {projects
            .filter((p) => p.status !== "archived")
            .map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{project.title}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = generateShareableLink(project.id)
                    navigator.clipboard.writeText(link)
                  }}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            ))}
        </div>
      </div>

      {/* Community Inspiration */}
      <div>
        <h3 className="font-medium mb-4">Community Inspiration</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Join weekly virtual co-working sessions</p>
          <p>• Share progress in the community forum</p>
          <p>• Get inspired by others' project journeys</p>
          <Button variant="outline" className="mt-2 bg-transparent">
            Join Community
          </Button>
        </div>
      </div>
    </div>
  )
}
