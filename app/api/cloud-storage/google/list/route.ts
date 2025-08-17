import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 })
    }

    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name contains 'productivity-app'&fields=files(id,name,modifiedTime)",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Google Drive API error: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ files: data.files || [] })
  } catch (error) {
    console.error("Google Drive list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
