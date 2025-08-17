"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Download, Upload, Mail, Cloud, HardDrive, Shield, CheckCircle, AlertCircle } from "lucide-react"
import type { Project } from "./project-dashboard"
import { GoogleDriveProvider, DropboxProvider, OneDriveProvider } from "@/lib/cloud-storage"
import { RealEmailBackupService } from "@/lib/email-backup"

interface AlternativeStorageProps {
  projects: Project[]
  user?: any
  onImportProjects: (projects: Project[]) => void
}

export function AlternativeStorage({ projects, user, onImportProjects }: AlternativeStorageProps) {
  const [exportSettings, setExportSettings] = useState({
    includeArchived: true,
    includeNotes: true,
    format: "json" as "json" | "csv" | "markdown",
  })
  const [emailBackup, setEmailBackup] = useState({
    enabled: false,
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    email: user?.email || "",
  })
  const [cloudSync, setCloudSync] = useState({
    googleDrive: false,
    dropbox: false,
    oneDrive: false,
  })
  const [importData, setImportData] = useState("")
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [cloudProviders] = useState({
    googleDrive: new GoogleDriveProvider(),
    dropbox: new DropboxProvider(),
    oneDrive: new OneDriveProvider(),
  })
  const [emailService] = useState(new RealEmailBackupService())
  const [syncStatus, setSyncStatus] = useState<Record<string, "idle" | "syncing" | "success" | "error">>({})

  useEffect(() => {
    const savedSettings = localStorage.getItem("alternativeStorageSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setEmailBackup((prev) => ({ ...prev, ...settings.emailBackup }))
      setCloudSync((prev) => ({ ...prev, ...settings.cloudSync }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "alternativeStorageSettings",
      JSON.stringify({
        emailBackup,
        cloudSync,
      }),
    )
  }, [emailBackup, cloudSync])

  const handleExportData = async () => {
    setIsExporting(true)
    setExportProgress(0)

    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    const projectsToExport = exportSettings.includeArchived ? projects : projects.filter((p) => p.status !== "archived")

    const exportData = {
      exportedAt: new Date().toISOString(),
      userRole: projects[0]?.userRole || "unknown",
      totalProjects: projectsToExport.length,
      projects: projectsToExport.map((project) => ({
        ...project,
        notes: exportSettings.includeNotes ? project.notes : "",
        createdAt: project.createdAt.toISOString(),
        lastActivity: project.lastActivity.toISOString(),
      })),
    }

    setTimeout(() => {
      let content = ""
      let filename = ""
      let mimeType = ""

      switch (exportSettings.format) {
        case "json":
          content = JSON.stringify(exportData, null, 2)
          filename = `projects-backup-${new Date().toISOString().split("T")[0]}.json`
          mimeType = "application/json"
          break
        case "csv":
          const headers = ["Title", "Type", "Status", "Description", "Created", "Last Activity"]
          const rows = projectsToExport.map((p) => [
            p.title,
            p.type,
            p.status,
            p.description,
            p.createdAt.toLocaleDateString(),
            p.lastActivity.toLocaleDateString(),
          ])
          content = [headers, ...rows].map((row) => row.join(",")).join("\n")
          filename = `projects-backup-${new Date().toISOString().split("T")[0]}.csv`
          mimeType = "text/csv"
          break
        case "markdown":
          content = `# Project Backup - ${new Date().toLocaleDateString()}\n\n`
          content += `**Total Projects:** ${projectsToExport.length}\n\n`
          projectsToExport.forEach((project) => {
            content += `## ${project.title}\n`
            content += `- **Type:** ${project.type}\n`
            content += `- **Status:** ${project.status}\n`
            content += `- **Created:** ${project.createdAt.toLocaleDateString()}\n`
            content += `- **Last Activity:** ${project.lastActivity.toLocaleDateString()}\n`
            if (project.description) content += `- **Description:** ${project.description}\n`
            if (exportSettings.includeNotes && project.notes) {
              content += `- **Notes:** ${project.notes}\n`
            }
            content += "\n---\n\n"
          })
          filename = `projects-backup-${new Date().toISOString().split("T")[0]}.md`
          mimeType = "text/markdown"
          break
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setIsExporting(false)
      setShowExport(false)
    }, 2000)
  }

  const handleImportData = () => {
    try {
      const parsed = JSON.parse(importData)
      if (parsed.projects && Array.isArray(parsed.projects)) {
        const importedProjects: Project[] = parsed.projects.map((p: any) => ({
          ...p,
          id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(p.createdAt),
          lastActivity: new Date(p.lastActivity),
          archiveData: p.archiveData
            ? {
                ...p.archiveData,
                archivedAt: new Date(p.archiveData.archivedAt),
              }
            : undefined,
        }))
        onImportProjects(importedProjects)
        setImportData("")
        setShowImport(false)
      }
    } catch (error) {
      console.error("Import error:", error)
      alert("Invalid import data. Please check the format and try again.")
    }
  }

  const handleEmailBackupSetup = async () => {
    if (!emailBackup.email) return

    try {
      const success = await emailService.setupBackup(emailBackup.email, emailBackup.frequency)

      if (success) {
        alert(`Email backup configured! You'll receive ${emailBackup.frequency} backups at ${emailBackup.email}`)

        await emailService.sendBackup(projects.slice(0, 3), emailBackup.email)
      } else {
        alert("Failed to setup email backup. Please try again.")
      }
    } catch (error) {
      console.error("Email backup setup error:", error)
      alert("Error setting up email backup. Please check your settings.")
    }
  }

  const handleCloudIntegration = async (provider: keyof typeof cloudSync) => {
    setSyncStatus((prev) => ({ ...prev, [provider]: "syncing" }))

    try {
      const cloudProvider =
        provider === "googleDrive"
          ? cloudProviders.googleDrive
          : provider === "dropbox"
            ? cloudProviders.dropbox
            : cloudProviders.oneDrive

      if (!cloudSync[provider]) {
        const authenticated = await cloudProvider.authenticate()

        if (authenticated) {
          const exportData = {
            exportedAt: new Date().toISOString(),
            projects: projects.map((p) => ({
              ...p,
              createdAt: p.createdAt.toISOString(),
              lastActivity: p.lastActivity.toISOString(),
            })),
          }

          const filename = `productivity-app-backup-${new Date().toISOString().split("T")[0]}.json`
          await cloudProvider.upload(filename, JSON.stringify(exportData, null, 2))

          setCloudSync((prev) => ({ ...prev, [provider]: true }))
          setSyncStatus((prev) => ({ ...prev, [provider]: "success" }))

          alert(`${cloudProvider.name} connected successfully! Your projects have been synced.`)
        } else {
          setSyncStatus((prev) => ({ ...prev, [provider]: "error" }))
          alert(`Failed to connect to ${cloudProvider.name}. Please try again.`)
        }
      } else {
        setCloudSync((prev) => ({ ...prev, [provider]: false }))
        setSyncStatus((prev) => ({ ...prev, [provider]: "idle" }))
        alert(`${cloudProvider.name} disconnected.`)
      }
    } catch (error) {
      console.error(`${provider} integration error:`, error)
      setSyncStatus((prev) => ({ ...prev, [provider]: "error" }))
      alert(`Error connecting to ${provider}. Please try again.`)
    }
  }

  useEffect(() => {
    const syncToCloud = async () => {
      for (const [provider, isConnected] of Object.entries(cloudSync)) {
        if (isConnected && projects.length > 0) {
          try {
            const cloudProvider =
              provider === "googleDrive"
                ? cloudProviders.googleDrive
                : provider === "dropbox"
                  ? cloudProviders.dropbox
                  : cloudProviders.oneDrive

            const exportData = {
              exportedAt: new Date().toISOString(),
              projects: projects.map((p) => ({
                ...p,
                createdAt: p.createdAt.toISOString(),
                lastActivity: p.lastActivity.toISOString(),
              })),
            }

            const filename = `productivity-app-sync-${Date.now()}.json`
            await cloudProvider.upload(filename, JSON.stringify(exportData, null, 2))
            console.log(`[v0] Auto-synced to ${provider}`)
          } catch (error) {
            console.error(`Auto-sync error for ${provider}:`, error)
          }
        }
      }
    }

    const timeoutId = setTimeout(syncToCloud, 5000)
    return () => clearTimeout(timeoutId)
  }, [projects, cloudSync, cloudProviders])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Alternative Storage & Backup Options
          </CardTitle>
          <CardDescription>
            Keep your creative work safe with multiple backup strategies and storage options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Your Data
                </CardTitle>
                <CardDescription>Download your projects in various formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include archived projects</span>
                  <Switch
                    checked={exportSettings.includeArchived}
                    onCheckedChange={(checked) => setExportSettings((prev) => ({ ...prev, includeArchived: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include notes</span>
                  <Switch
                    checked={exportSettings.includeNotes}
                    onCheckedChange={(checked) => setExportSettings((prev) => ({ ...prev, includeNotes: checked }))}
                  />
                </div>
                <Dialog open={showExport} onOpenChange={setShowExport}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export Projects
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Your Projects</DialogTitle>
                      <DialogDescription>Choose the format for your project backup</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Export Format</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {["json", "csv", "markdown"].map((format) => (
                            <Button
                              key={format}
                              variant={exportSettings.format === format ? "default" : "outline"}
                              size="sm"
                              onClick={() => setExportSettings((prev) => ({ ...prev, format: format as any }))}
                            >
                              {format.toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {isExporting && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Preparing export...</span>
                            <span>{exportProgress}%</span>
                          </div>
                          <Progress value={exportProgress} />
                        </div>
                      )}

                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowExport(false)} disabled={isExporting}>
                          Cancel
                        </Button>
                        <Button onClick={handleExportData} disabled={isExporting}>
                          {isExporting ? "Exporting..." : "Download"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Projects
                </CardTitle>
                <CardDescription>Restore from a previous backup</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showImport} onOpenChange={setShowImport}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Backup
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Project Backup</DialogTitle>
                      <DialogDescription>Paste your exported project data (JSON format)</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Paste your exported JSON data here..."
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        rows={8}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowImport(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleImportData} disabled={!importData.trim()}>
                          Import Projects
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Backup Service
              </CardTitle>
              <CardDescription>Receive regular backups of your projects via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enable email backups</span>
                <Switch
                  checked={emailBackup.enabled}
                  onCheckedChange={(checked) => setEmailBackup((prev) => ({ ...prev, enabled: checked }))}
                />
              </div>

              {emailBackup.enabled && (
                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                  <div>
                    <Label htmlFor="backup-email">Email Address</Label>
                    <Input
                      id="backup-email"
                      type="email"
                      value={emailBackup.email}
                      onChange={(e) => setEmailBackup((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label>Backup Frequency</Label>
                    <div className="flex gap-2 mt-1">
                      {["daily", "weekly", "monthly"].map((freq) => (
                        <Button
                          key={freq}
                          variant={emailBackup.frequency === freq ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEmailBackup((prev) => ({ ...prev, frequency: freq as any }))}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleEmailBackupSetup} size="sm">
                    Setup Email Backup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Cloud Storage Integration
              </CardTitle>
              <CardDescription>Sync your projects with popular cloud storage services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { key: "googleDrive", name: "Google Drive", icon: "📁" },
                  { key: "dropbox", name: "Dropbox", icon: "📦" },
                  { key: "oneDrive", name: "OneDrive", icon: "☁️" },
                ].map((provider) => (
                  <div
                    key={provider.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{provider.icon}</span>
                      <span className="font-medium text-blue-900 text-sm">{provider.name}</span>
                      <div className="flex items-center gap-1">
                        {syncStatus[provider.key] === "syncing" && (
                          <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                        )}
                        {syncStatus[provider.key] === "success" && <CheckCircle className="h-3 w-3 text-green-600" />}
                        {syncStatus[provider.key] === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                        {cloudSync[provider.key as keyof typeof cloudSync] && syncStatus[provider.key] !== "error" && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </div>
                    <Button
                      variant={cloudSync[provider.key as keyof typeof cloudSync] ? "outline" : "default"}
                      size="sm"
                      className={`h-7 px-3 text-xs ${
                        cloudSync[provider.key as keyof typeof cloudSync]
                          ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      onClick={() => handleCloudIntegration(provider.key as keyof typeof cloudSync)}
                      disabled={syncStatus[provider.key] === "syncing"}
                    >
                      {syncStatus[provider.key] === "syncing"
                        ? "Connecting..."
                        : cloudSync[provider.key as keyof typeof cloudSync]
                          ? "Disconnect"
                          : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>

              {(cloudSync.googleDrive || cloudSync.dropbox || cloudSync.oneDrive) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">Auto-sync enabled</p>
                  <p className="text-xs text-blue-600">
                    Your projects automatically sync to connected cloud services when changes are made.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <Shield className="h-4 w-4" />
                Your Data, Your Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700">Complete Data Ownership</p>
                  <p className="text-xs text-green-600">Export your data anytime in multiple formats</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700">Privacy First</p>
                  <p className="text-xs text-green-600">Your projects stay private unless you choose to share</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700">No Vendor Lock-in</p>
                  <p className="text-xs text-green-600">Standard formats ensure compatibility with other tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
