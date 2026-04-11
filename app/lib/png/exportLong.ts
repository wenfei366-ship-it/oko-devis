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
    // Split into 2 parts — find the nearest section boundary to the midpoint
    const rawMid = Math.floor(element.scrollHeight / 2)
    const splitPoint = findSectionSplitPoint(element, rawMid)

    // Part 1
    const dataUrl1 = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#FEFBF2',
      height: splitPoint,
    })
    downloadDataUrl(dataUrl1, `${baseName}-part1.png`)

    // Part 2 — capture from splitPoint
    const dataUrl2 = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#FEFBF2',
      height: element.scrollHeight - splitPoint,
      style: {
        marginTop: `-${splitPoint}px`,
      },
    })
    downloadDataUrl(dataUrl2, `${baseName}-part2.png`)

    // Toast notification
    if (typeof window !== 'undefined') {
      showToast('Devis tres long — exporte en 2 images (part 1 + 2)')
    }
  }
}

/**
 * Find a split point near `target` that falls at a section boundary.
 * Looks for elements with [data-section] inside the container and picks
 * the one whose top offset is closest to (but not exceeding) `target`.
 * Falls back to `target` if no sections are found.
 */
function findSectionSplitPoint(container: HTMLElement, target: number): number {
  const sections = container.querySelectorAll<HTMLElement>('[data-section]')
  if (sections.length === 0) return target

  const containerTop = container.getBoundingClientRect().top
  let best = 0

  sections.forEach((section) => {
    const offsetTop = section.getBoundingClientRect().top - containerTop
    if (offsetTop <= target && offsetTop > best) {
      best = offsetTop
    }
  })

  return best > 0 ? Math.floor(best) : target
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
