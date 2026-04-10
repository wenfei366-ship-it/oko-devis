'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Trash2, FileText } from 'lucide-react'
import type { Devis } from '../lib/types'
import { getLocalHistory, deleteFromLocalHistory } from '../lib/storage'
import { computeTotals, formatEuro } from '../lib/calculations'

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false)
  const [history, setHistory] = useState<Devis[]>([])

  useEffect(() => {
    setMounted(true)
    setHistory(getLocalHistory())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce devis de l\'historique local ?')) {
      deleteFromLocalHistory(id)
      setHistory(getLocalHistory())
    }
  }

  const handleLoad = (d: Devis) => {
    // Save as "current draft" and navigate back to builder
    // The builder auto-saves everything through context, so we just store the full devis in sessionStorage
    sessionStorage.setItem('oko-devis-load', JSON.stringify(d))
    window.location.href = '/'
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-[var(--ink-muted)]">Chargement…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold text-[var(--ink)]">OKO</span>
            <span className="h-4 w-[1px] bg-[var(--divider)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Historique local
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--ink)] hover:border-[var(--gold)] transition"
          >
            <ArrowLeft size={14} /> Retour au builder
          </Link>
        </div>
      </header>

      <div className="border-b border-[var(--divider-soft)] bg-[var(--bg-cream-soft)] px-6 py-2">
        <p className="mx-auto max-w-[1180px] text-[11px] text-[var(--ink-muted)]">
          ⚠️ <strong>Historique local uniquement</strong> — visible sur ce navigateur.
          {history.length > 0 && ` ${history.length} devis enregistrés localement.`}
        </p>
      </div>

      <main className="mx-auto max-w-[1180px] px-6 py-8">
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
            <FileText size={32} strokeWidth={1.5} className="mx-auto mb-3 text-[var(--ink-muted)]" />
            <p className="text-sm text-[var(--ink-muted)]">
              Aucun devis dans l&apos;historique local pour le moment.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--gold)] transition"
            >
              Créer un devis
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {history.map((d) => {
              const totals = computeTotals(d)
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-4 hover:border-[var(--gold)] transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-base font-bold text-[var(--ink)]">
                        {d.meta.number}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
                        {new Date(d.updatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                      <span className="font-medium text-[var(--ink)] truncate">
                        {d.customer.name || <span className="italic text-[var(--ink-muted)]">Sans nom</span>}
                      </span>
                      <span>·</span>
                      <span>{d.items.length} ligne(s)</span>
                      <span>·</span>
                      <span className="font-semibold">{formatEuro(totals.totalTTC)} TTC</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleLoad(d)}
                      className="rounded-md bg-[var(--ink)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--gold)] transition"
                    >
                      Ouvrir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      className="rounded-md border border-[var(--border)] p-2 text-[var(--ink-muted)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
