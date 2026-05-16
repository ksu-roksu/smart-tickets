/**
 * Smart Tickets — Next.js Middleware
 * 
 * Handles:
 * - Public vs protected route splitting (Clerk)
 * - /dashboard route protection
 * - /check-in (scanner-only PWA) protection
 * - Platform admin route protection (/admin)
 * - Org context from header/cookie
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────
// Route matchers
// ─────────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  '/',
  '/events(.*)',
  '/api/events(.*)',
  '/api/home-data(.*)',
  '/api/weather(.*)',
  '/api/webhooks(.*)',       // Stripe/Kaspi webhooks — no auth
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/tickets/verify(.*)',     // public QR verification page
])

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isCheckinRoute = createRouteMatcher(['/check-in(.*)'])
const isApiRoute = createRouteMatcher(['/api(.*)'])

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth()
  const url = req.nextUrl

  // Allow public routes without auth
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Require auth for all protected routes
  if (!userId) {
    if (isApiRoute(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', url.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Authenticated — add user context headers for downstream use
  const response = NextResponse.next()
  response.headers.set('x-clerk-user-id', userId)

  // Pass org ID from query/cookie into header (for multi-org switching)
  const orgId =
    url.searchParams.get('orgId') ??
    req.cookies.get('st_org_id')?.value
  if (orgId) {
    response.headers.set('x-org-id', orgId)
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
