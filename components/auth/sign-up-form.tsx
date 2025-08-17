"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signUp } from "@/lib/auth-actions"
import Link from "next/link"

const USER_ROLES = [
  { value: "Developer", label: "🧑‍💻 Developer", description: "Code projects, apps, and technical work" },
  { value: "Writer", label: "✍️ Writer", description: "Articles, books, and creative writing" },
  { value: "Student", label: "🎓 Student", description: "Courses, research, and academic projects" },
  { value: "Entrepreneur", label: "💼 Entrepreneur", description: "Business ideas, startups, and ventures" },
  { value: "Creative", label: "🎨 Creative", description: "Art, design, and creative hobbies" },
]

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, { error: null })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("Developer")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    formData.set("role", selectedRole)
    await formAction(formData)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-sage-800">Join Us</CardTitle>
        <CardDescription className="text-sage-600">Create your account to start managing your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              className="border-border focus:border-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="border-border focus:border-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              required
              className="border-border focus:border-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">What describes you best?</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="border-border focus:border-ring">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-sage-600">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state?.error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{state.error}</div>}
          {state?.success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{state.success}</div>}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-sage-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-sage-700 hover:text-sage-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
