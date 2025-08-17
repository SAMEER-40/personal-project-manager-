"use client"

import type { Project } from "@/components/project-dashboard"

export interface EmailBackupService {
  setupBackup: (email: string, frequency: string) => Promise<boolean>
  sendBackup: (projects: Project[], email: string) => Promise<boolean>
}

export class RealEmailBackupService implements EmailBackupService {
  async setupBackup(email: string, frequency: string): Promise<boolean> {
    try {
      const response = await fetch("/api/email-backup/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          frequency,
          userId: localStorage.getItem("userId"), // Get from auth context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to setup email backup")
      }

      const result = await response.json()

      // Store backup settings locally
      localStorage.setItem(
        "emailBackupSettings",
        JSON.stringify({
          email,
          frequency,
          setupDate: new Date().toISOString(),
          nextBackup: result.nextBackupDate,
        }),
      )

      return true
    } catch (error) {
      console.error("Email backup setup error:", error)
      return false
    }
  }

  async sendBackup(projects: Project[], email: string): Promise<boolean> {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalProjects: projects.length,
        projects: projects.map((project) => ({
          ...project,
          createdAt: project.createdAt.toISOString(),
          lastActivity: project.lastActivity.toISOString(),
        })),
      }

      const response = await fetch("/api/email-backup/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          data: exportData,
          subject: `Your Project Backup - ${new Date().toLocaleDateString()}`,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Email backup send error:", error)
      return false
    }
  }
}
