'use client'

import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Devis, DevisTotals } from '@/app/lib/types'
import { buildViewModel } from '@/app/lib/viewModel'

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PdfDownloadInner = dynamic(
  () => import('./PdfDownloadInner'),
  { ssr: false, loading: () => <span className="text-xs text-[var(--ink-muted)]">...</span> }
)

interface PdfDownloadButtonProps {
  devis: Devis
  totals: DevisTotals
}

export default function PdfDownloadButton({ devis, totals }: PdfDownloadButtonProps) {
  const [ready, setReady] = useState(false)
  const vm = buildViewModel(devis, totals)

  if (!ready) {
    return (
      <button
        type="button"
        onClick={() => setReady(true)}
        className="px-3 py-1.5 text-xs rounded-md bg-[var(--gold)] text-white font-medium hover:opacity-90 transition-opacity"
      >
        T&eacute;l&eacute;charger PDF
      </button>
    )
  }

  return <PdfDownloadInner vm={vm} fileName={`Devis-${devis.meta.number}.pdf`} />
}
