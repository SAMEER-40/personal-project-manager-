"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, { error: null })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (state?.success && state?.redirect) {
      // Force immediate redirect to main page
      window.location.href = state.redirect
    }
  }, [state])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    await formAction(formData)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-sage-800">Welcome Back</CardTitle>
        <CardDescription className="text-sage-600">Sign in to continue managing your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
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
              placeholder="Enter your password"
              required
              className="border-border focus:border-ring"
            />
          </div>
          {state?.error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{state.error}</div>}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-sage-600">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-sage-700 hover:text-sage-800 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
