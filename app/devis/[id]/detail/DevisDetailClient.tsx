'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import DevisLivePreview from '@/app/components/DevisLivePreview'
import { DevisProvider, useDevis } from '@/app/components/DevisContext'
import IdentityBar, { NavButton } from '@/app/components/IdentityBar'
import { loadFromHistory } from '@/app/lib/storage'
import { formatEuro } from '@/app/lib/calculations'
import { useMounted } from '@/app/lib/useMounted'
import type { Devis } from '@/app/lib/types'

const FLAG_MAP: Record<string, string> = { fr: '🇫🇷', it: '🇮🇹', es: '🇪🇸', de: '🇩🇪', zh: '🇨🇳' }

function DevisDetailLoader({ devis }: { devis: Devis }) {
  const { dispatch } = useDevis()
  useEffect(() => { dispatch({ type: 'LOAD_DEVIS', devis }) }, [devis, dispatch])
  return <DevisDetailInner devis={devis} />
}

function DevisDetailInner({ devis }: { devis: Devis }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F1E0' }}>
      <IdentityBar
        label={`${devis.meta.number}  ·  ${devis.customer.name || '未命名'}  ·  报价单详情`}
        actions={<NavButton href="/" label="← 返回项目档案" />}
      />

      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 px-10 py-3" style={{ borderBottom: '1px solid rgba(212,197,142,0.3)' }}>
        <Link
          href={`/devis/new`}
          className="flex items-center h-[32px] px-[14px] rounded-[10px] border text-[11px] font-bold"
          style={{ borderColor: '#1C1611', color: '#1C1611' }}
        >
          ✎ 编辑报价单
        </Link>
        <Link
          href={`/contract/new?fromDevis=${devis.id}`}
          className="flex items-center h-[32px] px-[18px] rounded-[10px] text-[11px] font-bold"
          style={{ backgroundColor: '#1C1611', color: '#F5D48A', border: '1px solid #B8922F' }}
        >
          制作合同 →
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 flex gap-7 px-10 py-8 overflow-auto" style={{ alignItems: 'flex-start' }}>
        {/* Left: preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#A8702E' }}>报价单预览</span>
            <span className="text-[10px] font-medium tracking-[1px]" style={{ color: '#9B8550' }}>
              {FLAG_MAP[devis.lang] || '🇫🇷'} {devis.lang.toUpperCase()}  ·  A4
            </span>
          </div>
          <div className="rounded-[4px] border overflow-hidden" style={{ borderColor: '#D9CFB8', backgroundColor: '#F8F1E0' }}>
            <DevisLivePreview />
          </div>
        </div>

        {/* Right: info */}
        <div className="w-[400px] shrink-0 flex flex-col gap-5">
          {/* Info card */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="text-[18px] font-bold italic mb-3" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>报价单信息</div>
            <div className="h-px mb-3" style={{ backgroundColor: '#D4C58E', opacity: 0.5 }} />

            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>编号</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.meta.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>客户</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.customer.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>地址</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>
                  {devis.customer.postalCode} {devis.customer.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>联系人</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.customer.contactName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>邮箱</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.customer.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>日期</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.meta.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>服务项</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>创建人</span>
                <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{(devis as Devis & { createdBy?: string }).createdBy || '—'}</span>
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="text-[18px] font-bold italic mb-3" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>操作</div>
            <div className="h-px mb-4" style={{ backgroundColor: '#D4C58E', opacity: 0.5 }} />
            <div className="flex flex-col gap-3">
              <Link
                href={`/contract/new?fromDevis=${devis.id}`}
                className="w-full py-3 rounded-[10px] text-center text-[13px] font-bold"
                style={{ backgroundColor: '#1C1611', color: '#F5D48A', border: '1px solid #B8922F' }}
              >
                制作合同 →
              </Link>
              <Link
                href="/devis/new"
                className="w-full py-3 rounded-[10px] text-center text-[13px] font-bold border"
                style={{ borderColor: '#1C1611', color: '#1C1611' }}
              >
                复制并编辑
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DevisDetailClient({ devisId }: { devisId: string }) {
  const mounted = useMounted()
  const [devis, setDevis] = useState<Devis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mounted) return
    void (async () => {
      try {
        const d = await loadFromHistory(devisId)
        if (!d) { setError('报价单不存在。'); return }
        setDevis(d)
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败。')
      } finally {
        setLoading(false)
      }
    })()
  }, [devisId, mounted])

  if (!mounted || loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E0' }}><div className="animate-pulse text-sm" style={{ color: '#9B8550' }}>加载中…</div></main>
  }
  if (error || !devis) {
    return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E0' }}><div className="text-center"><p className="text-sm" style={{ color: '#9B2A2A' }}>{error || '报价单不存在。'}</p><Link href="/" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A8702E' }}>返回项目档案</Link></div></main>
  }

  return (
    <DevisProvider>
      <DevisDetailLoader devis={devis} />
    </DevisProvider>
  )
}
