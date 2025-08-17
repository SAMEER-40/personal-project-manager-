"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StickyNote, X } from "lucide-react"
import { NoteTakingSystem } from "./note-taking-system"

interface FloatingNoteButtonProps {
  user?: any
  projects: any[]
}

export function FloatingNoteButton({ user, projects }: FloatingNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-110"
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <StickyNote className="h-6 w-6" />}
        </Button>
      </div>

      {/* Floating Note Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="fixed bottom-24 right-6 w-[90vw] max-w-md max-h-[70vh] bg-background border rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Quick Notes
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
              <NoteTakingSystem user={user} projects={projects} isFloating={true} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
