'use client'

import Link from 'next/link'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

interface IdentityBarProps {
  label: string
  actions?: ReactNode
}

export default function IdentityBar({ label, actions }: IdentityBarProps) {
  const { user, signOut } = useAuth()

  return (
    <header
      className="flex items-center justify-between h-[52px] px-10 shrink-0"
      style={{ backgroundColor: '#1C1611' }}
    >
      {/* Left: Logo + label */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-[16px] font-bold tracking-[1px]"
          style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair)' }}
        >
          OKO
        </Link>
        <div className="w-px h-[14px] opacity-50" style={{ backgroundColor: '#B8922F' }} />
        <span
          className="text-[11px] font-medium tracking-[0.8px]"
          style={{ color: '#D9CFB8' }}
        >
          {label}
        </span>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-3">
        {actions}

        {user ? (
          <div className="flex items-center gap-3">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ backgroundColor: user.avatarColor, color: '#1C1611' }}
            >
              {user.initial}
            </span>
            <span className="text-[12px] font-semibold" style={{ color: '#F8EFDC' }}>
              {user.displayName}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-[11px] font-medium"
              style={{ color: '#9B8550' }}
            >
              退出登录
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

/** Reusable nav button for the identity bar actions area */
export function NavButton({
  href,
  label,
  onClick,
}: {
  href?: string
  label: string
  onClick?: () => void
}) {
  const cls = "flex items-center h-[32px] px-[14px] rounded-[8px] text-[11px] font-semibold"
  const style = { backgroundColor: '#2A2620', color: '#D9CFB8' }

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {label}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {label}
    </button>
  )
}
