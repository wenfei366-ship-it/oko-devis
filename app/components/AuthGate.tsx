'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (loading) return

    if (!user && !isLoginPage) {
      router.replace('/login')
      return
    }

    if (user && isLoginPage) {
      router.replace('/')
    }
  }, [isLoginPage, loading, router, user])

  if (isLoginPage) {
    if (user && !loading) {
      return null
    }

    return <>{children}</>
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-sm text-[var(--ink-muted)]">身份校验中…</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-sm text-[var(--ink-muted)]">跳转到登录页…</div>
      </main>
    )
  }

  return <>{children}</>
}
