'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { listHistory, deleteFromHistory, clearHistory } from '@/app/lib/storage'
import { computeTotals, formatEuro } from '@/app/lib/calculations'
import { useMounted } from '@/app/lib/useMounted'
import type { Devis, Lang } from '@/app/lib/types'
import { DevisProvider } from '@/app/components/DevisContext'
import MagazineModal from '@/app/components/MagazineModal'

const FLAG_MAP: Record<Lang, string> = {
  fr: '🇫🇷',
  it: '🇮🇹',
  es: '🇪🇸',
  de: '🇩🇪',
  zh: '🇨🇳',
}

function HistoryContent() {
  const mounted = useMounted()
  const [history, setHistory] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const refreshHistory = useCallback(async () => {
    if (!mounted) return

    setLoading(true)
    setLoadError(null)
    try {
      setHistory(await listHistory())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '加载云端历史失败。')
    } finally {
      setLoading(false)
    }
  }, [mounted])

  useEffect(() => {
    void refreshHistory()
  }, [refreshHistory])

  const handleDelete = useCallback(async (id: string) => {
    await deleteFromHistory(id)
    setConfirmDelete(null)
    setSelectedDevis((current) => (current?.id === id ? null : current))
    await refreshHistory()
  }, [refreshHistory])

  const handleClearHistory = useCallback(async () => {
    await clearHistory()
    setConfirmClear(false)
    setSelectedDevis(null)
    await refreshHistory()
  }, [refreshHistory])

  const handleCloseModal = useCallback(() => {
    setSelectedDevis(null)
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse text-[var(--ink-muted)] text-sm">Chargement...</div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--divider)] bg-[var(--surface)]">
        <h1 className="font-serif text-lg font-bold text-[var(--ink)] tracking-tight">
          历史记录
        </h1>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--danger)]">确认清空全部?</span>
                <button
                  type="button"
                  onClick={() => void handleClearHistory()}
                  className="px-3 py-1.5 text-sm rounded-md bg-[var(--danger)] text-white transition-opacity hover:opacity-90 active:translate-y-[1px]"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] transition-colors"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:text-[var(--danger)] hover:bg-[var(--surface-alt)] transition-colors active:translate-y-[1px]"
              >
                清空历史
              </button>
            )
          )}
          <Link
            href="/"
            className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] transition-colors"
          >
            &larr; 返回编辑器
          </Link>
        </div>
      </header>

      <div className="px-6 py-2 bg-[var(--bg-cream)] border-b border-[var(--divider-soft)]">
        <p className="text-xs text-[var(--ink-muted)]">
          Historique cloud partagé &mdash; visible sur tous vos appareils de travail
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[var(--ink-muted)] text-sm">同步云端历史中…</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-16">
            <p className="text-[var(--danger)] text-sm">{loadError}</p>
            <button
              type="button"
              onClick={() => void refreshHistory()}
              className="inline-block mt-4 px-4 py-2 text-sm rounded-md bg-[var(--gold)] text-white hover:opacity-90 transition-opacity"
            >
              重试
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--ink-muted)] text-sm">共享历史里还没有 devis</p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 text-sm rounded-md bg-[var(--gold)] text-white hover:opacity-90 transition-opacity"
            >
              创建第一个 Devis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((devis) => {
              const totals = computeTotals(devis)
              return (
                <div
                  key={devis.id}
                  className="relative bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedDevis(devis)}
                >
                  <div className="px-4 py-3 bg-[var(--bg-cream-soft)] border-b border-[var(--divider-soft)]">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-[var(--ink-muted)]">
                        {devis.meta.number}
                      </p>
                      <span className="text-sm">{FLAG_MAP[devis.lang]}</span>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <p className="font-semibold text-sm text-[var(--ink)] truncate">
                      {devis.customer.name || 'Client sans nom'}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)] mt-1">
                      {devis.meta.date}
                    </p>
                    <p className="text-lg font-bold text-[var(--gold)] mt-2">
                      {formatEuro(totals.total)}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)]">
                      {totals.isFrance ? 'TTC' : 'Total'} &middot; {devis.items.length} article{devis.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="px-4 py-2 border-t border-[var(--divider-soft)] flex justify-end">
                    {confirmDelete === devis.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--danger)]">确认删除?</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleDelete(devis.id)
                          }}
                          className="text-xs px-2 py-0.5 rounded bg-[var(--danger)] text-white"
                        >
                          删除
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setConfirmDelete(null)
                          }}
                          className="text-xs px-2 py-0.5 rounded text-[var(--ink-muted)]"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setConfirmDelete(devis.id)
                        }}
                        className="text-xs text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors"
                      >
                        删除
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedDevis && (
        <MagazineModal
          readOnly={true}
          onClose={handleCloseModal}
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
