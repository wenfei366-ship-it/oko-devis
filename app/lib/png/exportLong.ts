// OKO Devis Generator — PNG long image export
// Uses html-to-image with 2x pixel ratio for crisp fonts.
// If effective height > 12000px, splits into 2 files.

import { toPng } from 'html-to-image'

const MAX_SINGLE_HEIGHT = 12000

export async function exportLongPng(
  element: HTMLElement,
  devisNumber: string
): Promise<void> {
  // Wait for fonts
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready
  }

  const effectiveHeight = element.scrollHeight * 2 // pixelRatio 2
  const baseName = `Devis-${devisNumber}`

  if (effectiveHeight <= MAX_SINGLE_HEIGHT) {
    // Single PNG
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#FEFBF2',
    })
    downloadDataUrl(dataUrl, `${baseName}.png`)
  } else {
    // Split into 2 parts
    const midpoint = Math.floor(element.scrollHeight / 2)

    // Part 1
    const dataUrl1 = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#FEFBF2',
      height: midpoint,
    })
    downloadDataUrl(dataUrl1, `${baseName}-part1.png`)

    // Part 2 — capture from midpoint
    const dataUrl2 = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#FEFBF2',
      height: element.scrollHeight - midpoint,
      style: {
        marginTop: `-${midpoint}px`,
      },
    })
    downloadDataUrl(dataUrl2, `${baseName}-part2.png`)

    // Toast notification
    if (typeof window !== 'undefined') {
      showToast('Devis tres long — exporte en 2 images (part 1 + 2)')
    }
  }
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function showToast(message: string): void {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1C1611;
    color: #FEFBF2;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 4000)
}
