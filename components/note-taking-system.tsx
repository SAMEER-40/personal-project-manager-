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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Type,
  Layout,
  Mic,
  Brain,
  Clock,
  Zap,
  Moon,
  Sun,
  Sparkles,
  Camera,
  Link,
  Lock,
  Eye,
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
  isPrivate?: boolean
  reminderDate?: Date
  voiceNote?: string
  attachments?: string[]
  mood?: string
  priority?: "low" | "medium" | "high"
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
  { id: "yellow", label: "Sunny Yellow", value: "bg-yellow-50 dark:bg-yellow-950/20" },
  { id: "blue", label: "Ocean Blue", value: "bg-blue-50 dark:bg-blue-950/20" },
  { id: "green", label: "Forest Green", value: "bg-green-50 dark:bg-green-950/20" },
  { id: "purple", label: "Royal Purple", value: "bg-purple-50 dark:bg-purple-950/20" },
  { id: "pink", label: "Blossom Pink", value: "bg-pink-50 dark:bg-pink-950/20" },
  { id: "orange", label: "Sunset Orange", value: "bg-orange-50 dark:bg-orange-950/20" },
  { id: "teal", label: "Mint Teal", value: "bg-teal-50 dark:bg-teal-950/20" },
  { id: "indigo", label: "Deep Indigo", value: "bg-indigo-50 dark:bg-indigo-950/20" },
  { id: "rose", label: "Rose Gold", value: "bg-rose-50 dark:bg-rose-950/20" },
]

const FONT_SIZES = [
  { id: "tiny", label: "Tiny", value: "text-xs" },
  { id: "small", label: "Small", value: "text-sm" },
  { id: "medium", label: "Medium", value: "text-base" },
  { id: "large", label: "Large", value: "text-lg" },
  { id: "huge", label: "Huge", value: "text-xl" },
]

const FONT_FAMILIES = [
  { id: "default", label: "Default", value: "default" },
  { id: "mono", label: "Monospace", value: "font-mono" },
  { id: "serif", label: "Serif", value: "font-serif" },
  { id: "handwriting", label: "Handwriting", value: "font-serif italic" },
  { id: "bold", label: "Bold Sans", value: "font-sans font-bold" },
]

const APPEARANCE_THEMES = [
  { id: "minimal", label: "Minimal", description: "Clean and simple" },
  { id: "colorful", label: "Colorful", description: "Vibrant and energetic" },
  { id: "dark", label: "Dark Mode", description: "Easy on the eyes" },
  { id: "vintage", label: "Vintage", description: "Classic paper feel" },
  { id: "neon", label: "Neon", description: "Futuristic glow" },
]

const MOOD_OPTIONS = [
  { id: "excited", label: "Excited", icon: "🤩", color: "text-yellow-500" },
  { id: "focused", label: "Focused", icon: "🎯", color: "text-blue-500" },
  { id: "creative", label: "Creative", icon: "🎨", color: "text-purple-500" },
  { id: "calm", label: "Calm", icon: "😌", color: "text-green-500" },
  { id: "stressed", label: "Stressed", icon: "😰", color: "text-red-500" },
  { id: "inspired", label: "Inspired", icon: "✨", color: "text-pink-500" },
]

export function NoteTakingSystem({ user, projects = [], isFloating = false }: NoteTakingSystemProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("general")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [customSettings, setCustomSettings] = useState({
    theme: "minimal",
    autoSave: true,
    smartSuggestions: true,
    voiceNotes: false,
    aiAssistance: false,
    darkMode: false,
    compactMode: false,
    showMoodTracker: true,
    reminderNotifications: true,
    exportFormat: "markdown",
  })
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
    isPrivate: false,
    mood: "no-mood",
    priority: "medium" as "low" | "medium" | "high",
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

  useEffect(() => {
    const savedSettings = localStorage.getItem("noteCustomSettings")
    if (savedSettings) {
      setCustomSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("noteCustomSettings", JSON.stringify(customSettings))
  }, [customSettings])

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
      isPrivate: newNote.isPrivate,
      mood: newNote.mood === "no-mood" ? undefined : newNote.mood,
      priority: newNote.priority,
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
      isPrivate: false,
      mood: "no-mood",
      priority: "medium",
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
    <Card
      className={`w-full ${isFloating ? "border-0 shadow-none" : ""} ${customSettings.theme === "dark" ? "dark" : ""}`}
    >
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customSettings.showMoodTracker && (
                      <div>
                        <Label htmlFor="note-mood">Current Mood (Optional)</Label>
                        <Select value={newNote.mood} onValueChange={(value) => setNewNote({ ...newNote, mood: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mood..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-mood">No mood</SelectItem>
                            {MOOD_OPTIONS.map((mood) => (
                              <SelectItem key={mood.id} value={mood.id}>
                                {mood.icon} {mood.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="note-priority">Priority</Label>
                      <Select
                        value={newNote.priority}
                        onValueChange={(value) =>
                          setNewNote({ ...newNote, priority: value as "low" | "medium" | "high" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Low</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="high">🔴 High</SelectItem>
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="note-private"
                      checked={newNote.isPrivate}
                      onCheckedChange={(checked) => setNewNote({ ...newNote, isPrivate: checked })}
                    />
                    <Label htmlFor="note-private" className="flex items-center gap-2">
                      {newNote.isPrivate ? <Lock className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      Private Note
                    </Label>
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
          <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Advanced Note Customization
              </DialogTitle>
              <DialogDescription>
                Transform your note-taking experience with powerful customization options.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1 justify-start">
                <TabsTrigger
                  value="appearance"
                  className="text-xs sm:text-sm py-2 flex-1 min-w-[calc(50%-0.125rem)] sm:min-w-[calc(33.333%-0.25rem)] lg:min-w-[calc(16.666%-0.25rem)]"
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="behavior"
                  className="text-xs sm:text-sm py-2 flex-1 min-w-[calc(50%-0.125rem)] sm:min-w-[calc(33.333%-0.25rem)] lg:min-w-[calc(16.666%-0.25rem)]"
                >
                  Behavior
                </TabsTrigger>
                <TabsTrigger
                  value="organization"
                  className="text-xs sm:text-sm py-2 flex-1 min-w-[calc(50%-0.125rem)] sm:min-w-[calc(33.333%-0.25rem)] lg:min-w-[calc(16.666%-0.25rem)]"
                >
                  Organization
                </TabsTrigger>
                <TabsTrigger
                  value="experimental"
                  className="text-xs sm:text-sm py-2 flex-1 min-w-[calc(50%-0.125rem)] sm:min-w-[calc(33.333%-0.25rem)] lg:min-w-[calc(16.666%-0.25rem)]"
                >
                  Experimental
                </TabsTrigger>
                <TabsTrigger
                  value="theme"
                  className="text-xs sm:text-sm py-2 flex-1 min-w-[calc(50%-0.125rem)] sm:min-w-[calc(33.333%-0.25rem)] lg:min-w-[calc(16.666%-0.25rem)]"
                >
                  Theme
                </TabsTrigger>
                <TabsTrigger
                  value="style"
                  className="text-xs sm:text-sm py-2 flex-1 min-w-[calc(50%-0.125rem)] sm:min-w-[calc(33.333%-0.25rem)] lg:min-w-[calc(16.666%-0.25rem)]"
                >
                  Style
                </TabsTrigger>
              </TabsList>

              <div className="max-h-[50vh] overflow-y-auto mt-4">
                <TabsContent value="appearance" className="space-y-4">
                  <div>
                    <Label>Theme Style</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {APPEARANCE_THEMES.map((theme) => (
                        <Button
                          key={theme.id}
                          variant={customSettings.theme === theme.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomSettings({ ...customSettings, theme: theme.id })}
                          className="flex flex-col h-auto py-3 text-left"
                        >
                          <span className="font-medium">{theme.label}</span>
                          <span className="text-xs text-muted-foreground">{theme.description}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {customSettings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <Label>Dark Mode</Label>
                    </div>
                    <Switch
                      checked={customSettings.darkMode}
                      onCheckedChange={(checked) => setCustomSettings({ ...customSettings, darkMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Compact Mode</Label>
                    <Switch
                      checked={customSettings.compactMode}
                      onCheckedChange={(checked) => setCustomSettings({ ...customSettings, compactMode: checked })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      <Label>Auto-save Notes</Label>
                    </div>
                    <Switch
                      checked={customSettings.autoSave}
                      onCheckedChange={(checked) => setCustomSettings({ ...customSettings, autoSave: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <Label>Smart Suggestions</Label>
                    </div>
                    <Switch
                      checked={customSettings.smartSuggestions}
                      onCheckedChange={(checked) => setCustomSettings({ ...customSettings, smartSuggestions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Label>Reminder Notifications</Label>
                    </div>
                    <Switch
                      checked={customSettings.reminderNotifications}
                      onCheckedChange={(checked) =>
                        setCustomSettings({ ...customSettings, reminderNotifications: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label>Export Format</Label>
                    <Select
                      value={customSettings.exportFormat}
                      onValueChange={(value) => setCustomSettings({ ...customSettings, exportFormat: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown (.md)</SelectItem>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                        <SelectItem value="txt">Plain Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="organization" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Show Mood Tracker</Label>
                    <Switch
                      checked={customSettings.showMoodTracker}
                      onCheckedChange={(checked) => setCustomSettings({ ...customSettings, showMoodTracker: checked })}
                    />
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
                        <Search className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)}>
                        <Archive className="h-4 w-4 mr-2" />
                        {showArchived ? "Show Active" : "Show Archived"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experimental" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <Label>Voice Notes (Beta)</Label>
                    </div>
                    <Switch
                      checked={customSettings.voiceNotes}
                      onCheckedChange={(checked) => setCustomSettings({ ...customSettings, voiceNotes: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <Label>AI Writing Assistant</Label>
                    </div>
                    <Switch
                      checked={customSettings.aiAssistance}
                      onCheckedChange={(checked) => setCustomSettings({ ...customSettings, aiAssistance: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Experimental Features</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" size="sm" className="justify-start bg-transparent">
                        <Camera className="h-4 w-4 mr-2" />
                        Image Recognition
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start bg-transparent">
                        <Link className="h-4 w-4 mr-2" />
                        Smart Linking
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start bg-transparent">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Auto-categorization
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="theme" className="space-y-4">
                  <div>
                    <Label>Color Themes</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {[
                        { id: "ocean", name: "Ocean Blue", colors: ["#0ea5e9", "#0284c7"] },
                        { id: "forest", name: "Forest Green", colors: ["#059669", "#047857"] },
                        { id: "sunset", name: "Sunset Orange", colors: ["#ea580c", "#dc2626"] },
                        { id: "lavender", name: "Lavender", colors: ["#8b5cf6", "#7c3aed"] },
                        { id: "rose", name: "Rose Gold", colors: ["#f43f5e", "#e11d48"] },
                        { id: "midnight", name: "Midnight", colors: ["#1e293b", "#0f172a"] },
                      ].map((theme) => (
                        <Button
                          key={theme.id}
                          variant="outline"
                          className="h-16 flex flex-col gap-1 p-2 bg-transparent"
                          onClick={() => setCustomSettings({ ...customSettings, colorTheme: theme.id })}
                        >
                          <div className="flex gap-1">
                            {theme.colors.map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <span className="text-xs">{theme.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label>Note Styles</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {[
                        { id: "card", name: "Card Style", desc: "Clean cards with shadows" },
                        { id: "paper", name: "Paper Style", desc: "Classic notebook feel" },
                        { id: "sticky", name: "Sticky Notes", desc: "Colorful sticky notes" },
                        { id: "minimal", name: "Minimal Lines", desc: "Simple line separators" },
                      ].map((style) => (
                        <Button
                          key={style.id}
                          variant={customSettings.noteStyle === style.id ? "default" : "outline"}
                          className="h-auto p-3 flex flex-col text-left"
                          onClick={() => setCustomSettings({ ...customSettings, noteStyle: style.id })}
                        >
                          <span className="font-medium">{style.name}</span>
                          <span className="text-xs text-muted-foreground">{style.desc}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowCustomization(false)}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
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
  const mood = MOOD_OPTIONS.find((m) => m.id === note.mood)

  const fontSize = FONT_SIZES.find((s) => s.id === note.fontSize)?.value || "text-base"
  const fontFamily =
    FONT_FAMILIES.find((f) => f.id === note.fontFamily)?.value === "default"
      ? ""
      : FONT_FAMILIES.find((f) => f.id === note.fontFamily)?.value || ""
  const backgroundColor = note.backgroundColor === "default" ? "" : note.backgroundColor || ""

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return ""
    }
  }

  const cardClasses = `cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(note.priority)} ${
    note.isPinned ? "ring-2 ring-primary/20" : ""
  } ${backgroundColor} ${viewMode === "list" ? "flex items-start gap-4 p-4" : ""}`

  return (
    <Card className={cardClasses}>
      <CardContent className={viewMode === "list" ? "flex-1 p-0" : "p-4"}>
        <div className={`flex items-start justify-between mb-2 ${viewMode === "list" ? "mb-1" : ""}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {note.isPinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
            {note.isPrivate && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
            <h3 className={`font-semibold truncate ${fontSize} ${fontFamily}`}>{note.title}</h3>
            {mood && <span className="text-sm">{mood.icon}</span>}
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
    mood: note.mood || "no-mood",
    priority: note.priority || "medium",
    isPrivate: note.isPrivate || false,
  })

  const handleSave = () => {
    const updatedNote: Note = {
      ...editedNote,
      tags: editedNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      projectId: editedNote.projectId === "none" ? undefined : editedNote.projectId,
      mood: editedNote.mood === "no-mood" ? undefined : editedNote.mood,
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-mood">Mood</Label>
              <Select value={editedNote.mood} onValueChange={(value) => setEditedNote({ ...editedNote, mood: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-mood">No mood</SelectItem>
                  {MOOD_OPTIONS.map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      {mood.icon} {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editedNote.priority}
                onValueChange={(value) =>
                  setEditedNote({ ...editedNote, priority: value as "low" | "medium" | "high" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-private"
              checked={editedNote.isPrivate}
              onCheckedChange={(checked) => setEditedNote({ ...editedNote, isPrivate: checked })}
            />
            <Label htmlFor="edit-private" className="flex items-center gap-2">
              {editedNote.isPrivate ? <Lock className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Private Note
            </Label>
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
