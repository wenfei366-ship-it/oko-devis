'use client'

import Link from 'next/link'
import { useDevis } from './DevisContext'

interface TopNavProps {
  onCreateDevis: () => void
}

export default function TopNav({ onCreateDevis }: TopNavProps) {
  const { dispatch } = useDevis()

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--divider)] bg-[var(--surface)]">
      <h1 className="font-serif text-lg font-bold text-[var(--ink)] tracking-tight">
        OKO Devis 生成器
      </h1>

      <div className="flex items-center gap-3">
        <Link
          href="/history"
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] transition-colors"
        >
          历史记录
        </Link>

        <button
          type="button"
          onClick={() => dispatch({ type: 'NEW_DEVIS' })}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] transition-colors"
        >
          + 新建
        </button>

        <button
          type="button"
          onClick={onCreateDevis}
          className="px-4 py-1.5 text-sm rounded-md bg-[var(--gold)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          创建 devis &rarr;
        </button>
      </div>
    </header>
  )
}
