'use client'

import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Devis, DevisTotals } from '@/app/lib/types'
import { buildViewModel } from '@/app/lib/viewModel'

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PdfDownloadInner = dynamic(
  () => import('./PdfDownloadInner'),
  {
    ssr: false,
    loading: () => (
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 200,
          height: 56,
          borderRadius: 8,
          backgroundColor: '#1C1611',
          color: '#F8EFDC',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        ...
      </span>
    ),
  }
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
        className="transition-opacity hover:opacity-90"
        style={{
          width: 200,
          height: 56,
          borderRadius: 8,
          backgroundColor: '#1C1611',
          color: '#F8EFDC',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          border: '1px solid rgba(248,239,220,0.16)',
          cursor: 'pointer',
          letterSpacing: 0.5,
        }}
      >
        T&eacute;l&eacute;charger PDF
      </button>
    )
  }

  return <PdfDownloadInner vm={vm} fileName={`Devis-${devis.meta.number}.pdf`} />
}
