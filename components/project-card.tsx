"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Edit, Trash2, Play, Pause, Archive, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Project } from "@/components/project-dashboard"

interface ProjectCardProps {
  project: Project
  onUpdate: (project: Project) => void
  onDelete: (projectId: string) => void
  onArchive?: (project: Project) => void
}

const STATUS_CONFIG = {
  active: { color: "bg-primary", label: "Active", icon: Play },
  paused: { color: "bg-accent", label: "Paused", icon: Pause },
  completed: { color: "bg-chart-5", label: "Completed", icon: CheckCircle },
  archived: { color: "bg-muted-foreground", label: "Archived", icon: Archive },
}

export function ProjectCard({ project, onUpdate, onDelete, onArchive }: ProjectCardProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [editProject, setEditProject] = useState({
    title: project.title,
    description: project.description,
    notes: project.notes,
  })

  const handleStatusChange = (newStatus: Project["status"]) => {
    onUpdate({
      ...project,
      status: newStatus,
      lastActivity: new Date(),
    })
  }

  const handleSaveEdit = () => {
    onUpdate({
      ...project,
      title: editProject.title,
      description: editProject.description,
      notes: editProject.notes,
      lastActivity: new Date(),
    })
    setShowEdit(false)
  }

  const daysSinceActivity = Math.floor((Date.now() - project.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
  const statusConfig = STATUS_CONFIG[project.status]
  const StatusIcon = statusConfig.icon

  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${statusConfig.color}`}></div>
              <Badge variant="outline" className="text-xs">
                {project.type}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEdit(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {onArchive && project.status !== "archived" && (
                <DropdownMenuItem onClick={() => onArchive(project)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </div>
            <div className="text-muted-foreground">
              {daysSinceActivity === 0 ? "Today" : `${daysSinceActivity}d ago`}
            </div>
          </div>

          {project.status !== "archived" && (
            <div className="flex gap-2">
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {project.notes && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded line-clamp-2">{project.notes}</div>
          )}
        </div>
      </CardContent>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project details and notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Project Title</Label>
              <Input
                id="edit-title"
                value={editProject.title}
                onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editProject.description}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editProject.notes}
                onChange={(e) => setEditProject({ ...editProject, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
