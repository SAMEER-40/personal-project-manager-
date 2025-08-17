import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/google-callback` // ✅ Must match what's in Google Console

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Google token exchange error:", tokenData)
      return NextResponse.json(
        { error: tokenData.error_description || "Failed to exchange code for token" },
        { status: 400 }
      )
    }

    // ✅ Return tokens (can later be saved to DB)
    return NextResponse.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
      idToken: tokenData.id_token, // optional: useful for verifying user identity
    })
  } catch (error) {
    console.error("Google callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
