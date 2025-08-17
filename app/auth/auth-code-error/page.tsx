import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 to-sage-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-lg border border-warm-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-900 mb-2">Authentication Error</h1>
          <p className="text-warm-600 mb-6">
            Sorry, we couldn't complete your authentication. This could be due to an expired or invalid link.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">Try Logging In Again</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/auth/sign-up">Create New Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
