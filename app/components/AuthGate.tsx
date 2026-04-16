'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user && pathname !== '/login') {
      router.replace('/login')
      return
    }

    if (user && pathname === '/login') {
      router.replace('/')
    }
  }, [loading, pathname, router, user])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-sm text-[var(--ink-muted)]">身份校验中…</div>
      </main>
    )
  }

  if (!user && pathname !== '/login') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-sm text-[var(--ink-muted)]">跳转到登录页…</div>
      </main>
    )
  }

  if (user && pathname === '/login') {
    return null
  }

  return <>{children}</>
}
