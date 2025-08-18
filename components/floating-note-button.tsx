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
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-110 active:scale-95"
          size="icon"
        >
          {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <StickyNote className="h-5 w-5 sm:h-6 sm:w-6" />}
        </Button>
      </div>

      {/* Floating Note Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="fixed bottom-18 right-2 left-2 sm:bottom-24 sm:right-6 sm:left-auto sm:w-[90vw] sm:max-w-md lg:max-w-lg max-h-[80vh] sm:max-h-[75vh] bg-background border rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2 text-base">
                <StickyNote className="h-5 w-5" />
                Quick Notes
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-70px)] sm:max-h-[calc(75vh-80px)]">
              <NoteTakingSystem user={user} projects={projects} isFloating={true} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
