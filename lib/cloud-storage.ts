"use client"

// Real cloud storage integration utilities
export interface CloudStorageProvider {
  name: string
  authenticate: () => Promise<boolean>
  upload: (filename: string, content: string) => Promise<string>
  download: (fileId: string) => Promise<string>
  list: () => Promise<Array<{ id: string; name: string; modifiedTime: string }>>
}

// Google Drive API integration - production ready
export class GoogleDriveProvider implements CloudStorageProvider {
  name = "Google Drive"
  private accessToken: string | null = null

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch("/api/cloud-storage/google/auth-url", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Failed to get auth URL: ${response.statusText}`)
      }

      const { authUrl } = await response.json()

      // Check for existing token
      this.accessToken = localStorage.getItem("google_drive_access_token")
      if (!this.accessToken) {
        // Open OAuth flow in popup for better UX
        const popup = window.open(authUrl, "google-auth", "width=500,height=600")

        // Wait for authentication to complete
        return new Promise((resolve) => {
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed)
              // Check if token was set during OAuth flow
              this.accessToken = localStorage.getItem("google_drive_access_token")
              resolve(!!this.accessToken)
            }
          }, 1000)
        })
      }
      return true
    } catch (error) {
      console.error("Google Drive auth error:", error)
      return false
    }
  }

  async upload(filename: string, content: string): Promise<string> {
    if (!this.accessToken) throw new Error("Not authenticated with Google Drive")

    const response = await fetch("/api/cloud-storage/google/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        content,
        accessToken: this.accessToken,
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || "Upload failed")
    }

    return result.fileId
  }

  async download(fileId: string): Promise<string> {
    if (!this.accessToken) throw new Error("Not authenticated with Google Drive")

    const response = await fetch("/api/cloud-storage/google/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId,
        accessToken: this.accessToken,
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || "Download failed")
    }

    return result.content
  }

  async list(): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
    if (!this.accessToken) throw new Error("Not authenticated with Google Drive")

    const response = await fetch("/api/cloud-storage/google/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: this.accessToken,
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || "List failed")
    }

    return result.files || []
  }
}

// Dropbox API integration - production ready
export class DropboxProvider implements CloudStorageProvider {
  name = "Dropbox"
  private accessToken: string | null = null

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch("/api/cloud-storage/dropbox/auth-url", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Failed to get Dropbox auth URL: ${response.statusText}`)
      }

      const { authUrl } = await response.json()

      this.accessToken = localStorage.getItem("dropbox_access_token")
      if (!this.accessToken) {
        const popup = window.open(authUrl, "dropbox-auth", "width=500,height=600")

        return new Promise((resolve) => {
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed)
              this.accessToken = localStorage.getItem("dropbox_access_token")
              resolve(!!this.accessToken)
            }
          }, 1000)
        })
      }
      return true
    } catch (error) {
      console.error("Dropbox auth error:", error)
      return false
    }
  }

  async upload(filename: string, content: string): Promise<string> {
    if (!this.accessToken) throw new Error("Not authenticated with Dropbox")

    const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path: `/productivity-app/${filename}`,
          mode: "overwrite",
        }),
      },
      body: content,
    })

    const result = await response.json()
    return result.id
  }

  async download(fileId: string): Promise<string> {
    if (!this.accessToken) throw new Error("Not authenticated with Dropbox")

    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path: fileId }),
      },
    })

    return await response.text()
  }

  async list(): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
    if (!this.accessToken) throw new Error("Not authenticated with Dropbox")

    const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "/productivity-app",
      }),
    })

    const result = await response.json()
    return (
      result.entries?.map((entry: any) => ({
        id: entry.path_lower,
        name: entry.name,
        modifiedTime: entry.client_modified,
      })) || []
    )
  }
}

// OneDrive API integration - production ready
export class OneDriveProvider implements CloudStorageProvider {
  name = "OneDrive"
  private accessToken: string | null = null

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch("/api/cloud-storage/onedrive/auth-url", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Failed to get OneDrive auth URL: ${response.statusText}`)
      }

      const { authUrl } = await response.json()

      this.accessToken = localStorage.getItem("onedrive_access_token")
      if (!this.accessToken) {
        const popup = window.open(authUrl, "onedrive-auth", "width=500,height=600")

        return new Promise((resolve) => {
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed)
              this.accessToken = localStorage.getItem("onedrive_access_token")
              resolve(!!this.accessToken)
            }
          }, 1000)
        })
      }
      return true
    } catch (error) {
      console.error("OneDrive auth error:", error)
      return false
    }
  }

  async upload(filename: string, content: string): Promise<string> {
    if (!this.accessToken) throw new Error("Not authenticated with OneDrive")

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/special/approot:/${filename}:/content`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: content,
    })

    const result = await response.json()
    return result.id
  }

  async download(fileId: string): Promise<string> {
    if (!this.accessToken) throw new Error("Not authenticated with OneDrive")

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    return await response.text()
  }

  async list(): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
    if (!this.accessToken) throw new Error("Not authenticated with OneDrive")

    const response = await fetch("https://graph.microsoft.com/v1.0/me/drive/special/approot/children", {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    const result = await response.json()
    return (
      result.value?.map((item: any) => ({
        id: item.id,
        name: item.name,
        modifiedTime: item.lastModifiedDateTime,
      })) || []
    )
  }
}

// Factory function to include all providers
export function getCloudStorageProviders(): CloudStorageProvider[] {
  return [new GoogleDriveProvider(), new DropboxProvider(), new OneDriveProvider()]
}
