"use client"

import { supabase } from "@/lib/supabase/client"

export interface LocalStorageProject {
  id: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  tags: string[]
  notes: string
  archiveType?: string
  archiveNote?: string
  lessonsLearned?: string
  createdAt: string
  updatedAt: string
  lastActivity: string
}

export async function migrateLocalStorageToSupabase(userId: string) {
  try {
    // Get data from localStorage
    const projects = JSON.parse(localStorage.getItem("projects") || "[]") as LocalStorageProject[]
    const moodHistory = JSON.parse(localStorage.getItem("moodHistory") || "[]")
    const activityStreak = JSON.parse(localStorage.getItem("activityStreak") || "0")

    // Migrate projects
    if (projects.length > 0) {
      const projectsToInsert = projects.map((project) => ({
        id: project.id,
        user_id: userId,
        title: project.title,
        description: project.description,
        type: project.type,
        status: project.status,
        priority: project.priority,
        tags: project.tags,
        notes: project.notes,
        archive_type: project.archiveType,
        archive_note: project.archiveNote,
        lessons_learned: project.lessonsLearned,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
        last_activity: project.lastActivity,
      }))

      const { error: projectsError } = await supabase.from("projects").upsert(projectsToInsert)

      if (projectsError) {
        console.error("Error migrating projects:", projectsError)
      }
    }

    // Migrate mood history
    if (moodHistory.length > 0) {
      const moodEntriesToInsert = moodHistory.map((entry: any) => ({
        user_id: userId,
        mood: entry.mood,
        energy: entry.energy,
        notes: entry.notes,
        created_at: entry.timestamp,
      }))

      const { error: moodError } = await supabase.from("mood_entries").upsert(moodEntriesToInsert)

      if (moodError) {
        console.error("Error migrating mood entries:", moodError)
      }
    }

    // Migrate activity streak
    if (activityStreak > 0) {
      const { error: streakError } = await supabase.from("activity_streaks").upsert([
        {
          user_id: userId,
          current_streak: activityStreak,
          longest_streak: activityStreak,
        },
      ])

      if (streakError) {
        console.error("Error migrating activity streak:", streakError)
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem("projects")
    localStorage.removeItem("moodHistory")
    localStorage.removeItem("activityStreak")
    localStorage.setItem("migrated", "true")

    return { success: true }
  } catch (error) {
    console.error("Migration error:", error)
    return { success: false, error }
  }
}

export function hasLocalStorageData(): boolean {
  const projects = localStorage.getItem("projects")
  const moodHistory = localStorage.getItem("moodHistory")
  const activityStreak = localStorage.getItem("activityStreak")
  const migrated = localStorage.getItem("migrated")

  return (
    !migrated &&
    ((projects && JSON.parse(projects).length > 0) ||
      (moodHistory && JSON.parse(moodHistory).length > 0) ||
      (activityStreak && Number.parseInt(activityStreak) > 0))
  )
}
