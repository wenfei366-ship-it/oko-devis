'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { FileText, History, Plus } from 'lucide-react'
import { useDevis } from './DevisContext'
import Link from 'next/link'

// All @react-pdf/renderer imports are isolated inside PdfDownloadButton,
// which is dynamically imported with ssr: false.
const PdfDownloadButton = dynamic(() => import('./PdfDownloadButton'), {
  ssr: false,
  loading: () => (
    <span className="inline-flex items-center gap-2 rounded-md bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white opacity-60">
      <FileText size={16} /> Chargement…
    </span>
  ),
})

export function ExportBar() {
  const { devis, totals, newDevis } = useDevis()
  const [confirmingNew, setConfirmingNew] = useState(false)

  const safeName =
    (devis.customer.name || 'sans-nom')
      .replace(/[^a-zA-Z0-9àâäéèêëïîôöùûüç -]/g, '')
      .slice(0, 40) || 'sans-nom'
  const filename = `Devis-OKO-${devis.meta.number}-${safeName}.pdf`

  const handleNew = () => {
    if (confirmingNew) {
      newDevis()
      setConfirmingNew(false)
    } else {
      setConfirmingNew(true)
      setTimeout(() => setConfirmingNew(false), 3000)
    }
  }

  return (
    <div className="sticky bottom-4 z-10 rounded-xl border border-[var(--border)] bg-white/95 backdrop-blur px-4 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
        <span className="font-medium text-[var(--ink)]">{devis.meta.number}</span>
        <span>·</span>
        <span>{devis.items.length} ligne(s)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleNew}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition ${
            confirmingNew
              ? 'border-[var(--danger)] bg-[var(--danger)] text-white'
              : 'border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--gold)]'
          }`}
        >
          <Plus size={14} />
          {confirmingNew ? 'Confirmer : tout effacer' : 'Nouveau devis'}
        </button>
        <Link
          href="/history"
          className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--ink)] hover:border-[var(--gold)] transition"
        >
          <History size={14} /> Historique
        </Link>
        <PdfDownloadButton devis={devis} totals={totals} filename={filename} />
      </div>
    </div>
  )
}
