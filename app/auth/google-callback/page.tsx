"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("code")
        const error = urlParams.get("error")

        if (error) {
          setStatus("error")
          setMessage(`OAuth error: ${error}`)
          return
        }

        if (!code) {
          setStatus("error")
          setMessage("No authorization code received")
          return
        }

        // Exchange code for access token
        const response = await fetch("/api/cloud-storage/google/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const result = await response.json()

        if (!response.ok) {
          setStatus("error")
          setMessage(result.error || "Failed to exchange code for token")
          return
        }

        // Store access token
        localStorage.setItem("google_drive_access_token", result.accessToken)

        setStatus("success")
        setMessage("Google Drive connected successfully!")

        // Close popup window if opened in popup, otherwise redirect
        if (window.opener) {
          window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS" }, "*")
          window.close()
        } else {
          setTimeout(() => {
            router.push("/")
          }, 2000)
        }
      } catch (error) {
        console.error("Google callback error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold mb-2">Connecting to Google Drive...</h1>
              <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold mb-2 text-green-600">Success!</h1>
              <p className="text-muted-foreground">{message}</p>
              {!window.opener && (
                <p className="text-sm text-muted-foreground mt-2">Redirecting you back to the app...</p>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold mb-2 text-red-600">Authentication Failed</h1>
              <p className="text-muted-foreground mb-4">{message}</p>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Return to App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
