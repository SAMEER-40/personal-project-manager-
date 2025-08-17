"use client"

import { useState, useEffect } from "react"
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
  StickyNote,
  Plus,
  Search,
  Pin,
  Archive,
  Trash2,
  Edit3,
  Save,
  Settings,
  Palette,
  Type,
  Layout,
} from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  isPinned: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  projectId?: string
  backgroundColor?: string
  textColor?: string
  fontSize?: string
  fontFamily?: string
}

interface NoteTakingSystemProps {
  user?: any
  projects?: any[]
  isFloating?: boolean
}

const NOTE_CATEGORIES = [
  { id: "general", label: "General", icon: "📝" },
  { id: "ideas", label: "Ideas", icon: "💡" },
  { id: "goals", label: "Goals", icon: "🎯" },
  { id: "learning", label: "Learning", icon: "📚" },
  { id: "inspiration", label: "Inspiration", icon: "✨" },
  { id: "personal", label: "Personal", icon: "❤️" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "meetings", label: "Meetings", icon: "🤝" },
  { id: "reminders", label: "Reminders", icon: "⏰" },
  { id: "research", label: "Research", icon: "🔍" },
]

const BACKGROUND_COLORS = [
  { id: "default", label: "Default", value: "default" },
  { id: "yellow", label: "Yellow", value: "bg-yellow-50 dark:bg-yellow-950/20" },
  { id: "blue", label: "Blue", value: "bg-blue-50 dark:bg-blue-950/20" },
  { id: "green", label: "Green", value: "bg-green-50 dark:bg-green-950/20" },
  { id: "purple", label: "Purple", value: "bg-purple-50 dark:bg-purple-950/20" },
  { id: "pink", label: "Pink", value: "bg-pink-50 dark:bg-pink-950/20" },
]

const FONT_SIZES = [
  { id: "small", label: "Small", value: "text-sm" },
  { id: "medium", label: "Medium", value: "text-base" },
  { id: "large", label: "Large", value: "text-lg" },
]

const FONT_FAMILIES = [
  { id: "default", label: "Default", value: "default" },
  { id: "mono", label: "Monospace", value: "font-mono" },
  { id: "serif", label: "Serif", value: "font-serif" },
]

export function NoteTakingSystem({ user, projects = [], isFloating = false }: NoteTakingSystemProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
    projectId: "none",
    backgroundColor: "default",
    textColor: "",
    fontSize: "medium",
    fontFamily: "default",
  })

  // Load notes from localStorage or Supabase
  useEffect(() => {
    const loadNotes = () => {
      if (user) {
        // In a real app, load from Supabase
        const savedNotes = localStorage.getItem(`notes_${user.id}`)
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }))
          setNotes(parsedNotes)
        }
      } else {
        const savedNotes = localStorage.getItem("notes")
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }))
          setNotes(parsedNotes)
        }
      }
    }

    loadNotes()
  }, [user])

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      const storageKey = user ? `notes_${user.id}` : "notes"
      localStorage.setItem(storageKey, JSON.stringify(notes))
    }
  }, [notes, user])

  const generateId = () => {
    if (typeof window.crypto !== "undefined" && window.crypto.randomUUID) {
      return window.crypto.randomUUID()
    }
    return Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9)
  }

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return

    const note: Note = {
      id: generateId(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isPinned: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: newNote.projectId === "none" ? undefined : newNote.projectId,
      backgroundColor: newNote.backgroundColor,
      textColor: newNote.textColor,
      fontSize: newNote.fontSize,
      fontFamily: newNote.fontFamily,
    }

    setNotes([note, ...notes])
    setNewNote({
      title: "",
      content: "",
      category: "general",
      tags: "",
      projectId: "none",
      backgroundColor: "default",
      textColor: "",
      fontSize: "medium",
      fontFamily: "default",
    })
    setShowAddNote(false)
  }

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map((note) => (note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date() } : note)))
    setEditingNote(null)
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId))
  }

  const handleTogglePin = (noteId: string) => {
    setNotes(
      notes.map((note) => (note.id === noteId ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note)),
    )
  }

  const handleToggleArchive = (noteId: string) => {
    setNotes(
      notes.map((note) =>
        note.id === noteId ? { ...note, isArchived: !note.isArchived, updatedAt: new Date() } : note,
      ),
    )
  }

  // Filter and search notes
  const filteredNotes = notes.filter((note) => {
    if (note.isArchived !== showArchived) return false

    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = filterCategory === "all" || note.category === filterCategory

    const matchesTags = filterTags.length === 0 || filterTags.some((tag) => note.tags.includes(tag))

    return matchesSearch && matchesCategory && matchesTags
  })

  // Sort notes: pinned first, then by updated date
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const allTags = [...new Set(notes.flatMap((note) => note.tags))]

  return (
    <Card className={`w-full ${isFloating ? "border-0 shadow-none" : ""}`}>
      <CardHeader className={isFloating ? "p-3" : ""}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notes ({filteredNotes.length})
          </CardTitle>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={() => setShowCustomization(true)} className="p-2">
              <Settings className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
              <Label htmlFor="show-archived" className="text-sm">
                {showArchived ? "Archived" : "Active"}
              </Label>
            </div>

            <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                  <DialogDescription>Capture your thoughts, ideas, or important information.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <Label htmlFor="note-title">Title *</Label>
                    <Input
                      id="note-title"
                      placeholder="Note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="note-content">Content *</Label>
                    <Textarea
                      id="note-content"
                      placeholder="Write your note here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="note-category">Category</Label>
                      <Select
                        value={newNote.category}
                        onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTE_CATEGORIES.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {projects.length > 0 && (
                      <div>
                        <Label htmlFor="note-project">Link to Project (Optional)</Label>
                        <Select
                          value={newNote.projectId}
                          onValueChange={(value) => setNewNote({ ...newNote, projectId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select project..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No project</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="note-bg">Background</Label>
                      <Select
                        value={newNote.backgroundColor}
                        onValueChange={(value) => setNewNote({ ...newNote, backgroundColor: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                          {BACKGROUND_COLORS.map((bg) => (
                            <SelectItem key={bg.id} value={bg.value}>
                              {bg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="note-font-size">Font Size</Label>
                      <Select
                        value={newNote.fontSize}
                        onValueChange={(value) => setNewNote({ ...newNote, fontSize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_SIZES.map((size) => (
                            <SelectItem key={size.id} value={size.id}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="note-font-family">Font Style</Label>
                      <Select
                        value={newNote.fontFamily}
                        onValueChange={(value) => setNewNote({ ...newNote, fontFamily: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map((font) => (
                            <SelectItem key={font.id} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="note-tags">Tags (comma-separated)</Label>
                    <Input
                      id="note-tags"
                      placeholder="tag1, tag2, tag3..."
                      value={newNote.tags}
                      onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setShowAddNote(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNote} disabled={!newNote.title.trim() || !newNote.content.trim()}>
                      Create Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 ${isFloating ? "p-3 pt-0" : ""}`}>
        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {NOTE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Layout className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <Type className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 5).map((tag) => (
                  <Button
                    key={tag}
                    variant={filterTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilterTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                    }}
                    className="text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes Grid/List */}
        {sortedNotes.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {sortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                projects={projects}
                viewMode={viewMode}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterCategory !== "all" || filterTags.length > 0
                ? "Try adjusting your search or filters"
                : "Start by creating your first note"}
            </p>
            {!searchQuery && filterCategory === "all" && filterTags.length === 0 && (
              <Button onClick={() => setShowAddNote(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Note
              </Button>
            )}
          </div>
        )}

        <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Customize Notes
              </DialogTitle>
              <DialogDescription>
                Personalize your note-taking experience with themes, layouts, and more.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>View Mode</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex-1"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>

              <div>
                <Label>Quick Actions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterCategory("all")
                      setFilterTags([])
                      setSearchQuery("")
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)}>
                    {showArchived ? "Show Active" : "Show Archived"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowCustomization(false)}>Done</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        {editingNote && (
          <EditNoteDialog
            note={editingNote}
            projects={projects}
            onSave={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}

// Note Card Component
function NoteCard({
  note,
  projects,
  viewMode,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}: {
  note: Note
  projects: any[]
  viewMode: "grid" | "list"
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onToggleArchive: (id: string) => void
}) {
  const category = NOTE_CATEGORIES.find((cat) => cat.id === note.category)
  const linkedProject = projects.find((p) => p.id === note.projectId)

  const fontSize = FONT_SIZES.find((s) => s.id === note.fontSize)?.value || "text-base"
  const fontFamily =
    FONT_FAMILIES.find((f) => f.id === note.fontFamily)?.value === "default"
      ? ""
      : FONT_FAMILIES.find((f) => f.id === note.fontFamily)?.value || ""
  const backgroundColor = note.backgroundColor === "default" ? "" : note.backgroundColor || ""

  const cardClasses = `cursor-pointer hover:shadow-md transition-shadow ${
    note.isPinned ? "ring-2 ring-primary/20" : ""
  } ${backgroundColor} ${viewMode === "list" ? "flex items-start gap-4 p-4" : ""}`

  return (
    <Card className={cardClasses}>
      <CardContent className={viewMode === "list" ? "flex-1 p-0" : "p-4"}>
        <div className={`flex items-start justify-between mb-2 ${viewMode === "list" ? "mb-1" : ""}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {note.isPinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
            <h3 className={`font-semibold truncate ${fontSize} ${fontFamily}`}>{note.title}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id)
              }}
              className="h-6 w-6 p-0"
            >
              <Pin className={`h-3 w-3 ${note.isPinned ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(note)
              }}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <p
          className={`text-muted-foreground mb-3 ${fontSize} ${fontFamily} ${
            viewMode === "list" ? "line-clamp-2" : "line-clamp-3"
          }`}
        >
          {note.content}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{category?.icon}</span>
            <span>{category?.label}</span>
            {linkedProject && (
              <>
                <span>•</span>
                <span className="truncate">{linkedProject.title}</span>
              </>
            )}
          </div>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, viewMode === "list" ? 2 : 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > (viewMode === "list" ? 2 : 3) && (
                <Badge variant="outline" className="text-xs">
                  +{note.tags.length - (viewMode === "list" ? 2 : 3)}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">{note.updatedAt.toLocaleDateString()}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleArchive(note.id)
                }}
                className="h-6 w-6 p-0"
              >
                <Archive className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(note.id)
                }}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Edit Note Dialog Component
function EditNoteDialog({
  note,
  projects,
  onSave,
  onCancel,
}: {
  note: Note
  projects: any[]
  onSave: (note: Note) => void
  onCancel: () => void
}) {
  const [editedNote, setEditedNote] = useState({
    ...note,
    tags: note.tags.join(", "),
    projectId: note.projectId || "none",
    fontSize: note.fontSize || "medium",
    fontFamily: note.fontFamily || "default",
    backgroundColor: note.backgroundColor || "default",
  })

  const handleSave = () => {
    const updatedNote: Note = {
      ...editedNote,
      tags: editedNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      projectId: editedNote.projectId === "none" ? undefined : editedNote.projectId,
    }
    onSave(updatedNote)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editedNote.title}
              onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={editedNote.content}
              onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editedNote.category}
                onValueChange={(value) => setEditedNote({ ...editedNote, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {projects.length > 0 && (
              <div>
                <Label htmlFor="edit-project">Linked Project</Label>
                <Select
                  value={editedNote.projectId}
                  onValueChange={(value) => setEditedNote({ ...editedNote, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-bg">Background</Label>
              <Select
                value={editedNote.backgroundColor}
                onValueChange={(value) => setEditedNote({ ...editedNote, backgroundColor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  {BACKGROUND_COLORS.map((bg) => (
                    <SelectItem key={bg.id} value={bg.value}>
                      {bg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-font-size">Font Size</Label>
              <Select
                value={editedNote.fontSize}
                onValueChange={(value) => setEditedNote({ ...editedNote, fontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-font-family">Font Style</Label>
              <Select
                value={editedNote.fontFamily}
                onValueChange={(value) => setEditedNote({ ...editedNote, fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font.id} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-tags">Tags</Label>
            <Input
              id="edit-tags"
              value={editedNote.tags}
              onChange={(e) => setEditedNote({ ...editedNote, tags: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
