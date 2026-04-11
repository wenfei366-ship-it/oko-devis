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
      className="px-3 py-1.5 text-xs rounded-md bg-[var(--gold)] text-white font-medium hover:opacity-90 transition-opacity"
    >
      T&eacute;l&eacute;charger PDF
    </button>
  )
}
