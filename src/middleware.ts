import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

// Explicitly set to use Node.js runtime, not Edge
export const runtime = 'nodejs'
 
export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Protect /todos and /user routes
  if (request.nextUrl.pathname.startsWith('/todos') || request.nextUrl.pathname.startsWith('/profile')) {
    if (!session) {
      const signinUrl = new URL('/signin', request.url)
      return NextResponse.redirect(signinUrl)
    }
  }

  return NextResponse.next()
}

// Update config to exclude API routes and other public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - signin (auth page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|signin).*)',
  ],
}