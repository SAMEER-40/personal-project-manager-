"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ProjectCard } from "@/components/project-card"
import { ReflectionEngine } from "@/components/reflection-engine"
import { ProjectTimeline } from "@/components/project-timeline"
import { ArchiveSystem, ProjectGarden } from "@/components/archive-system"
import { DashboardAnalytics } from "@/components/dashboard-analytics"
import { BarChart3, Grid3X3, Archive, TrendingUp } from "lucide-react"
import { EngagementFeatures } from "@/components/engagement-features"
import { LaunchReadyFeatures } from "@/components/launch-ready-features"
import { supabase } from "@/lib/supabase/client"
import { AlternativeStorage } from "@/components/alternative-storage"
import { AuthenticatedHeader } from "@/components/authenticated-header"
import { NoteTakingSystem } from "@/components/note-taking-system"

export interface Project {
  id: string
  title: string
  type: string
  status: "active" | "paused" | "archived" | "completed"
  description: string
  createdAt: Date
  lastActivity: Date
  notes: string
  userRole: string
  user_id?: string
  archiveData?: {
    archiveType: "temporary" | "permanent" | "completed"
    farewellNote: string
    lessonsLearned: string
    reasonForArchiving: string
    archivedAt: Date
  }
}

interface UserRole {
  id: string
  title: string
  icon: string
  description: string
  examples: string[]
}

interface ProjectDashboardProps {
  userRole: UserRole
  onBackToWelcome: () => void
  user?: any
  onSignOut?: () => void
}

const PROJECT_TYPES_BY_ROLE = {
  developer: ["Web App", "Mobile App", "API", "Library", "Tool", "Learning Project", "Open Source"],
  writer: ["Blog Post", "Article", "Story", "Novel", "Poetry", "Script", "Research"],
  student: ["Assignment", "Research Paper", "Study Guide", "Project", "Thesis", "Course Work"],
  entrepreneur: ["Business Plan", "MVP", "Market Research", "Pitch Deck", "Product Idea", "Strategy"],
  creative: ["Art Project", "Music", "Craft", "Design", "Photography", "Video", "Performance"],
}

export function ProjectDashboard({ userRole, onBackToWelcome, user, onSignOut }: ProjectDashboardProps) {
  console.log("[v0] ProjectDashboard rendering with:", { userRole: userRole.title, user: user?.email || "no user" })

  const [projects, setProjects] = useState<Project[]>([])
  const [showAddProject, setShowAddProject] = useState(false)
  const [activeView, setActiveView] = useState<"projects" | "timeline" | "archive" | "analytics">("projects")
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({
    title: "",
    type: "",
    description: "",
    notes: "",
  })

  useEffect(() => {
    console.log("[v0] Loading projects for user:", user?.id || "localStorage")

    const loadProjects = async () => {
      if (user) {
        console.log("[v0] Querying Supabase for projects")
        const { data: supabaseProjects } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("last_activity", { ascending: false })

        console.log("[v0] Supabase projects result:", supabaseProjects?.length || 0, "projects")

        if (supabaseProjects) {
          const formattedProjects = supabaseProjects.map((p: any) => ({
            id: p.id,
            title: p.title,
            type: p.type,
            status: p.status,
            description: p.description || "",
            notes: p.notes || "",
            userRole: userRole.id,
            user_id: p.user_id,
            createdAt: new Date(p.created_at),
            lastActivity: new Date(p.last_activity),
            archiveData: p.archive_type
              ? {
                  archiveType: p.archive_type,
                  farewellNote: p.archive_note || "",
                  lessonsLearned: p.lessons_learned || "",
                  reasonForArchiving: "",
                  archivedAt: new Date(p.updated_at),
                }
              : undefined,
          }))
          setProjects(formattedProjects)
        }
      } else {
        console.log("[v0] Loading projects from localStorage")
        const savedProjects = localStorage.getItem("projects")
        console.log("[v0] localStorage projects:", savedProjects ? "found" : "not found")

        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            lastActivity: new Date(p.lastActivity),
            archiveData: p.archiveData
              ? {
                  ...p.archiveData,
                  archivedAt: new Date(p.archiveData.archivedAt),
                }
              : undefined,
          }))
          console.log("[v0] Loaded", parsedProjects.length, "projects from localStorage")
          setProjects(parsedProjects)
        }
      }
    }

    loadProjects()
  }, [user, userRole.id])

  useEffect(() => {
    if (!user && projects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(projects))
    }
  }, [projects, user])

  const handleAddProject = async () => {
    if (!newProject.title.trim()) return

    console.log("[v0] Adding project:", { title: newProject.title, user: user?.id || "localStorage" })

    const generateId = () => {
      if (typeof window.crypto !== "undefined" && window.crypto.randomUUID) {
        return window.crypto.randomUUID()
      }
      // Fallback for environments without crypto.randomUUID
      return Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9)
    }

    const project: Project = {
      id: generateId(),
      title: newProject.title,
      type: newProject.type || PROJECT_TYPES_BY_ROLE[userRole.id as keyof typeof PROJECT_TYPES_BY_ROLE][0],
      status: "active",
      description: newProject.description,
      notes: newProject.notes,
      createdAt: new Date(),
      lastActivity: new Date(),
      userRole: userRole.id,
      user_id: user?.id,
    }

    if (user) {
      console.log("[v0] Saving project to Supabase")
      const { error } = await supabase.from("projects").insert([
        {
          id: project.id,
          user_id: user.id,
          title: project.title,
          type: project.type,
          status: project.status,
          description: project.description,
          notes: project.notes,
          created_at: project.createdAt.toISOString(),
          last_activity: project.lastActivity.toISOString(),
        },
      ])

      if (error) {
        console.error("[v0] Error adding project to Supabase:", error)
        return
      }
      console.log("[v0] Project saved to Supabase successfully")
    } else {
      console.log("[v0] Saving project to localStorage")
    }

    setProjects([project, ...projects])
    setNewProject({ title: "", type: "", description: "", notes: "" })
    setShowAddProject(false)
    console.log("[v0] Project added successfully, total projects:", projects.length + 1)
  }

  const handleAddProjectFromFeatures = async (projectData: Omit<Project, "id" | "createdAt" | "lastActivity">) => {
    console.log("[v0] Adding project from features:", { title: projectData.title, type: projectData.type })

    const generateId = () => {
      if (typeof window.crypto !== "undefined" && window.crypto.randomUUID) {
        return window.crypto.randomUUID()
      }
      // Fallback for environments without crypto.randomUUID
      return Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9)
    }

    const project: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date(),
      lastActivity: new Date(),
      user_id: user?.id,
    }

    if (user) {
      console.log("[v0] Saving feature project to Supabase")
      const { error } = await supabase.from("projects").insert([
        {
          id: project.id,
          user_id: user.id,
          title: project.title,
          type: project.type,
          status: project.status,
          description: project.description,
          notes: project.notes,
          created_at: project.createdAt.toISOString(),
          last_activity: project.lastActivity.toISOString(),
        },
      ])

      if (error) {
        console.error("[v0] Error adding feature project to Supabase:", error)
        return
      }
      console.log("[v0] Feature project saved to Supabase successfully")
    } else {
      console.log("[v0] Saving feature project to localStorage")
    }

    setProjects([project, ...projects])
    console.log("[v0] Feature project added successfully, total projects:", projects.length + 1)
  }

  const handleUpdateProject = async (updatedProject: Project) => {
    if (user) {
      const { error } = await supabase
        .from("projects")
        .update({
          title: updatedProject.title,
          type: updatedProject.type,
          status: updatedProject.status,
          description: updatedProject.description,
          notes: updatedProject.notes,
          archive_type: updatedProject.archiveData?.archiveType,
          archive_note: updatedProject.archiveData?.farewellNote,
          lessons_learned: updatedProject.archiveData?.lessonsLearned,
          last_activity: updatedProject.lastActivity.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedProject.id)

      if (error) {
        console.error("Error updating project:", error)
        return
      }
    }

    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
  }

  const handleDeleteProject = async (projectId: string) => {
    if (user) {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) {
        console.error("Error deleting project:", error)
        return
      }
    }

    setProjects(projects.filter((p) => p.id !== projectId))
  }

  const handleArchiveProject = async (project: Project, archiveData: any) => {
    const updatedProject = {
      ...project,
      status: "archived" as const,
      archiveData,
      lastActivity: new Date(),
    }

    if (user) {
      const { error } = await supabase
        .from("projects")
        .update({
          status: "archived",
          archive_type: archiveData.archiveType,
          archive_note: archiveData.farewellNote,
          lessons_learned: archiveData.lessonsLearned,
          last_activity: updatedProject.lastActivity.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (error) {
        console.error("Error archiving project:", error)
        return
      }
    }

    setProjects(projects.map((p) => (p.id === project.id ? updatedProject : p)))
    setProjectToArchive(null)
  }

  const handleReviveProject = async (project: Project) => {
    const updatedProject = {
      ...project,
      status: "active" as const,
      lastActivity: new Date(),
    }

    if (user) {
      const { error } = await supabase
        .from("projects")
        .update({
          status: "active",
          last_activity: updatedProject.lastActivity.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (error) {
        console.error("Error reviving project:", error)
        return
      }
    }

    setProjects(projects.map((p) => (p.id === project.id ? updatedProject : p)))
  }

  const handleImportProjects = async (importedProjects: Project[]) => {
    if (user) {
      // Save imported projects to Supabase
      for (const project of importedProjects) {
        const { error } = await supabase.from("projects").insert([
          {
            id: project.id,
            user_id: user.id,
            title: project.title,
            type: project.type,
            status: project.status,
            description: project.description,
            notes: project.notes,
            created_at: project.createdAt.toISOString(),
            last_activity: project.lastActivity.toISOString(),
            archive_type: project.archiveData?.archiveType,
            archive_note: project.archiveData?.farewellNote,
            lessons_learned: project.archiveData?.lessonsLearned,
          },
        ])

        if (error) {
          console.error("Error importing project:", error)
        }
      }
    }

    // Add to local state
    setProjects((prev) => [...importedProjects, ...prev])
  }

  const handleRoleChange = (newRole: string) => {
    // Refresh the page to update the role
    window.location.reload()
  }

  const activeProjects = projects.filter((p) => p.status === "active")
  const pausedProjects = projects.filter((p) => p.status === "paused")
  const completedProjects = projects.filter((p) => p.status === "completed")
  const archivedProjects = projects.filter((p) => p.status === "archived")

  const projectTypes = PROJECT_TYPES_BY_ROLE[userRole.id as keyof typeof PROJECT_TYPES_BY_ROLE] || []

  console.log("[v0] Dashboard render state:", {
    activeView,
    projectsCount: projects.length,
    activeProjects: activeProjects.length,
    userRole: userRole.title,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {user && <AuthenticatedHeader user={user} userRole={userRole.title} onRoleChange={handleRoleChange} />}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackToWelcome} className="shrink-0 bg-transparent">
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <span className="text-2xl">{userRole.icon}</span>
                Your Project Sanctuary
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Managing your creative journey with intention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!user && (
              <div className="flex items-center gap-3 mr-4">
                <div className="text-right">
                  <div className="text-sm font-medium">Local Mode</div>
                  <div className="text-xs text-muted-foreground">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => (window.location.href = "/auth/login")}
                    >
                      Sign in to sync
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeView === "projects" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("projects")}
                className="text-xs sm:text-sm"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Projects</span>
              </Button>
              <Button
                variant={activeView === "analytics" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("analytics")}
                className="text-xs sm:text-sm"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
              <Button
                variant={activeView === "timeline" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("timeline")}
                className="text-xs sm:text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Timeline</span>
              </Button>
              <Button
                variant={activeView === "archive" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("archive")}
                className="text-xs sm:text-sm"
              >
                <Archive className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Garden</span> ({archivedProjects.length})
              </Button>
            </div>

            <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-sm">
                  <span className="hidden sm:inline">+ Add Project</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                  <DialogDescription>
                    Capture a new idea or project you'd like to work on. Don't worry about making it perfect—you can
                    always refine it later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="What are you building or creating?"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className={!newProject.title.trim() ? "border-red-200" : ""}
                    />
                    {!newProject.title.trim() && <p className="text-sm text-red-500 mt-1">Project title is required</p>}
                  </div>
                  <div>
                    <Label htmlFor="type">Project Type</Label>
                    <Select
                      value={newProject.type}
                      onValueChange={(value) => setNewProject({ ...newProject, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What's the goal or vision for this project?"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Initial Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any thoughts, ideas, or next steps?"
                      value={newProject.notes}
                      onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddProject(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddProject}
                      disabled={!newProject.title.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Add Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {activeView === "analytics" ? (
          <DashboardAnalytics projects={projects} userRole={userRole.id} />
        ) : activeView === "archive" ? (
          <ProjectGarden
            archivedProjects={archivedProjects}
            onReviveProject={handleReviveProject}
            onPermanentDelete={handleDeleteProject}
          />
        ) : activeView === "timeline" ? (
          <ProjectTimeline projects={projects} userRole={userRole.id} />
        ) : (
          <>
            <LaunchReadyFeatures
              projects={projects}
              userRole={userRole.id}
              onUpdateProject={handleUpdateProject}
              onAddProject={handleAddProjectFromFeatures}
            />

            {/* Note-Taking System accessible from everywhere */}
            <NoteTakingSystem user={user} projects={projects} />

            <EngagementFeatures projects={projects} userRole={userRole.id} onUpdateProject={handleUpdateProject} />

            <ReflectionEngine projects={projects} userRole={userRole.id} onUpdateProject={handleUpdateProject} />

            {/* Alternative Storage for backup and export functionality */}
            <AlternativeStorage projects={projects} user={user} onImportProjects={handleImportProjects} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{activeProjects.length}</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">{pausedProjects.length}</div>
                  <div className="text-sm text-muted-foreground">Paused Projects</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-chart-5">{completedProjects.length}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">{archivedProjects.length}</div>
                  <div className="text-sm text-muted-foreground">Archived</div>
                </CardContent>
              </Card>
            </div>

            {/* Projects Sections */}
            <div className="space-y-8">
              {activeProjects.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    Active Projects ({activeProjects.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onUpdate={handleUpdateProject}
                        onDelete={handleDeleteProject}
                        onArchive={setProjectToArchive}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pausedProjects.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    Paused Projects ({pausedProjects.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pausedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onUpdate={handleUpdateProject}
                        onDelete={handleDeleteProject}
                        onArchive={setProjectToArchive}
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedProjects.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                    <div className="w-3 h-3 bg-chart-5 rounded-full"></div>
                    Completed Projects ({completedProjects.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {completedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onUpdate={handleUpdateProject}
                        onDelete={handleDeleteProject}
                        onArchive={setProjectToArchive}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {projects.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">{userRole.icon}</div>
                  <h3 className="text-xl font-semibold mb-4">Ready to start your journey?</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    Add your first project to begin tracking your creative work. Remember, every great achievement
                    starts with a single step.
                  </p>
                  <Button onClick={() => setShowAddProject(true)} className="bg-primary hover:bg-primary/90 px-8">
                    Add Your First Project
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Archive Dialog */}
        <Dialog open={!!projectToArchive} onOpenChange={() => setProjectToArchive(null)}>
          {projectToArchive && (
            <ArchiveSystem
              project={projectToArchive}
              onArchive={handleArchiveProject}
              onCancel={() => setProjectToArchive(null)}
            />
          )}
        </Dialog>
      </div>
    </div>
  )
}
