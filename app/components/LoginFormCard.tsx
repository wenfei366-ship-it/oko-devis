'use client'

import { useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { AUTH_ALLOWED_EMAILS } from '@/app/lib/auth/shared'

export default function LoginFormCard() {
  const { signInWithPassword } = useAuth()
  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oko-last-email') || AUTH_ALLOWED_EMAILS[0]
    }
    return AUTH_ALLOWED_EMAILS[0]
  })
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(() => AUTH_ALLOWED_EMAILS, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      localStorage.setItem('oko-last-email', email)
      await signInWithPassword(email, password)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '登录失败。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-[520px] w-[420px] max-w-full flex-col rounded-[14px] border p-[48px_44px] text-left"
      style={{
        borderColor: 'rgba(217,207,184,0.3)',
        backgroundColor: 'rgba(254,251,242,0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#1C1611' }}>
          <span
            className="text-[16px] font-bold tracking-[1px]"
            style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
          >
            OKO
          </span>
        </div>
        <div className="mt-6 text-center">
          <div
            className="text-[36px] font-bold tracking-[-0.5px]"
            style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
          >
            登录
          </div>
          <div className="mt-2 text-[11px] italic tracking-[1px]" style={{ color: '#9B8550' }}>
            Outil de gestion interne · OKO
          </div>
        </div>

        <div className="mt-7 space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[1.8px]" style={{ color: '#8B7A3E' }}>
              邮箱
            </span>
            <input
              list="oko-login-emails"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-[10px] border px-4 py-3 text-[14px] outline-none transition"
              style={{
                borderColor: '#D9CFB8',
                backgroundColor: '#FEFBF2',
                color: '#1C1611',
              }}
            />
            <datalist id="oko-login-emails">
              {options.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[1.8px]" style={{ color: '#8B7A3E' }}>
              密码
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-[10px] border px-4 py-3 text-[14px] outline-none transition"
              style={{
                borderColor: '#D9CFB8',
                backgroundColor: '#FEFBF2',
                color: '#1C1611',
              }}
            />
          </label>
        </div>

        <div className="mt-5 min-h-5 text-center text-[12px]" style={{ color: '#9B2A2A' }}>
          {error || ''}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center rounded-[10px] border py-4 text-[14px] font-bold tracking-[1px] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: '#1C1611', color: '#F5D48A', borderColor: '#B8922F' }}
        >
          {loading ? '登录中…' : '登录  →'}
        </button>

        <div className="mt-4 text-center text-[10px] italic" style={{ color: '#9B8550' }}>
          忘记密码？请联系管理员
        </div>
      </div>
    </form>
  )
}
