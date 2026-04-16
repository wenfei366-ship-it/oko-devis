import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/app/lib/auth/shared'
import { findAuthAccount, toAuthUser } from '@/app/lib/auth/accounts'

export async function GET() {
  const cookieStore = await cookies()
  const email = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!email) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const account = findAuthAccount(email)
  if (!account) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: toAuthUser(account) })
}
