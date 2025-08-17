import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID!
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/onedrive-callback`
    const scope = "Files.ReadWrite offline_access"

    const authUrl =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}`

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("OneDrive auth URL generation error:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}
