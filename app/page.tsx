"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectDashboard } from "@/components/project-dashboard"
import { DataSyncProvider, useDataSync } from "@/components/data-sync-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from "@/lib/supabase/client"
import { signOut } from "@/lib/auth-actions"

const USER_ROLES = [
  {
    id: "developer",
    title: "Developer",
    icon: "🧑‍💻",
    description: "Building apps, websites, and digital solutions",
    examples: ["Side projects", "Open source contributions", "Learning new frameworks"],
  },
  {
    id: "writer",
    title: "Writer",
    icon: "✍️",
    description: "Crafting stories, articles, and creative content",
    examples: ["Blog posts", "Novel chapters", "Poetry collections"],
  },
  {
    id: "student",
    title: "Student",
    icon: "🎓",
    description: "Learning, researching, and academic pursuits",
    examples: ["Course projects", "Research papers", "Study goals"],
  },
  {
    id: "entrepreneur",
    title: "Entrepreneur",
    icon: "💼",
    description: "Building businesses and innovative solutions",
    examples: ["Startup ideas", "Business plans", "Market research"],
  },
  {
    id: "creative",
    title: "Creative Hobbyist",
    icon: "🎨",
    description: "Exploring artistic and creative expressions",
    examples: ["Art projects", "Music compositions", "Craft projects"],
  },
]

function HomePageContent() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const { user, isLoading } = useDataSync()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const loadUserProfile = async () => {
      if (profileLoading) return

      console.log("[v0] Loading user profile, user:", user, "isLoading:", isLoading)

      if (user && !userProfile) {
        setProfileLoading(true)
        console.log("[v0] User found, querying profile for user ID:", user.id)
        try {
          const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single()

          console.log("[v0] Profile query result:", { profile, error })

          if (profile && !error) {
            console.log("[v0] Profile found, setting role:", profile.role)
            setSelectedRole(profile.role.toLowerCase())
            setUserProfile(profile)
            setShowDashboard(true)
          } else {
            console.log("[v0] No profile found, user needs to select role")
            setSelectedRole(null)
            setShowDashboard(false)
          }
        } catch (error) {
          console.error("[v0] Error loading profile:", error)
        } finally {
          setProfileLoading(false)
        }
      } else if (!user) {
        console.log("[v0] No user, showing role selection instead of auto-loading from localStorage")
        setSelectedRole(null)
        setShowDashboard(false)
      }
    }

    if (!isLoading) {
      loadUserProfile()
    }
  }, [user, isLoading, userProfile, profileLoading])

  useEffect(() => {
    console.log("[v0] Dashboard display state:", {
      showDashboard,
      selectedRole,
      selectedRoleData: selectedRoleData ? selectedRoleData.title : null,
      isLoading,
      user: user ? user.email : null,
    })
  }, [showDashboard, selectedRole, isLoading, user])

  const handleRoleSelect = async (roleId: string) => {
    console.log("[v0] Role selected:", roleId, "User:", user)
    setSelectedRole(roleId)
    setShowWelcome(true)

    if (user) {
      console.log("[v0] Upserting user profile to database")
      try {
        const { data, error } = await supabase.from("users").upsert([
          {
            id: user.id,
            email: user.email,
            role: roleId.charAt(0).toUpperCase() + roleId.slice(1),
          },
        ])
        console.log("[v0] Upsert result:", { data, error })

        if (!error) {
          setUserProfile({
            id: user.id,
            email: user.email,
            role: roleId.charAt(0).toUpperCase() + roleId.slice(1),
          })

          await supabase.from("activity_streaks").upsert([
            {
              user_id: user.id,
              current_streak: 0,
              longest_streak: 0,
            },
          ])
        }
      } catch (error) {
        console.error("[v0] Error saving profile:", error)
      }
    } else {
      console.log("[v0] Saving role to localStorage")
      localStorage.setItem("userRole", roleId)
    }
  }

  const handleStartManaging = () => {
    setShowDashboard(true)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const selectedRoleData = USER_ROLES.find((role) => role.id === selectedRole)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🧭</div>
          <p className="text-muted-foreground">Loading your project sanctuary...</p>
        </div>
      </div>
    )
  }

  if (showDashboard && selectedRoleData) {
    console.log("[v0] Rendering ProjectDashboard with role:", selectedRoleData.title)
    return (
      <ProjectDashboard
        userRole={selectedRoleData}
        onBackToWelcome={() => setShowDashboard(false)}
        user={user}
        onSignOut={handleSignOut}
      />
    )
  }

  if (showWelcome && selectedRoleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            {user && <div className="text-sm text-muted-foreground">Welcome back, {user.email}</div>}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl mb-6">{selectedRoleData.icon}</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Welcome, {selectedRoleData.title}!</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Let's help you reconnect with your creative journey and give your unfinished projects the attention they
              deserve.
            </p>
          </div>

          <Card className="mb-8 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-2xl">{selectedRoleData.icon}</span>
                Your Creative Space
              </CardTitle>
              <CardDescription className="text-base">
                A supportive environment designed specifically for {selectedRoleData.description.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-foreground">What you can manage here:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRoleData.examples.map((example, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Remember:</strong> Every creative journey has pauses, pivots, and
                  new beginnings. This tool is here to help you navigate them with kindness and intention.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleStartManaging} size="lg" className="bg-primary hover:bg-primary/90 px-8">
              Start Managing Projects
            </Button>
            <Button variant="outline" onClick={() => setShowWelcome(false)} size="lg" className="px-8">
              Choose Different Role
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          {user && <div className="text-sm text-muted-foreground">Signed in as {user.email}</div>}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            )}
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Welcome to Your Project Sanctuary
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A gentle space to reconnect with your unfinished projects, reflect on your creative journey, and move
            forward with intention—not guilt.
          </p>
          {!user && (
            <div className="mt-8 p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Sign in to sync your projects across devices and never lose your creative work.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={() => (window.location.href = "/auth/login")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => (window.location.href = "/auth/sign-up")}>
                  Create Account
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6">First, tell us about yourself</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose the role that best describes your creative work. This helps us tailor the experience to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {USER_ROLES.map((role) => (
            <Card
              key={role.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm group"
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{role.icon}</div>
                <CardTitle className="text-xl mb-2">{role.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Common projects:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.examples.map((example, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg border border-border/50 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3 text-lg">Not sure which fits?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Don't worry! You can always change your role later. The important thing is starting your journey toward
              more intentional project management.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <DataSyncProvider>
      <HomePageContent />
    </DataSyncProvider>
  )
}
