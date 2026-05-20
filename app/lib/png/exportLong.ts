// OKO Devis Generator — PNG long image export
// Uses html-to-image with 2x pixel ratio for crisp fonts.
// Captures the visible Devis DOM directly to avoid blank off-screen exports.

import { toJpeg, toPng } from 'html-to-image'

const MAX_SINGLE_HEIGHT = 30000
const EXPORT_BACKGROUND = '#F8F1E0'
const EXPORT_WIDTH = 800
const DEFAULT_PIXEL_RATIO = 2

export interface ExportImage {
  dataUrl: string
  width: number
  height: number
}

export async function exportLongPng(
  element: HTMLElement,
  fileStem: string
): Promise<void> {
  const { dataUrl } = await createExportImage(element)
  downloadDataUrl(dataUrl, `${fileStem}.png`)
}

export async function createExportImage(element: HTMLElement): Promise<ExportImage> {
  return createNodeExportImage(element)
}

/**
 * PDF-embedding optimized: JPEG @ 1.75x, quality 0.8.
 * Apple Quartz (iOS / macOS Preview / Mail) cannot decode 2400+ PNG when zoomed
 * past ~150% → white screen. JPEG fixes this for all printable A4 docs.
 * Use this for any image that ends up inside @react-pdf <Image>.
 */
export async function createPdfPageImage(
  element: HTMLElement,
  options?: {
    backgroundColor?: string
    width?: number
    height?: number
  },
): Promise<ExportImage> {
  return createNodeExportImage(element, {
    ...options,
    pixelRatio: 1.75,
    format: 'jpeg',
    quality: 0.8,
  })
}

/** Wait for render frame, fonts, and all images inside element */
export async function waitForExportReady(element: HTMLElement): Promise<void> {
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
        const timeoutId = window.setTimeout(() => resolve(), 2500)
        const finish = () => {
          window.clearTimeout(timeoutId)
          resolve()
        }
        image.addEventListener('load', finish, { once: true })
        image.addEventListener('error', finish, { once: true })
      })
    })
  )
}

export async function createNodeExportImage(
  element: HTMLElement,
  options?: {
    pixelRatio?: number
    backgroundColor?: string
    width?: number
    height?: number
    maxSingleHeight?: number
    /**
     * 'png' (default) for screen exports — lossless, larger.
     * 'jpeg' for PDF embedding — Apple Quartz can't decode 2400+ PNG when
     * zoomed in (white-screen bug). JPEG quality 0.8 cuts size 60-70% and
     * stays readable for printed A4 contracts. Codex review 2026-05-20.
     */
    format?: 'png' | 'jpeg'
    /** Only for jpeg. 0-1, default 0.85. */
    quality?: number
  }
): Promise<ExportImage> {
  const pixelRatio = options?.pixelRatio ?? DEFAULT_PIXEL_RATIO
  const backgroundColor = options?.backgroundColor ?? EXPORT_BACKGROUND
  const maxSingleHeight = options?.maxSingleHeight ?? MAX_SINGLE_HEIGHT
  const format = options?.format ?? 'png'
  const quality = options?.quality ?? 0.85

  await waitForExportReady(element)

  const rawWidth = options?.width ?? element.getBoundingClientRect().width ?? element.scrollWidth ?? EXPORT_WIDTH
  const rawHeight = options?.height ?? element.scrollHeight ?? element.getBoundingClientRect().height ?? element.clientHeight ?? 1
  const width = Math.ceil(rawWidth)
  const height = Math.ceil(rawHeight)
  const effectiveHeight = height * pixelRatio

  if (width <= 1 || height <= 1) {
    throw new Error('Export impossible: la zone du devis est vide.')
  }

  if (effectiveHeight > maxSingleHeight) {
    throw new Error('Export impossible: le devis est trop long pour une image unique.')
  }

  const renderer = format === 'jpeg' ? toJpeg : toPng
  const dataUrl = await renderer(element, {
    width,
    height,
    pixelRatio,
    cacheBust: true,
    backgroundColor,
    ...(format === 'jpeg' ? { quality } : {}),
  })

  return { dataUrl, width, height }
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
