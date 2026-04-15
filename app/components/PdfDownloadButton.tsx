'use client'

import dynamic from 'next/dynamic'
import { buildDocumentFileStem } from '@/app/lib/fileStorage'
import type { Devis } from '@/app/lib/types'

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
  getExportElement: () => HTMLElement | null
}

export default function PdfDownloadButton({ devis, getExportElement }: PdfDownloadButtonProps) {
  return (
    <PdfDownloadInner
      fileName={`${buildDocumentFileStem('报价单', devis.customer.name, devis.meta.number)}.pdf`}
      getExportElement={getExportElement}
    />
  )
}
