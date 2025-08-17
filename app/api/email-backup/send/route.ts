import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, data, subject } = await request.json()

    // For this example, we'll use a simple email service
    const emailContent = `
      <h2>Your Project Backup</h2>
      <p>Here's your latest project backup from your productivity app.</p>
      <p><strong>Total Projects:</strong> ${data.totalProjects}</p>
      <p><strong>Exported:</strong> ${new Date(data.exportedAt).toLocaleDateString()}</p>
      
      <h3>Projects Summary:</h3>
      <ul>
        ${data.projects
          .map(
            (project: any) => `
          <li>
            <strong>${project.title}</strong> (${project.type}) - ${project.status}
            <br><small>Last activity: ${new Date(project.lastActivity).toLocaleDateString()}</small>
          </li>
        `,
          )
          .join("")}
      </ul>
      
      <p>The complete backup data is attached as JSON.</p>
    `

    // In a real implementation, you would use an email service here
    // For now, we'll simulate success
    console.log(`[v0] Email backup sent to ${email}:`, {
      subject,
      projectCount: data.totalProjects,
      exportDate: data.exportedAt,
    })

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
