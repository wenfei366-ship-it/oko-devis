'use client'

import { useState, useCallback, useReducer } from 'react'
import Link from 'next/link'
import { listHistory, deleteFromHistory } from '@/app/lib/storage'
import { computeTotals, formatEuro } from '@/app/lib/calculations'
import { useMounted } from '@/app/lib/useMounted'
import type { Devis, Lang } from '@/app/lib/types'
import { DevisProvider } from '@/app/components/DevisContext'
import MagazineModal from '@/app/components/MagazineModal'

const FLAG_MAP: Record<Lang, string> = {
  fr: '\ud83c\uddeb\ud83c\uddf7',
  it: '\ud83c\uddee\ud83c\uddf9',
  es: '\ud83c\uddea\ud83c\uddf8',
  de: '\ud83c\udde9\ud83c\uddea',
  zh: '\ud83c\udde8\ud83c\uddf3',
}

function HistoryContent() {
  const mounted = useMounted()
  // useReducer to track history version — forces re-read from localStorage
  const [historyVersion, bumpHistory] = useReducer((n: number) => n + 1, 0)
  const history = mounted ? listHistory() : []
  // historyVersion is used to trigger re-render after delete; suppress lint:
  void historyVersion
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleDelete = useCallback((id: string) => {
    deleteFromHistory(id)
    bumpHistory()
    setConfirmDelete(null)
  }, [bumpHistory])

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
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--divider)] bg-[var(--surface)]">
        <h1 className="font-serif text-lg font-bold text-[var(--ink)] tracking-tight">
          历史记录
        </h1>
        <Link
          href="/"
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] transition-colors"
        >
          &larr; 返回编辑器
        </Link>
      </header>

      {/* Warning banner */}
      <div className="px-6 py-2 bg-[var(--bg-cream)] border-b border-[var(--divider-soft)]">
        <p className="text-xs text-[var(--ink-muted)]">
          Historique local uniquement &mdash; visible sur ce navigateur
        </p>
      </div>

      {/* History list */}
      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--ink-muted)] text-sm">暂无历史记录</p>
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
                  {/* Card header */}
                  <div className="px-4 py-3 bg-[var(--bg-cream-soft)] border-b border-[var(--divider-soft)]">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-[var(--ink-muted)]">
                        {devis.meta.number}
                      </p>
                      <span className="text-sm">{FLAG_MAP[devis.lang]}</span>
                    </div>
                  </div>

                  {/* Card body */}
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

                  {/* Delete button */}
                  <div className="px-4 py-2 border-t border-[var(--divider-soft)] flex justify-end">
                    {confirmDelete === devis.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--danger)]">确认删除?</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(devis.id)
                          }}
                          className="text-xs px-2 py-0.5 rounded bg-[var(--danger)] text-white"
                        >
                          删除
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
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
                        onClick={(e) => {
                          e.stopPropagation()
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

      {/* Magazine modal for history viewing */}
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
