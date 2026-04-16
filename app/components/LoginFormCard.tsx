'use client'

import { useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { AUTH_ALLOWED_EMAILS } from '@/app/lib/auth/shared'

export default function LoginFormCard() {
  const { signInWithPassword } = useAuth()
  const [email, setEmail] = useState<string>(AUTH_ALLOWED_EMAILS[0])
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(() => AUTH_ALLOWED_EMAILS, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
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
      className="rounded-[20px] border p-7 text-left shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md"
      style={{
        borderColor: 'rgba(217, 207, 184, 0.5)',
        backgroundColor: 'rgba(254, 251, 242, 0.9)',
      }}
    >
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[2.2px]" style={{ color: '#A8702E' }}>
          INTERNE · OKO
        </div>
        <div
          className="mt-2 text-[34px] font-bold leading-[1]"
          style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
        >
          继续登录
        </div>
        <p className="mt-3 text-[13px] leading-6" style={{ color: '#6B5A3D' }}>
          使用内部固定账号进入系统。当前不开放注册。
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[1.8px]" style={{ color: '#8B7A3E' }}>
            账号邮箱
          </span>
          <select
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-[12px] border px-4 py-3 text-[14px] outline-none transition"
            style={{
              borderColor: '#D9CFB8',
              backgroundColor: '#FEFBF2',
              color: '#1C1611',
            }}
          >
            {options.map((option) => (
              <option key={option} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[1.8px]" style={{ color: '#8B7A3E' }}>
            密码
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="输入分配给你的密码"
            className="mt-2 w-full rounded-[12px] border px-4 py-3 text-[14px] outline-none transition"
            style={{
              borderColor: '#D9CFB8',
              backgroundColor: '#FEFBF2',
              color: '#1C1611',
            }}
          />
        </label>
      </div>

      {error ? <div className="mt-4 text-sm" style={{ color: '#9B2A2A' }}>{error}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-[12px] px-6 py-3 text-[14px] font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        style={{ backgroundColor: '#1C1611', color: '#F8EFDC' }}
      >
        {loading ? '登录中…' : '进入系统 →'}
      </button>

      <div className="mt-4 text-[11px]" style={{ color: '#8B7A3E' }}>
        如需新增账号，请联系管理员配置邮箱白名单。
      </div>
    </form>
  )
}
