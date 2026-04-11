'use client'

import { useEffect, useMemo, useRef, useCallback, useState } from 'react'
import { useDevis } from './DevisContext'
import { DevisPreviewContent } from './DevisLivePreview'
import { computeTotals, formatEuro } from '@/app/lib/calculations'
import { buildViewModel } from '@/app/lib/viewModel'
import { saveToHistory, HistoryConflictError, cloneForEdit } from '@/app/lib/storage'
import { generateDraftNumber, uuid } from '@/app/lib/numbering'
import type { Devis, Lang } from '@/app/lib/types'
import PdfDownloadButton from './PdfDownloadButton'

interface MagazineModalProps {
  readOnly: boolean
  onClose: () => void
  historyDevis?: Devis
}

/** Convert a date string to Roman numeral month + year */
function toRomanDate(dateStr: string): string {
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  try {
    const d = new Date(dateStr)
    return `${romanMonths[d.getMonth()]} · ${d.getFullYear()}`
  } catch {
    return ''
  }
}

/** Language display name map */
const LANG_DISPLAY: Record<string, string> = {
  fr: 'FRANÇAIS',
  it: 'ITALIANO',
  es: 'ESPAÑOL',
  de: 'DEUTSCH',
  zh: '中文',
}

export default function MagazineModal({ readOnly, onClose, historyDevis }: MagazineModalProps) {
  const ctx = useDevis()
  const sourceDevis = historyDevis ?? ctx.devis
  const dispatch = ctx.dispatch

  // For history read-only view, allow temporary language switch
  const [tempLang, setTempLang] = useState<Lang | null>(null)
  const displayDevis = useMemo(() => {
    if (tempLang && readOnly) {
      return { ...sourceDevis, lang: tempLang }
    }
    return sourceDevis
  }, [sourceDevis, tempLang, readOnly])

  const totals = useMemo(() => computeTotals(displayDevis), [displayDevis])
  const vm = useMemo(() => buildViewModel(displayDevis, totals), [displayDevis, totals])

  const previewRef = useRef<HTMLDivElement>(null)
  // Off-screen render target for PNG export (avoids sticky/scroll CSS from modal)
  const offscreenRef = useRef<HTMLDivElement>(null)

  // Save to history on first open (non-read-only)
  useEffect(() => {
    if (readOnly) return

    const devisToSave = { ...sourceDevis }
    try {
      if (!devisToSave.savedAt) {
        devisToSave.savedAt = new Date().toISOString()
        saveToHistory(devisToSave)
        // Update the builder state to reflect savedAt
        dispatch({ type: 'LOAD_DEVIS', devis: devisToSave })
      } else {
        // Already saved — fork with new id
        const forked: Devis = {
          ...devisToSave,
          id: uuid(),
          meta: {
            ...devisToSave.meta,
            number: generateDraftNumber(),
          },
          savedAt: new Date().toISOString(),
        }
        saveToHistory(forked)
        dispatch({ type: 'LOAD_DEVIS', devis: forked })
      }
    } catch (err) {
      if (err instanceof HistoryConflictError) {
        // Fork and retry
        const forked: Devis = {
          ...devisToSave,
          id: uuid(),
          meta: {
            ...devisToSave.meta,
            number: generateDraftNumber(),
          },
          savedAt: new Date().toISOString(),
        }
        try {
          saveToHistory(forked)
          dispatch({ type: 'LOAD_DEVIS', devis: forked })
        } catch {
          // storage full or other error — continue without saving
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // PNG export — use the off-screen div for capture to avoid sticky/scroll CSS
  const handlePngExport = useCallback(async () => {
    const { exportLongPng } = await import('@/app/lib/png/exportLong')
    const target = offscreenRef.current ?? previewRef.current
    if (target) {
      await exportLongPng(target, displayDevis.meta.number)
    }
  }, [displayDevis.meta.number])

  // Duplicate for edit (history mode) — uses cloneForEdit from storage
  const handleDuplicate = useCallback(() => {
    if (!historyDevis) return
    try {
      const cloned = cloneForEdit(historyDevis.id)
      // Store in sessionStorage so the builder picks it up on navigate
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('oko-devis-pending', JSON.stringify(cloned))
      }
      dispatch({ type: 'LOAD_DEVIS', devis: cloned })
      onClose()
    } catch {
      // Fallback: inline clone if history lookup fails (e.g. id mismatch)
      const fallback: Devis = {
        ...historyDevis,
        id: uuid(),
        meta: {
          ...historyDevis.meta,
          number: generateDraftNumber(),
        },
        savedAt: undefined,
        updatedAt: new Date().toISOString(),
      }
      dispatch({ type: 'LOAD_DEVIS', devis: fallback })
      onClose()
    }
  }, [historyDevis, dispatch, onClose])

  // Language options for temp switch
  const langOptions: { lang: Lang; flag: string; label: string }[] = [
    { lang: 'fr', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'FR' },
    { lang: 'it', flag: '\ud83c\uddee\ud83c\uddf9', label: 'IT' },
    { lang: 'es', flag: '\ud83c\uddea\ud83c\uddf8', label: 'ES' },
    { lang: 'de', flag: '\ud83c\udde9\ud83c\uddea', label: 'DE' },
    { lang: 'zh', flag: '\ud83c\udde8\ud83c\uddf3', label: 'ZH' },
  ]

  const romanDate = toRomanDate(vm.meta.date)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: 'rgba(10, 6, 4, 0.78)' }}
      onClick={onClose}
    >
      {/* Modal container — 1440 design width scaled to max-w-[960px] */}
      <div
        className="relative my-10 w-full max-w-[960px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shadow layer (behind modal paper) */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            backgroundColor: '#000000',
            opacity: 0.55,
            transform: 'translate(12px, 12px)',
            borderRadius: 8,
          }}
        />

        {/* Modal paper */}
        <div
          className="relative"
          style={{
            backgroundColor: '#F8EFDC',
            borderRadius: 6,
          }}
        >
          {/* Grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: '#E8DCBE',
              opacity: 0.2,
              borderRadius: 6,
              mixBlendMode: 'multiply',
            }}
          />

          {/* Eyebrow + Close button header */}
          <div className="relative flex items-center justify-between px-10 pt-8 pb-2">
            <div className="flex items-center gap-3">
              <span
                style={{
                  color: '#9B8550',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 2.6,
                  textTransform: 'uppercase',
                }}
              >
                PRÉVISUALISATION · PRÊT À L&apos;ENVOI
              </span>
              {/* Read-only language switch */}
              {readOnly && (
                <div className="flex gap-1 ml-4">
                  {langOptions.map((opt) => (
                    <button
                      key={opt.lang}
                      type="button"
                      onClick={() => setTempLang(opt.lang)}
                      className="transition-colors"
                      style={{
                        padding: '2px 8px',
                        fontSize: 11,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        borderRadius: 4,
                        backgroundColor:
                          (tempLang ?? sourceDevis.lang) === opt.lang
                            ? '#1C1611'
                            : 'transparent',
                        color:
                          (tempLang ?? sourceDevis.lang) === opt.lang
                            ? '#F4EBD4'
                            : '#9B8550',
                      }}
                    >
                      {opt.flag} {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#1C1611',
                color: '#F4EBD4',
                fontFamily: 'Inter, sans-serif',
                fontSize: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>

          {/* Main content area with A4 preview and decorative elements */}
          <div className="relative px-10 pt-4 pb-8">
            {/* ===== A4 Preview with double shadow ===== */}
            <div className="relative mx-auto" style={{ maxWidth: 700 }}>
              {/* Shadow layer 1 (deeper) */}
              <div
                className="absolute inset-0"
                style={{
                  transform: 'translate(16px, 20px)',
                  backgroundColor: '#000',
                  opacity: 0.22,
                  borderRadius: 2,
                }}
              />
              {/* Shadow layer 2 (closer) */}
              <div
                className="absolute inset-0"
                style={{
                  transform: 'translate(8px, 12px)',
                  backgroundColor: '#000',
                  opacity: 0.1,
                  borderRadius: 2,
                }}
              />

              {/* Washi tape — centered above paper */}
              <div
                className="absolute left-1/2 z-10"
                style={{
                  width: 250,
                  height: 38,
                  backgroundColor: '#E8B4B8',
                  opacity: 0.88,
                  transform: 'translateX(-50%) rotate(-3deg)',
                  top: -19,
                  borderRadius: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              />

              {/* ===== Yellow sticky note — LEFT of paper ===== */}
              <div
                className="absolute z-10"
                style={{
                  width: 180,
                  minHeight: 160,
                  backgroundColor: '#F7D968',
                  transform: 'rotate(-5deg)',
                  top: 40,
                  left: -100,
                  borderRadius: 3,
                  padding: '16px 14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 18,
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: '#1C1611',
                    lineHeight: 1.3,
                    marginBottom: 8,
                  }}
                >
                  {vm.destinataire.name}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#4A3F2F',
                    lineHeight: 1.4,
                  }}
                >
                  {vm.destinataire.address}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#4A3F2F',
                    lineHeight: 1.4,
                  }}
                >
                  {vm.destinataire.postalCity}
                </p>
              </div>

              {/* ===== Amount card — RIGHT of paper top ===== */}
              <div
                className="absolute z-10"
                style={{
                  width: 190,
                  minHeight: 130,
                  backgroundColor: '#FEFBF2',
                  transform: 'rotate(4deg)',
                  top: 30,
                  right: -100,
                  borderRadius: 4,
                  padding: '16px 14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#1C1611',
                    lineHeight: 1.2,
                    marginBottom: 6,
                  }}
                >
                  {vm.totalsFormatted.total}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#9B8550',
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  {vm.isFrance ? 'TTC' : 'Total'}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: '#7A6F5F',
                  }}
                >
                  {vm.meta.date}
                </p>
              </div>

              {/* ===== PRÊT wax stamp — RIGHT side ===== */}
              <div
                className="absolute z-10 flex flex-col items-center justify-center"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  backgroundColor: '#9B2A2A',
                  right: -70,
                  top: 220,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  className="flex flex-col items-center justify-center"
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: '50%',
                    backgroundColor: '#FEFBF2',
                    border: '2px solid #9B2A2A',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      color: '#9B2A2A',
                      letterSpacing: 2,
                    }}
                  >
                    &#9733;
                  </span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 36,
                      fontWeight: 700,
                      fontStyle: 'italic',
                      color: '#9B2A2A',
                      lineHeight: 1,
                    }}
                  >
                    PRÊT
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      color: '#9B2A2A',
                      letterSpacing: 1.5,
                      marginTop: 2,
                    }}
                  >
                    {romanDate}
                  </span>
                </div>
              </div>

              {/* ===== N° card — bottom LEFT ===== */}
              <div
                className="absolute z-10"
                style={{
                  width: 180,
                  height: 68,
                  backgroundColor: '#FEFBF2',
                  transform: 'rotate(-2deg)',
                  bottom: 60,
                  left: -90,
                  borderRadius: 4,
                  padding: '12px 14px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    color: '#9B8550',
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  N° DEVIS
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1C1611',
                  }}
                >
                  {vm.meta.number}
                </p>
              </div>

              {/* ===== Language card — bottom RIGHT ===== */}
              <div
                className="absolute z-10"
                style={{
                  width: 180,
                  height: 64,
                  backgroundColor: '#FEFBF2',
                  transform: 'rotate(3deg)',
                  bottom: 60,
                  right: -90,
                  borderRadius: 4,
                  padding: '12px 14px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    color: '#9B8550',
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  LANGUE
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1C1611',
                  }}
                >
                  {LANG_DISPLAY[displayDevis.lang] ?? displayDevis.lang.toUpperCase()}
                </p>
              </div>

              {/* Actual A4 paper content */}
              <div className="relative bg-white" ref={previewRef} style={{ borderRadius: 2 }}>
                <DevisPreviewContent vm={vm} />
              </div>
            </div>
          </div>

          {/* ===== Footer zone ===== */}
          <div
            className="relative"
            style={{
              backgroundColor: 'rgba(239, 227, 198, 0.55)',
              borderRadius: '0 0 6px 6px',
              padding: '32px 40px 36px',
            }}
          >
            {/* Gold rule with ornament */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <div style={{ flex: 1, height: 1, backgroundColor: '#9B8550', opacity: 0.4 }} />
              <span style={{ color: '#9B8550', fontSize: 14, opacity: 0.7 }}>&#10047;</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#9B8550', opacity: 0.4 }} />
            </div>

            {/* Hint text */}
            <p
              className="text-center mb-6"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 14,
                fontStyle: 'italic',
                color: '#7A6F5F',
              }}
            >
              Relis attentivement · puis exporte en PDF ou en image longue
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {readOnly && historyDevis && (
                <button
                  type="button"
                  onClick={handleDuplicate}
                  style={{
                    padding: '14px 28px',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    borderRadius: 12,
                    backgroundColor: '#FEFBF2',
                    color: '#1C1611',
                    border: '1px solid rgba(28,22,17,0.2)',
                    cursor: 'pointer',
                    letterSpacing: 0.5,
                  }}
                >
                  Dupliquer et éditer
                </button>
              )}

              {/* PDF button */}
              <div
                style={{
                  borderRadius: 12,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                }}
              >
                <PdfDownloadButton devis={displayDevis} totals={totals} />
              </div>

              {/* PNG button */}
              <button
                type="button"
                onClick={handlePngExport}
                style={{
                  width: 200,
                  height: 54,
                  borderRadius: 12,
                  backgroundColor: '#F8EFDC',
                  color: '#1C1611',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid rgba(28,22,17,0.15)',
                  cursor: 'pointer',
                  letterSpacing: 0.5,
                }}
              >
                &#10022; Image longue &#10022;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Off-screen container for PNG export — no sticky/scroll CSS, fixed 800px width */}
      <div
        ref={offscreenRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
          width: 800,
          pointerEvents: 'none',
          opacity: 0,
          zIndex: -1,
        }}
      >
        <DevisPreviewContent vm={vm} />
      </div>
    </div>
  )
}
