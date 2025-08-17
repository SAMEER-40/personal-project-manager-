import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID!
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/dropbox-callback`

    const authUrl =
      `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code`

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Dropbox auth URL generation error:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}
