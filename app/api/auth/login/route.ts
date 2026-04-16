import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/app/lib/auth/shared'
import { findAuthAccount, toAuthUser } from '@/app/lib/auth/accounts'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null
  const email = body?.email?.trim().toLowerCase() || ''
  const password = body?.password || ''

  const account = findAuthAccount(email)
  if (!account || account.password !== password) {
    return NextResponse.json({ error: '账号或密码错误。' }, { status: 401 })
  }

  const response = NextResponse.json({ user: toAuthUser(account) })
  response.cookies.set(AUTH_COOKIE_NAME, account.email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
