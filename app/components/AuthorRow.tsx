'use client'

import { resolveTeamMember } from '@/app/lib/auth/teamDirectory'

interface AuthorRowProps {
  createdBy?: string | null
  createdAt?: string
  size?: 'sm' | 'md'
}

function formatRelative(iso?: string): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const day = 24 * 60 * 60 * 1000
  if (diffMs < 60_000) return '刚刚'
  if (diffMs < 60 * 60_000) return `${Math.floor(diffMs / 60_000)} 分钟前`
  if (diffMs < day) return `${Math.floor(diffMs / (60 * 60_000))} 小时前`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} 天前`
  return new Date(iso).toISOString().slice(0, 10)
}

export default function AuthorRow({ createdBy, createdAt, size = 'sm' }: AuthorRowProps) {
  const member = resolveTeamMember(createdBy)
  const avatar = size === 'md' ? 22 : 18
  const fontSize = size === 'md' ? 11 : 10
  const labelSize = size === 'md' ? 12 : 11
  const relative = formatRelative(createdAt)

  return (
    <div className="flex items-center gap-2" style={{ color: '#6B5A3D' }}>
      <span
        className="flex items-center justify-center rounded-full font-bold"
        style={{
          width: avatar,
          height: avatar,
          backgroundColor: member.avatarColor,
          color: '#1C1611',
          fontSize,
        }}
      >
        {member.initial}
      </span>
      <span className="font-semibold" style={{ color: '#1C1611', fontSize: labelSize }}>
        {member.displayName}
      </span>
      {relative && (
        <>
          <span style={{ color: '#C8B987', fontSize: labelSize }}>·</span>
          <span style={{ fontSize: labelSize }}>{relative}</span>
        </>
      )}
    </div>
  )
}
