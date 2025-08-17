"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Archive, Heart, Lightbulb, RotateCcw, Trash2 } from "lucide-react"
import type { Project } from "@/components/project-dashboard"

interface ArchiveData {
  archiveType: "temporary" | "permanent" | "completed"
  farewellNote: string
  lessonsLearned: string
  reasonForArchiving: string
  archivedAt: Date
}

interface ExtendedProject extends Project {
  archiveData?: ArchiveData
}

interface ArchiveSystemProps {
  project: Project
  onArchive: (project: Project, archiveData: ArchiveData) => void
  onCancel: () => void
}

const ARCHIVE_REASONS = {
  developer: [
    "Technical challenges became too complex",
    "Lost interest in the technology stack",
    "Found a better solution elsewhere",
    "Scope was too ambitious for available time",
    "Priorities shifted to other projects",
    "Learned what I needed from this experiment",
  ],
  writer: [
    "Story wasn't resonating with me anymore",
    "Found the topic was already well-covered",
    "Writing style evolved beyond this piece",
    "Lost connection with the characters/theme",
    "Decided to focus on other writing projects",
    "Completed the learning I sought from this",
  ],
  student: [
    "Course or program ended",
    "Changed academic focus or major",
    "Found better learning resources",
    "Completed the learning objectives",
    "Time constraints from other commitments",
    "Decided to approach the topic differently",
  ],
  entrepreneur: [
    "Market conditions changed",
    "Found the problem wasn't worth solving",
    "Discovered better business opportunities",
    "Lacked resources to execute properly",
    "Validated assumptions and moved on",
    "Decided to focus on core business",
  ],
  creative: [
    "Artistic vision evolved in a new direction",
    "Lost emotional connection to the work",
    "Found more inspiring projects to pursue",
    "Completed the creative exploration I sought",
    "Decided to focus on different mediums",
    "The work served its purpose as practice",
  ],
}

export function ArchiveSystem({ project, onArchive, onCancel }: ArchiveSystemProps) {
  const [archiveType, setArchiveType] = useState<"temporary" | "permanent" | "completed">("temporary")
  const [farewellNote, setFarewellNote] = useState("")
  const [lessonsLearned, setLessonsLearned] = useState("")
  const [reasonForArchiving, setReasonForArchiving] = useState("")

  const handleArchive = () => {
    const archiveData: ArchiveData = {
      archiveType,
      farewellNote,
      lessonsLearned,
      reasonForArchiving,
      archivedAt: new Date(),
    }
    onArchive(project, archiveData)
  }

  const reasons = ARCHIVE_REASONS[project.userRole as keyof typeof ARCHIVE_REASONS] || ARCHIVE_REASONS.developer

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-muted-foreground" />
          Archive "{project.title}"
        </DialogTitle>
        <DialogDescription>
          Take a moment to reflect on this project before archiving it. This helps create closure and preserve what
          you've learned.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold">How would you like to archive this project?</Label>
          <Select value={archiveType} onValueChange={(value: any) => setArchiveType(value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temporary">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Maybe Later</span>
                  <span className="text-xs text-muted-foreground">Might return to this someday</span>
                </div>
              </SelectItem>
              <SelectItem value="permanent">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Graceful Closure</span>
                  <span className="text-xs text-muted-foreground">Ready to let this go with gratitude</span>
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Mission Accomplished</span>
                  <span className="text-xs text-muted-foreground">Achieved what I set out to do</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reason">Why are you archiving this project?</Label>
          <Select value={reasonForArchiving} onValueChange={setReasonForArchiving}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Choose a reason (optional)" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="lessons" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            What did you learn from this project?
          </Label>
          <Textarea
            id="lessons"
            placeholder="Skills gained, insights discovered, or experiences that will help in future projects..."
            value={lessonsLearned}
            onChange={(e) => setLessonsLearned(e.target.value)}
            className="mt-2 min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="farewell" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {archiveType === "completed"
              ? "Celebration note"
              : archiveType === "permanent"
                ? "Farewell message"
                : "Pause reflection"}
          </Label>
          <Textarea
            id="farewell"
            placeholder={
              archiveType === "completed"
                ? "Celebrate what you accomplished..."
                : archiveType === "permanent"
                  ? "Say goodbye with gratitude..."
                  : "Reflect on why you're pausing and what might bring you back..."
            }
            value={farewellNote}
            onChange={(e) => setFarewellNote(e.target.value)}
            className="mt-2 min-h-[80px]"
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Remember:</strong> Archiving isn't failure—it's conscious choice-making. Every project teaches us
            something, even if it doesn't reach completion. Your creative journey includes both finished works and
            meaningful explorations.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleArchive} className="bg-muted-foreground hover:bg-muted-foreground/90">
            <Archive className="h-4 w-4 mr-2" />
            Archive Project
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

interface ProjectGardenProps {
  archivedProjects: ExtendedProject[]
  onReviveProject: (project: Project) => void
  onPermanentDelete: (projectId: string) => void
}

export function ProjectGarden({ archivedProjects, onReviveProject, onPermanentDelete }: ProjectGardenProps) {
  const [selectedProject, setSelectedProject] = useState<ExtendedProject | null>(null)

  const temporaryArchives = archivedProjects.filter((p) => p.archiveData?.archiveType === "temporary")
  const permanentArchives = archivedProjects.filter((p) => p.archiveData?.archiveType === "permanent")
  const completedArchives = archivedProjects.filter((p) => p.archiveData?.archiveType === "completed")

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Project Garden</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A place to honor your creative journey—both the projects you've completed and those you've consciously chosen
          to set aside. Every project here represents growth, learning, and intentional decision-making.
        </p>
      </div>

      {/* Completed Projects */}
      {completedArchives.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-5 rounded-full"></div>
            Completed Projects ({completedArchives.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedArchives.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow border-chart-5/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs border-chart-5/50 text-chart-5">
                      {project.type}
                    </Badge>
                    <Badge className="text-xs bg-chart-5/10 text-chart-5 border-chart-5/30">Completed</Badge>
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground mb-3">
                    Completed {project.archiveData?.archivedAt.toLocaleDateString()}
                  </div>
                  {project.archiveData?.farewellNote && (
                    <div className="text-xs bg-chart-5/5 p-2 rounded border-l-2 border-chart-5/30 line-clamp-2">
                      {project.archiveData.farewellNote}
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setSelectedProject(project)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Maybe Later Projects */}
      {temporaryArchives.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            Maybe Later ({temporaryArchives.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {temporaryArchives.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow border-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {project.type}
                    </Badge>
                    <Badge className="text-xs bg-accent/10 text-accent-foreground border-accent/30">Maybe Later</Badge>
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground mb-3">
                    Paused {project.archiveData?.archivedAt.toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => onReviveProject(project)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Revive
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)}>
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Permanently Archived Projects */}
      {permanentArchives.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
            Gracefully Closed ({permanentArchives.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permanentArchives.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow border-muted">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {project.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Closed
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-muted-foreground">{project.title}</CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground mb-3">
                    Archived {project.archiveData?.archivedAt.toLocaleDateString()}
                  </div>
                  {project.archiveData?.farewellNote && (
                    <div className="text-xs bg-muted/50 p-2 rounded line-clamp-2 mb-2">
                      {project.archiveData.farewellNote}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setSelectedProject(project)}>
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPermanentDelete(project.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {archivedProjects.length === 0 && (
        <div className="text-center py-12">
          <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your garden is empty</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            As you work on projects and make conscious decisions about what to continue or set aside, they'll appear
            here as a record of your creative journey.
          </p>
        </div>
      )}

      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  {selectedProject.title}
                </DialogTitle>
                <DialogDescription>
                  Archived on {selectedProject.archiveData?.archivedAt.toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedProject.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Project Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                  </div>
                )}

                {selectedProject.archiveData?.reasonForArchiving && (
                  <div>
                    <h4 className="font-semibold mb-2">Reason for Archiving</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.archiveData.reasonForArchiving}</p>
                  </div>
                )}

                {selectedProject.archiveData?.lessonsLearned && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Lessons Learned
                    </h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">{selectedProject.archiveData.lessonsLearned}</p>
                    </div>
                  </div>
                )}

                {selectedProject.archiveData?.farewellNote && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {selectedProject.archiveData.archiveType === "completed"
                        ? "Celebration"
                        : selectedProject.archiveData.archiveType === "permanent"
                          ? "Farewell Message"
                          : "Reflection"}
                    </h4>
                    <div className="bg-accent/5 p-3 rounded-lg border-l-2 border-accent/30">
                      <p className="text-sm">{selectedProject.archiveData.farewellNote}</p>
                    </div>
                  </div>
                )}

                {selectedProject.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Original Notes</h4>
                    <div className="bg-card p-3 rounded-lg border">
                      <p className="text-sm text-muted-foreground">{selectedProject.notes}</p>
                    </div>
                  </div>
                )}

                {selectedProject.archiveData?.archiveType === "temporary" && (
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      onClick={() => {
                        onReviveProject(selectedProject)
                        setSelectedProject(null)
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Revive Project
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
