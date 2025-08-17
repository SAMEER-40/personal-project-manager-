import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code && request.nextUrl.pathname === "/auth/callback") {
    try {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL("/", request.url))
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
    }
  }

  return supabaseResponse
}
