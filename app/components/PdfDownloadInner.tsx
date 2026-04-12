'use client'

import { Document, Image, Page, StyleSheet, pdf } from '@react-pdf/renderer'
import { createExportImage, showExportToast } from '@/app/lib/png/exportLong'
interface PdfDownloadInnerProps {
  fileName: string
  getExportElement: () => HTMLElement | null
}

function DevisPreviewPdf({ image }: { image: { dataUrl: string; width: number; height: number } }) {
  return (
    <Document>
      <Page size={[image.width, image.height]} style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={image.dataUrl} style={{ width: image.width, height: image.height }} />
      </Page>
    </Document>
  )
}

export default function PdfDownloadInner({ fileName, getExportElement }: PdfDownloadInnerProps) {
  const handleDownload = async () => {
    try {
      const element = getExportElement()
      if (!element) throw new Error('Export impossible: preview indisponible.')
      const image = await createExportImage(element)
      const blob = await pdf(<DevisPreviewPdf image={image} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      showExportToast(err instanceof Error ? err.message : 'Export PDF impossible.')
    }
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

const styles = StyleSheet.create({
  page: {
    padding: 0,
    margin: 0,
    backgroundColor: '#F8F1E0',
  },
})
