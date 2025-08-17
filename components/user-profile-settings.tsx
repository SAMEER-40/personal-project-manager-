"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Settings, Bell, Shield, Download, Trash2, Save } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface UserProfileSettingsProps {
  user: any
  userRole: any
  onSignOut: () => void
  onRoleChange: (newRole: string) => void
}

const USER_ROLES = [
  { id: "developer", title: "Developer", icon: "🧑‍💻" },
  { id: "writer", title: "Writer", icon: "✍️" },
  { id: "student", title: "Student", icon: "🎓" },
  { id: "entrepreneur", title: "Entrepreneur", icon: "💼" },
  { id: "creative", title: "Creative Hobbyist", icon: "🎨" },
]

export function UserProfileSettings({ user, userRole, onSignOut, onRoleChange }: UserProfileSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    timezone: "",
    role: userRole?.id || "",
  })
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyDigest: true,
    reflectionReminders: true,
    darkMode: false,
    autoArchive: false,
    reminderFrequency: "weekly",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      loadUserProfile()
    }
  }, [user, isOpen])

  const loadUserProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Load user profile
      const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (userProfile) {
        setProfile({
          displayName: userProfile.display_name || userProfile.name || "",
          bio: userProfile.bio || "",
          timezone: userProfile.timezone || "",
          role: userProfile.role?.toLowerCase() || userRole?.id || "",
        })
      }

      // Load user settings (you might want to create a settings table)
      const savedSettings = localStorage.getItem(`userSettings_${user.id}`)
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const updateData: any = {
        name: profile.displayName, // Save display name as name field (existing column)
        role: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
        updated_at: new Date().toISOString(),
      }

      // Only add fields if they exist in the database schema
      if (profile.displayName) updateData.display_name = profile.displayName
      if (profile.bio) updateData.bio = profile.bio
      if (profile.timezone) updateData.timezone = profile.timezone

      const { error } = await supabase.from("users").update(updateData).eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error.message)
        if (error.message.includes("column") && error.message.includes("schema cache")) {
          console.log("Some profile fields are not available in the current database schema")
          // Try updating with only basic fields
          const basicUpdate = {
            name: profile.displayName,
            role: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
            updated_at: new Date().toISOString(),
          }

          const { error: basicError } = await supabase.from("users").update(basicUpdate).eq("id", user.id)

          if (basicError) throw basicError
        } else {
          throw error
        }
      }

      // Save settings to localStorage
      localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings))

      // If role changed, notify parent component
      if (profile.role !== userRole?.id) {
        onRoleChange(profile.role)
      }

      setIsOpen(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const exportUserData = async () => {
    if (!user) return

    try {
      // Get all user data
      const { data: projects } = await supabase.from("projects").select("*").eq("user_id", user.id)

      const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

      const userData = {
        profile: userProfile,
        projects: projects,
        settings: settings,
        exportDate: new Date().toISOString(),
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `productivity-tool-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  const deleteAccount = async () => {
    if (!user) return

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your projects and data.",
    )

    if (!confirmed) return

    try {
      // Delete user projects first
      await supabase.from("projects").delete().eq("user_id", user.id)

      // Delete user profile
      await supabase.from("users").delete().eq("id", user.id)

      // Sign out and redirect
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const selectedRoleData = USER_ROLES.find((r) => r.id === profile.role)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <User className="h-4 w-4" />
          Profile & Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profile & Settings
          </DialogTitle>
          <DialogDescription>Manage your account, preferences, and data</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl">{selectedRoleData?.icon || "👤"}</div>
                    <div>
                      <div className="font-medium">{user?.email}</div>
                      <div className="text-sm text-muted-foreground">{selectedRoleData?.title || "User"}</div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="How should we address you?"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={profile.role} onValueChange={(value) => setProfile({ ...profile, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              <span>{role.icon}</span>
                              <span>{role.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your creative journey..."
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      placeholder="e.g., America/New_York"
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Control how and when you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive updates via email</div>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Weekly Digest</div>
                      <div className="text-sm text-muted-foreground">Summary of your project activity</div>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Reflection Reminders</div>
                      <div className="text-sm text-muted-foreground">Gentle nudges to review dormant projects</div>
                    </div>
                    <Switch
                      checked={settings.reflectionReminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, reflectionReminders: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                    <Select
                      value={settings.reminderFrequency}
                      onValueChange={(value) => setSettings({ ...settings, reminderFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Automation</CardTitle>
                  <CardDescription>Automatic project management features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-Archive Inactive Projects</div>
                      <div className="text-sm text-muted-foreground">Archive projects after 90 days of inactivity</div>
                    </div>
                    <Switch
                      checked={settings.autoArchive}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoArchive: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                  <CardDescription>Export, backup, and manage your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Export All Data</div>
                      <div className="text-sm text-muted-foreground">Download your complete project history</div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={exportUserData}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-2">Data Storage</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Your data is securely stored and synchronized across devices
                    </div>
                    <Badge variant="secondary">Supabase Cloud Storage</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>Manage your account and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Sign Out</div>
                      <div className="text-sm text-muted-foreground">Sign out of your account</div>
                    </div>
                    <Button variant="outline" onClick={onSignOut}>
                      Sign Out
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div>
                        <div className="font-medium text-destructive">Delete Account</div>
                        <div className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </div>
                      </div>
                      <Button variant="destructive" onClick={deleteAccount} className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveProfile} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
