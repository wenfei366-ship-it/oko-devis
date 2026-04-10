'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import type { Devis, DevisTotals } from '../lib/types'
import { DevisPDF } from '../lib/pdf/DevisPDF'

interface Props {
  devis: Devis
  totals: DevisTotals
  filename: string
}

export default function PdfDownloadButton({ devis, totals, filename }: Props) {
  return (
    <PDFDownloadLink
      document={<DevisPDF devis={devis} totals={totals} />}
      fileName={filename}
    >
      {({ loading }: { loading: boolean }) => (
        <span className="inline-flex items-center gap-2 rounded-md bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--gold)] transition cursor-pointer">
          <Download size={16} strokeWidth={2.5} />
          {loading ? 'Génération…' : 'Télécharger PDF'}
        </span>
      )}
    </PDFDownloadLink>
  )
}
