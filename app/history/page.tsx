'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MagazineModal from '@/app/components/MagazineModal'
import { DevisProvider } from '@/app/components/DevisContext'
import { deleteContract, listContracts } from '@/app/lib/contractStorage'
import { formatEuro } from '@/app/lib/calculations'
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_SENT_CHANNEL_LABELS,
} from '@/app/lib/contractContent'
import { deleteFromHistory, listHistory } from '@/app/lib/storage'
import { useMounted } from '@/app/lib/useMounted'
import type { Contract, Devis, Lang } from '@/app/lib/types'
import { useAuth } from '@/app/components/AuthContext'

const FLAG_MAP: Record<Lang, string> = {
  fr: '🇫🇷',
  it: '🇮🇹',
  es: '🇪🇸',
  de: '🇩🇪',
  zh: '🇨🇳',
}

type HistoryFilter = 'all' | 'devis' | 'contract' | 'pending'

function HistoryContent() {
  const { user, signOut } = useAuth()
  const mounted = useMounted()
  const [devisList, setDevisList] = useState<Devis[]>([])
  const [contractList, setContractList] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contractWarning, setContractWarning] = useState<string | null>(null)
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<HistoryFilter>('all')

  const refresh = useCallback(async () => {
    if (!mounted) return
    setLoading(true)
    setError(null)
    setContractWarning(null)
    try {
      const devis = await listHistory()
      setDevisList(devis)

      try {
        const contracts = await listContracts()
        setContractList(contracts)
      } catch (contractError) {
        setContractList([])
        setContractWarning(contractError instanceof Error ? contractError.message : '合同暂时没加载出来。')
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '项目档案加载失败。')
    } finally {
      setLoading(false)
    }
  }, [mounted])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const filteredDevis = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return devisList.filter((item) => {
      if (filter === 'contract') return false
      if (!keyword) return true
      const haystack = [
        item.meta.number,
        item.customer.name,
        item.customer.postalCode,
        item.customer.city,
        item.customer.contactName,
        item.customer.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [devisList, filter, query])

  const filteredContracts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return contractList.filter((item) => {
      if (filter === 'devis') return false
      if (filter === 'pending' && item.status !== 'draft' && item.status !== 'generated' && item.status !== 'sent') {
        return false
      }
      if (!keyword) return true
      const haystack = [
        item.meta.number,
        item.meta.devisNumber,
        item.customer.name,
        item.customer.postalCode,
        item.customer.city,
        item.customer.contactName,
        item.customer.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [contractList, filter, query])

  const handleDeleteDevis = useCallback(async (id: string) => {
    await deleteFromHistory(id)
    if (selectedDevis?.id === id) setSelectedDevis(null)
    await refresh()
  }, [refresh, selectedDevis])

  const handleDeleteContract = useCallback(async (id: string) => {
    await deleteContract(id)
    await refresh()
  }, [refresh])

  const waitingCount = contractList.filter((item) => (
    item.status === 'draft' || item.status === 'generated' || item.status === 'sent'
  )).length
  const signedAmount = contractList
    .filter((item) => item.status === 'confirmed' || item.status === 'completed')
    .reduce((sum, item) => sum + item.finalTotal, 0)
  const pendingAmount = contractList
    .filter((item) => item.status === 'sent')
    .reduce((sum, item) => sum + item.finalTotal, 0)

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse text-[var(--ink-muted)] text-sm">Chargement...</div>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F1E0' }}>
      {/* V2 深色身份栏 */}
      <header className="flex items-center justify-between h-[52px] px-10 shrink-0" style={{ backgroundColor: '#1C1611' }}>
        <div className="flex items-center gap-3">
          <span className="text-[16px] font-bold tracking-[1px]" style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair)' }}>OKO</span>
          <div className="w-px h-[14px] opacity-50" style={{ backgroundColor: '#B8922F' }} />
          <span className="text-[11px] font-medium tracking-[0.8px]" style={{ color: '#D9CFB8' }}>项目档案</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: user.avatarColor, color: '#1C1611' }}>
                {user.initial}
              </span>
              <span className="text-[12px] font-semibold" style={{ color: '#F8EFDC' }}>{user.displayName}</span>
              <button type="button" onClick={() => void signOut()} className="text-[11px] font-medium" style={{ color: '#9B8550' }}>退出登录</button>
            </>
          ) : null}
        </div>
      </header>

      {/* 标题区 */}
      <div className="px-10 pt-8 pb-6" style={{ backgroundColor: '#F8F1E0' }}>
        <div className="text-[11px] font-bold uppercase tracking-[2px] mb-4" style={{ color: '#A8702E' }}>
          OKO · 项目档案 · {new Date().getFullYear()}
        </div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[52px] font-bold leading-[0.92] tracking-[-2px]" style={{ color: '#2A2620', fontFamily: 'var(--font-playfair)' }}>
              项目档案
            </div>
            <p className="mt-3 text-[16px] italic" style={{ color: '#6B5A3D', fontFamily: 'var(--font-playfair)' }}>
              团队共享的报价单与合同记录。
            </p>
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Link href="/devis/new" className="h-[40px] flex items-center px-5 rounded-[10px] border text-[12px] font-semibold" style={{ borderColor: '#1C1611', color: '#1C1611' }}>
              + 新建报价单
            </Link>
            <Link href="/contract/new" className="h-[40px] flex items-center px-5 rounded-[10px] text-[13px] font-bold" style={{ backgroundColor: '#1C1611', color: '#F8EFDC' }}>
              + 新建合同
            </Link>
          </div>
        </div>

        {/* 统计盒（弱化） */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[12px] border px-5 py-4" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>报价单</div>
            <div className="mt-2 text-[28px] font-bold" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>
              {devisList.length}
            </div>
          </div>
          <div className="rounded-[12px] border px-5 py-4" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>合同</div>
            <div className="mt-2 text-[28px] font-bold" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>
              {contractList.length}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className="rounded-[12px] border px-5 py-4 text-left transition-colors"
            style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>待跟进合同</div>
            <div className="mt-2 text-[28px] font-bold" style={{ color: '#9B2A2A', fontFamily: 'var(--font-playfair)' }}>
              {waitingCount}
            </div>
          </button>
        </div>
      </div>

      <div className="border-b px-8 py-5" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-[720px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索餐厅、邮编、城市、联系人、邮箱、编号……"
              className="w-full rounded-[12px] border px-4 py-3 text-[14px] outline-none"
              style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2', color: '#1C1611' }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              ['all', `全部 ${devisList.length + contractList.length}`],
              ['devis', `报价单 ${devisList.length}`],
              ['contract', `合同 ${contractList.length}`],
              ['pending', `待跟进 ${waitingCount}`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className="rounded-full border px-4 py-2 text-[12px] font-semibold"
                style={{
                  borderColor: filter === key ? '#B8922F' : '#D9CFB8',
                  backgroundColor: filter === key ? '#1C1611' : '#FEFBF2',
                  color: filter === key ? '#F5D48A' : '#1C1611',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {contractWarning && !loading && !error && (
          <div className="mb-4 rounded-[12px] border px-4 py-3 text-[12px]" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4', color: '#6B5A3D' }}>
            合同区暂时没加载出来，但报价单历史可以正常使用。原因：{contractWarning}
          </div>
        )}
        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: '#6B5A3D' }}>
            同步共享历史中…
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-sm" style={{ color: '#9B2A2A' }}>{error}</p>
            <button type="button" onClick={() => void refresh()} className="mt-4 rounded-[10px] px-4 py-2 text-sm font-semibold" style={{ backgroundColor: '#1C1611', color: '#F8EFDC' }}>
              重试
            </button>
          </div>
        ) : filteredDevis.length + filteredContracts.length === 0 ? (
          <div className="py-20 text-center text-sm" style={{ color: '#6B5A3D' }}>
            这里还没有匹配的记录。
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="overflow-hidden rounded-[16px] border" style={{ borderColor: '#C8B987', backgroundColor: '#FEFBF2' }}>
                <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: '#1C1611', color: '#F5D48A' }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#B8922F' }} />
                    合同
                  </span>
                  <div className="text-[11px] font-mono" style={{ color: '#A8702E' }}>{contract.meta.number}</div>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[28px] font-bold leading-tight" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                        {contract.customer.name || '未命名客户'}
                      </div>
                      <div className="mt-2 text-[12px]" style={{ color: '#5C5142' }}>
                        {[contract.customer.postalCode, contract.customer.city, contract.customer.contactName].filter(Boolean).join(' · ') || '暂无客户资料'}
                      </div>
                    </div>
                    <div className="text-[18px]">{FLAG_MAP[contract.lang]}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[1.6px]" style={{ color: '#8B7A3E' }}>关联报价单</div>
                      <div className="mt-1 text-[12px] font-semibold" style={{ color: '#1C1611' }}>{contract.meta.devisNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[1.6px]" style={{ color: '#8B7A3E' }}>金额</div>
                      <div className="mt-1 text-[22px] font-bold italic leading-none" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                        {formatEuro(contract.finalTotal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[1.6px]" style={{ color: '#8B7A3E' }}>最后更新</div>
                      <div className="mt-1 text-[12px] font-semibold" style={{ color: '#1C1611' }}>
                        {new Date(contract.updatedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold" style={{ color: '#3A3228' }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: contract.status === 'completed' ? '#4A6B3A' : contract.status === 'confirmed' ? '#6B8E4E' : contract.status === 'sent' ? '#C9A35B' : contract.status === 'cancelled' ? '#9B2A2A' : '#9B8550' }} />
                    <span>{CONTRACT_STATUS_LABELS[contract.status]}</span>
                    {contract.sentChannel && (
                      <>
                        <span style={{ color: '#C8B987' }}>·</span>
                        <span>{CONTRACT_SENT_CHANNEL_LABELS[contract.sentChannel]}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#F8F1E0' }}>
                  <div className="flex flex-wrap gap-3 text-[12px] font-semibold">
                    <Link href={`/contract/${contract.id}/send`} className="font-bold" style={{ color: '#A8702E' }}>
                      查看跟进 →
                    </Link>
                  </div>
                  <button type="button" onClick={() => void handleDeleteContract(contract.id)} className="text-[12px]" style={{ color: '#6B5A3D' }}>
                    删除
                  </button>
                </div>
              </div>
            ))}

            {filteredDevis.map((devis) => (
              <div key={devis.id} className="overflow-hidden rounded-[16px] border" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                  <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: '#1C1611', color: '#1C1611' }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#1C1611' }} />
                    报价单
                  </span>
                  <div className="text-[11px] font-mono" style={{ color: '#A8702E' }}>{devis.meta.number}</div>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[28px] font-bold leading-tight" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                        {devis.customer.name || '未命名客户'}
                      </div>
                      <div className="mt-2 text-[12px]" style={{ color: '#5C5142' }}>
                        {[devis.customer.postalCode, devis.customer.city, devis.customer.contactName].filter(Boolean).join(' · ') || '暂无客户资料'}
                      </div>
                    </div>
                    <div className="text-[18px]">{FLAG_MAP[devis.lang]}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[1.6px]" style={{ color: '#8B7A3E' }}>日期</div>
                      <div className="mt-1 text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.meta.date}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[1.6px]" style={{ color: '#8B7A3E' }}>服务项</div>
                      <div className="mt-1 text-[12px] font-semibold" style={{ color: '#1C1611' }}>{devis.items.length}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[1.6px]" style={{ color: '#8B7A3E' }}>状态</div>
                      <div className="mt-1 text-[12px] font-semibold" style={{ color: '#1C1611' }}>可生成合同</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#F8F1E0' }}>
                  <div className="flex flex-wrap gap-3 text-[12px] font-semibold">
                    <button type="button" onClick={() => setSelectedDevis(devis)} style={{ color: '#A8702E' }}>
                      查看
                    </button>
                    <Link href={`/contract/new?fromDevis=${devis.id}`} style={{ color: '#A8702E' }}>
                      制作合同 →
                    </Link>
                  </div>
                  <button type="button" onClick={() => void handleDeleteDevis(devis.id)} className="text-[12px]" style={{ color: '#6B5A3D' }}>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t px-8 py-5" style={{ borderColor: '#D9CFB8', backgroundColor: '#FBF5E4' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>
              APERÇU · 2026
            </div>
            <div
              className="mt-1 text-[16px] italic"
              style={{ color: '#6B5A3D', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
            >
              本月你已经完成 {contractList.filter((item) => item.status === 'completed').length} 份合同，发出 {devisList.length} 份报价单。
            </div>
          </div>

          <div className="flex gap-6 text-[13px] font-semibold" style={{ color: '#1C1611' }}>
            <div>已签约 {formatEuro(signedAmount)}</div>
            <div>待确认 {formatEuro(pendingAmount)}</div>
          </div>
        </div>
      </div>

      {selectedDevis && (
        <MagazineModal
          readOnly={true}
          onClose={() => setSelectedDevis(null)}
          historyDevis={selectedDevis}
        />
      )}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <DevisProvider>
      <HistoryContent />
    </DevisProvider>
  )
}
