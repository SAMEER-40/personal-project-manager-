import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fileId, accessToken } = await request.json()

    if (!fileId || !accessToken) {
      return NextResponse.json({ error: "File ID and access token are required" }, { status: 400 })
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Google Drive API error: ${error}` }, { status: response.status })
    }

    const content = await response.text()
    return NextResponse.json({ content })
  } catch (error) {
    console.error("Google Drive download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
