"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { migrateLocalStorageToSupabase, hasLocalStorageData } from "@/lib/data-migration"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DataSyncContextType {
  user: any
  isLoading: boolean
  showMigrationPrompt: boolean
  handleMigration: () => Promise<void>
  dismissMigration: () => void
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined)

export function useDataSync() {
  const context = useContext(DataSyncContext)
  if (!context) {
    throw new Error("useDataSync must be used within a DataSyncProvider")
  }
  return context
}

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  useEffect(() => {
    if (authInitialized) return

    console.log("[v0] DataSyncProvider: Initializing auth state")

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        console.log("[v0] Initial session check:", {
          session: !!session,
          user: session?.user?.email || "none",
          error: error?.message || "none",
        })

        if (session?.user) {
          setUser(session.user)
          console.log("[v0] User authenticated:", session.user.email)

          // Check if migration is needed
          if (hasLocalStorageData()) {
            console.log("[v0] Migration needed for authenticated user")
            setShowMigrationPrompt(true)
          }
        } else {
          setUser(null)
          console.log("[v0] No authenticated user found")
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
        setAuthInitialized(true)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", {
        event,
        session: !!session,
        user: session?.user?.email || "none",
      })

      if (session?.user) {
        setUser(session.user)
        console.log("[v0] User signed in:", session.user.email)

        // Check if migration is needed for new login
        if (hasLocalStorageData()) {
          console.log("[v0] Migration needed after auth change")
          setShowMigrationPrompt(true)
        }
      } else {
        setUser(null)
        console.log("[v0] User signed out")
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [authInitialized])

  const handleMigration = async () => {
    if (!user) return

    setIsLoading(true)
    const result = await migrateLocalStorageToSupabase(user.id)
    setIsLoading(false)

    if (result.success) {
      setShowMigrationPrompt(false)
      // Refresh the page to load cloud data
      window.location.reload()
    }
  }

  const dismissMigration = () => {
    localStorage.setItem("migrated", "true")
    setShowMigrationPrompt(false)
  }

  return (
    <DataSyncContext.Provider
      value={{
        user,
        isLoading,
        showMigrationPrompt,
        handleMigration,
        dismissMigration,
      }}
    >
      {children}
      {showMigrationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-sage-800">Migrate Your Data</CardTitle>
              <CardDescription>
                We found existing projects on this device. Would you like to sync them to your account?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleMigration} className="flex-1 bg-sage-600 hover:bg-sage-700" disabled={isLoading}>
                  {isLoading ? "Migrating..." : "Yes, Sync Data"}
                </Button>
                <Button onClick={dismissMigration} variant="outline" className="flex-1 bg-transparent">
                  Skip
                </Button>
              </div>
              <p className="text-xs text-sage-600">
                Your local data will be preserved until you choose to sync or start fresh.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </DataSyncContext.Provider>
  )
}
