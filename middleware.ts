import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AUTH_ALLOWED_EMAILS, AUTH_COOKIE_NAME } from '@/app/lib/auth/shared'

function isAuthenticated(request: NextRequest) {
  const email = request.cookies.get(AUTH_COOKIE_NAME)?.value
  return !!email && AUTH_ALLOWED_EMAILS.includes(email as (typeof AUTH_ALLOWED_EMAILS)[number])
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  const authed = isAuthenticated(request)

  if (!authed && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authed && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\.).*)'],
}
