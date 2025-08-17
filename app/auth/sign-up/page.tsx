import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sage-800 mb-2">Project Compass</h1>
          <p className="text-sage-600">Navigate your creative journey</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
