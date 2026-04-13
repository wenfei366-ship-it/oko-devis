'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDevis } from './DevisContext'
import { useAuth } from './AuthContext'

interface TopNavProps {
  onCreateDevis: () => void
}

export default function TopNav({ onCreateDevis }: TopNavProps) {
  const { dispatch } = useDevis()
  const { user, loading, signInWithEmail, signOut } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  const handleNewDevis = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('oko-devis-pending')
    }
    dispatch({ type: 'NEW_DEVIS' })
  }

  const handleSendMagicLink = async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      setAuthMessage('请输入邮箱地址。')
      return
    }

    setSubmitting(true)
    setAuthMessage(null)
    try {
      await signInWithEmail(trimmed)
      setAuthMessage('登录邮件已发送，请在邮箱里点击 magic link。')
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : '发送登录邮件失败。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : '退出登录失败。')
    }
  }

  return (
    <>
      <header
        className="flex items-center justify-between h-[72px] px-10"
        style={{ backgroundColor: '#F8EFDC', borderBottom: '1px solid rgba(212, 197, 142, 0.6)' }}
      >
        {/* Left: title */}
        <div>
          <div className="text-[16px] font-bold tracking-[0.4px]" style={{ color: '#1C1611', fontFamily: 'var(--font-inter)' }}>
            OKO  Devis 生成器
          </div>
          <div className="text-[11px] font-medium" style={{ color: '#8B7A3E' }}>
            销售团队内部工具  ·  Atelier OKO  ·  云端历史多设备同步
          </div>
        </div>

        {/* Right: buttons */}
        <div className="flex items-center gap-[10px]">
          {loading ? (
            <div className="text-[11px] font-medium" style={{ color: '#8B7A3E' }}>
              连接云端中…
            </div>
          ) : user ? (
            <>
              <div
                className="flex items-center h-[40px] px-4 rounded-[10px] text-[11px] font-medium"
                style={{ backgroundColor: '#F6EFDC', color: '#6B5D31', maxWidth: 220 }}
                title={user.email ?? 'Signed in'}
              >
                {user.email ?? '已登录'}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center justify-center h-[40px] px-4 rounded-[10px] text-[12px] font-semibold transition-colors"
                style={{ backgroundColor: '#F6EFDC', color: '#1C1611' }}
              >
                退出登录
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowAuthDialog(true)
                setAuthMessage(null)
              }}
              className="flex items-center justify-center h-[40px] px-4 rounded-[10px] text-[12px] font-semibold transition-colors"
              style={{ backgroundColor: '#F6EFDC', color: '#1C1611' }}
            >
              登录云端历史
            </button>
          )}

          <Link
            href="/history"
            className="flex items-center justify-center h-[40px] px-5 rounded-[10px] text-[12px] font-semibold transition-colors"
            style={{ backgroundColor: '#F6EFDC', color: '#1C1611' }}
          >
            ⟲  历史记录
          </Link>

          <button
            type="button"
            onClick={handleNewDevis}
            className="flex items-center justify-center h-[40px] px-5 rounded-[10px] text-[12px] font-semibold transition duration-150 hover:opacity-90 active:translate-y-[1px]"
            style={{ backgroundColor: '#F6EFDC', color: '#1C1611' }}
          >
            +  新建
          </button>

          <button
            type="button"
            onClick={onCreateDevis}
            className="flex items-center justify-center h-[40px] px-5 rounded-[10px] text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1C1611', color: '#F8EFDC', minWidth: '140px' }}
          >
            创建 devis  →
          </button>
        </div>
      </header>

      {showAuthDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(10, 6, 4, 0.56)' }}
          onClick={() => setShowAuthDialog(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-[18px] p-6"
            style={{ backgroundColor: '#FEFBF2', boxShadow: '0 24px 80px rgba(0,0,0,0.28)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-[18px] font-bold" style={{ color: '#1C1611' }}>
              登录云端历史
            </div>
            <p className="mt-2 text-[13px] leading-6" style={{ color: '#6B5D31' }}>
              输入邮箱后，Supabase 会发一封 magic link。用同一个邮箱在不同设备登录，历史记录就会自动同步。
            </p>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-4 w-full rounded-[12px] border px-4 py-3 text-[14px] outline-none"
              style={{ borderColor: 'rgba(156, 134, 80, 0.35)', backgroundColor: '#F8EFDC' }}
            />
            {authMessage && (
              <p className="mt-3 text-[12px] leading-5" style={{ color: '#8B7A3E' }}>
                {authMessage}
              </p>
            )}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAuthDialog(false)}
                className="h-[40px] rounded-[10px] px-4 text-[12px] font-semibold"
                style={{ backgroundColor: '#F6EFDC', color: '#1C1611' }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void handleSendMagicLink()}
                disabled={submitting}
                className="h-[40px] rounded-[10px] px-4 text-[12px] font-semibold disabled:opacity-60"
                style={{ backgroundColor: '#1C1611', color: '#F8EFDC' }}
              >
                {submitting ? '发送中…' : '发送登录邮件'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
