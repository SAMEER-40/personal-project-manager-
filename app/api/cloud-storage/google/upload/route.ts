import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { filename, content, accessToken } = await request.json()

    const metadata = {
      name: filename,
      parents: ["appDataFolder"],
    }

    const form = new FormData()
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }))
    form.append("file", new Blob([content], { type: "application/json" }))

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    })

    const result = await response.json()
    return NextResponse.json({ fileId: result.id })
  } catch (error) {
    console.error("Google Drive upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
