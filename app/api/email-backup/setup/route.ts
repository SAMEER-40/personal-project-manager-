import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, frequency, userId } = await request.json()
    const supabase = createClient()

    const { data, error } = await supabase.from("email_backup_settings").upsert({
      user_id: userId,
      email,
      frequency,
      enabled: true,
      created_at: new Date().toISOString(),
      next_backup: calculateNextBackup(frequency),
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      nextBackupDate: calculateNextBackup(frequency),
    })
  } catch (error) {
    console.error("Email backup setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateNextBackup(frequency: string): string {
  const now = new Date()
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1)
      break
    case "weekly":
      now.setDate(now.getDate() + 7)
      break
    case "monthly":
      now.setMonth(now.getMonth() + 1)
      break
  }
  return now.toISOString()
}
