// OKO Devis Generator — PNG long image export
// Uses html-to-image with 2x pixel ratio for crisp fonts.
// Captures the visible Devis DOM directly to avoid blank off-screen exports.

import { toPng } from 'html-to-image'

const MAX_SINGLE_HEIGHT = 30000
const EXPORT_BACKGROUND = '#F8F1E0'
const EXPORT_WIDTH = 800
const PIXEL_RATIO = 2

export interface ExportImage {
  dataUrl: string
  width: number
  height: number
}

export async function exportLongPng(
  element: HTMLElement,
  devisNumber: string
): Promise<void> {
  const { dataUrl } = await createExportImage(element)
  downloadDataUrl(dataUrl, `Devis-${devisNumber}.png`)
}

export async function createExportImage(element: HTMLElement): Promise<ExportImage> {
  // Wait for fonts, images, and a render frame
  await waitForExportReady(element)

  const width = Math.ceil(element.getBoundingClientRect().width || element.scrollWidth || EXPORT_WIDTH)
  const height = Math.ceil(element.scrollHeight || element.getBoundingClientRect().height || element.clientHeight || 1)
  const effectiveHeight = height * PIXEL_RATIO

  if (width <= 1 || height <= 1) {
    throw new Error('Export impossible: la zone du devis est vide.')
  }

  if (effectiveHeight > MAX_SINGLE_HEIGHT) {
    throw new Error('Export impossible: le devis est trop long pour une image unique.')
  }

  const dataUrl = await toPng(element, {
    width,
    height,
    pixelRatio: PIXEL_RATIO,
    cacheBust: true,
    backgroundColor: EXPORT_BACKGROUND,
  })

  return { dataUrl, width, height }
}

/** Wait for render frame, fonts, and all images inside element */
async function waitForExportReady(element: HTMLElement): Promise<void> {
  // Wait one animation frame for layout to settle
  if (typeof requestAnimationFrame === 'function') {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }

  // Wait for fonts
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready
  }

  // Wait for all images to load
  await Promise.all(
    Array.from(element.querySelectorAll('img')).map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    })
  )
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function showExportToast(message: string): void {
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
