'use client'

import { useMemo } from 'react'
import { pdf } from '@react-pdf/renderer'
import { DevisPDF } from '@/app/lib/pdf/DevisPDF'
import { registerPdfFonts } from '@/app/lib/pdf/fonts'
import type { DevisViewModel } from '@/app/lib/viewModel'

interface PdfDownloadInnerProps {
  vm: DevisViewModel
  fileName: string
}

export default function PdfDownloadInner({ vm, fileName }: PdfDownloadInnerProps) {
  // Register fonts once
  useMemo(() => {
    registerPdfFonts()
  }, [])

  const handleDownload = async () => {
    const blob = await pdf(<DevisPDF vm={vm} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
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
