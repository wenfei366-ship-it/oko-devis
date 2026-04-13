'use client'

import Link from 'next/link'
import { useDevis } from './DevisContext'

interface TopNavProps {
  onCreateDevis: () => void
}

export default function TopNav({ onCreateDevis }: TopNavProps) {
  const { dispatch } = useDevis()

  const handleNewDevis = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('oko-devis-pending')
    }
    dispatch({ type: 'NEW_DEVIS' })
  }

  return (
    <header
      className="flex items-center justify-between h-[72px] px-10"
      style={{ backgroundColor: '#F8EFDC', borderBottom: '1px solid rgba(212, 197, 142, 0.6)' }}
    >
      <div>
        <div className="text-[16px] font-bold tracking-[0.4px]" style={{ color: '#1C1611', fontFamily: 'var(--font-inter)' }}>
          OKO  Devis 生成器
        </div>
        <div className="text-[11px] font-medium" style={{ color: '#8B7A3E' }}>
          销售团队内部工具  ·  Atelier OKO  ·  共享历史自动云端同步
        </div>
      </div>

      <div className="flex items-center gap-[10px]">
        <div
          className="hidden xl:flex items-center h-[40px] px-4 rounded-[10px] text-[11px] font-medium"
          style={{ backgroundColor: '#F6EFDC', color: '#6B5D31' }}
        >
          团队共享工作台 · 打开即同步
        </div>

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
  )
}
