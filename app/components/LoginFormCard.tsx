'use client'

import { useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { AUTH_ALLOWED_EMAILS } from '@/app/lib/auth/shared'

export default function LoginFormCard() {
  const { signInWithPassword } = useAuth()
  const [email, setEmail] = useState(AUTH_ALLOWED_EMAILS[0])
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
      className="rounded-[24px] border border-white/15 bg-black/35 p-6 text-left shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <div className="mb-5">
        <div className="text-[11px] font-bold uppercase tracking-[2px] text-orange-200/70">内部登录</div>
        <div className="mt-2 text-2xl font-semibold text-white">继续进入 OKO</div>
        <p className="mt-2 text-sm leading-6 text-orange-100/75">
          使用固定内部账号登录。当前不开放注册。
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[1.6px] text-orange-100/70">账号邮箱</span>
          <select
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-300/60 focus:bg-white/10"
          >
            {options.map((option) => (
              <option key={option} value={option} className="text-black">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[1.6px] text-orange-100/70">密码</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="输入分配给你的密码"
            className="mt-2 w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-orange-300/60 focus:bg-white/10"
          />
        </label>
      </div>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.01] hover:from-orange-400 hover:to-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? '登录中…' : '登录进入系统'}
      </button>
    </form>
  )
}
