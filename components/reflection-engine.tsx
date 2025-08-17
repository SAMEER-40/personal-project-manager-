"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, Lightbulb, Target, Clock } from "lucide-react"
import type { Project } from "@/components/project-dashboard"

interface ReflectionPrompt {
  id: string
  projectId: string
  type: "inactivity" | "check_in" | "decision_point"
  title: string
  message: string
  questions: string[]
  microTasks: string[]
  createdAt: Date
  dismissed: boolean
}

interface ReflectionEngineProps {
  projects: Project[]
  userRole: string
  onUpdateProject: (project: Project) => void
}

const ROLE_SPECIFIC_PROMPTS = {
  developer: {
    inactivity: {
      title: "Code calling your name?",
      message: "This project has been quiet for a while. Sometimes the best debugging happens after a break.",
      questions: [
        "What was blocking me when I last worked on this?",
        "Has my technical approach changed since I started?",
        "Am I still excited about the problem this solves?",
        "Would I recommend this project to another developer?",
      ],
      microTasks: [
        "Fix one small bug or typo",
        "Update the README with current status",
        "Run the project and note what works/doesn't",
        "Refactor one function for clarity",
        "Add one test case",
      ],
    },
    check_in: {
      title: "How's the code flowing?",
      message: "Regular check-ins help maintain momentum and catch issues early.",
      questions: [
        "What's working well in this project?",
        "What would make this more enjoyable to work on?",
        "Is the scope still realistic?",
      ],
    },
  },
  writer: {
    inactivity: {
      title: "Your story is waiting",
      message: "Words have a way of finding us when we're ready. Maybe it's time to reconnect with this piece.",
      questions: [
        "What was I trying to say with this piece?",
        "Do I still believe in this story/message?",
        "What would happen if I never finished this?",
        "Has my perspective on this topic evolved?",
      ],
      microTasks: [
        "Read the last paragraph you wrote",
        "Write one sentence about the main character",
        "Describe the setting in three words",
        "Write a terrible first draft of the next section",
        "Outline what happens next in bullet points",
      ],
    },
    check_in: {
      title: "How are the words flowing?",
      message: "Writing is a journey of discovery. Let's see where you are on the path.",
      questions: [
        "What surprised me about this piece recently?",
        "Am I writing for the right audience?",
        "What would make this more authentic?",
      ],
    },
  },
  student: {
    inactivity: {
      title: "Learning never stops",
      message: "Sometimes we need to step back to see the bigger picture. Your education is a marathon, not a sprint.",
      questions: [
        "How does this connect to my larger learning goals?",
        "What would I tell a classmate about this topic?",
        "Am I approaching this the right way?",
        "What would make this more interesting to study?",
      ],
      microTasks: [
        "Review your last notes for 5 minutes",
        "Explain one concept out loud",
        "Find one interesting fact about the topic",
        "Create a simple mind map",
        "Ask one question about what confuses you",
      ],
    },
    check_in: {
      title: "How's your learning journey?",
      message: "Reflection is a powerful learning tool. Let's check in on your progress.",
      questions: [
        "What have I learned that I didn't expect?",
        "How can I apply this knowledge practically?",
        "What study methods work best for me?",
      ],
    },
  },
  entrepreneur: {
    inactivity: {
      title: "Innovation takes time",
      message: "Great businesses aren't built overnight. Sometimes stepping back gives us the clarity we need.",
      questions: [
        "Is this still a problem worth solving?",
        "Has the market changed since I started?",
        "What would my ideal customer say about this?",
        "Am I the right person to build this?",
      ],
      microTasks: [
        "Talk to one potential customer",
        "Research one competitor",
        "Write a one-sentence value proposition",
        "Sketch a simple business model",
        "List three assumptions to test",
      ],
    },
    check_in: {
      title: "How's your venture progressing?",
      message: "Entrepreneurship is about learning and adapting. Let's reflect on your journey.",
      questions: [
        "What have I learned about my customers?",
        "What assumptions have been proven wrong?",
        "What's my biggest risk right now?",
      ],
    },
  },
  creative: {
    inactivity: {
      title: "Creativity flows in cycles",
      message: "Art has its own timeline. Sometimes the best creations come after periods of rest and reflection.",
      questions: [
        "What was I trying to express with this project?",
        "How do I feel when I look at this work?",
        "What would finishing this give me?",
        "Has my artistic vision evolved?",
      ],
      microTasks: [
        "Spend 5 minutes just looking at your work",
        "Try one small experiment or variation",
        "Gather inspiration from one new source",
        "Share your work with one trusted person",
        "Document what you've learned so far",
      ],
    },
    check_in: {
      title: "How's your creative flow?",
      message: "Creativity thrives on reflection and intention. Let's check in with your artistic journey.",
      questions: [
        "What's bringing me joy in this project?",
        "How has my style or approach evolved?",
        "What would make this more meaningful?",
      ],
    },
  },
}

export function ReflectionEngine({ projects, userRole, onUpdateProject }: ReflectionEngineProps) {
  const [prompts, setPrompts] = useState<ReflectionPrompt[]>([])
  const [activePrompt, setActivePrompt] = useState<ReflectionPrompt | null>(null)
  const [reflectionNotes, setReflectionNotes] = useState("")

  // Generate prompts for inactive projects
  useEffect(() => {
    const now = new Date()
    const inactiveProjects = projects.filter((project) => {
      const daysSinceActivity = Math.floor((now.getTime() - project.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      return project.status === "active" && daysSinceActivity >= 7 // 7 days of inactivity
    })

    const newPrompts: ReflectionPrompt[] = inactiveProjects
      .filter((project) => !prompts.some((p) => p.projectId === project.id && !p.dismissed))
      .map((project) => {
        const rolePrompts = ROLE_SPECIFIC_PROMPTS[userRole as keyof typeof ROLE_SPECIFIC_PROMPTS]
        const promptData = rolePrompts?.inactivity || ROLE_SPECIFIC_PROMPTS.developer.inactivity

        return {
          id: `${project.id}-${Date.now()}`,
          projectId: project.id,
          type: "inactivity" as const,
          title: promptData.title,
          message: promptData.message,
          questions: promptData.questions,
          microTasks: promptData.microTasks,
          createdAt: now,
          dismissed: false,
        }
      })

    if (newPrompts.length > 0) {
      setPrompts((prev) => [...prev, ...newPrompts])
    }
  }, [projects, userRole, prompts])

  const handleDismissPrompt = (promptId: string) => {
    setPrompts((prev) => prev.map((p) => (p.id === promptId ? { ...p, dismissed: true } : p)))
    setActivePrompt(null)
  }

  const handleTakeMicroTask = (project: Project, task: string) => {
    // Update project with micro-task completion
    onUpdateProject({
      ...project,
      lastActivity: new Date(),
      notes: project.notes + `\n[${new Date().toLocaleDateString()}] Completed micro-task: ${task}`,
    })
    setActivePrompt(null)
  }

  const handleReflectionComplete = (project: Project, decision: "resume" | "pause" | "archive") => {
    const updatedProject = {
      ...project,
      status:
        decision === "resume"
          ? ("active" as const)
          : decision === "pause"
            ? ("paused" as const)
            : ("archived" as const),
      lastActivity: new Date(),
      notes: project.notes + `\n[${new Date().toLocaleDateString()}] Reflection: ${reflectionNotes}`,
    }
    onUpdateProject(updatedProject)
    setReflectionNotes("")
    setActivePrompt(null)
  }

  const activePrompts = prompts.filter((p) => !p.dismissed)
  const currentProject = activePrompt ? projects.find((p) => p.id === activePrompt.projectId) : null

  return (
    <>
      {/* Prompt Notifications */}
      {activePrompts.length > 0 && (
        <Card className="mb-6 border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <Heart className="h-5 w-5 text-accent" />
              Gentle Nudges ({activePrompts.length})
            </CardTitle>
            <CardDescription>
              Some projects are calling for your attention. No pressure—just friendly reminders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePrompts.slice(0, 3).map((prompt) => {
                const project = projects.find((p) => p.id === prompt.projectId)
                if (!project) return null

                return (
                  <div key={prompt.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{project.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {project.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{prompt.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setActivePrompt(prompt)}>
                        Reflect
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDismissPrompt(prompt.id)}>
                        Later
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reflection Dialog */}
      <Dialog open={!!activePrompt} onOpenChange={() => setActivePrompt(null)}>
        <DialogContent className="max-w-2xl">
          {activePrompt && currentProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  {activePrompt.title}
                </DialogTitle>
                <DialogDescription>Let's take a moment to reflect on "{currentProject.title}"</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{activePrompt.message}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Reflection Questions
                  </h4>
                  <div className="space-y-2">
                    {activePrompt.questions.map((question, index) => (
                      <div key={index} className="text-sm p-2 bg-card rounded border-l-2 border-accent/30">
                        {question}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your thoughts:</label>
                  <Textarea
                    placeholder="Take a moment to reflect... What comes to mind?"
                    value={reflectionNotes}
                    onChange={(e) => setReflectionNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Micro-tasks to restart:</h5>
                      <div className="space-y-1">
                        {activePrompt.microTasks.slice(0, 3).map((task, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-2 bg-transparent"
                            onClick={() => handleTakeMicroTask(currentProject, task)}
                          >
                            <div className="text-xs">{task}</div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Or decide what to do:</h5>
                      <div className="space-y-2">
                        <Button className="w-full" onClick={() => handleReflectionComplete(currentProject, "resume")}>
                          Resume Project
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => handleReflectionComplete(currentProject, "pause")}
                        >
                          Pause for Now
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => handleReflectionComplete(currentProject, "archive")}
                        >
                          Archive Project
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
