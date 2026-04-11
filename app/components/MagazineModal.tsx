'use client'

import { useEffect, useMemo, useRef, useCallback, useState } from 'react'
import { useDevis } from './DevisContext'
import { DevisPreviewContent } from './DevisLivePreview'
import { computeTotals, formatEuro } from '@/app/lib/calculations'
import { buildViewModel } from '@/app/lib/viewModel'
import { saveToHistory, HistoryConflictError } from '@/app/lib/storage'
import { generateDraftNumber, uuid } from '@/app/lib/numbering'
import type { Devis, Lang } from '@/app/lib/types'
import PdfDownloadButton from './PdfDownloadButton'

interface MagazineModalProps {
  readOnly: boolean
  onClose: () => void
  historyDevis?: Devis
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

  // PNG export
  const handlePngExport = useCallback(async () => {
    const { exportLongPng } = await import('@/app/lib/png/exportLong')
    if (previewRef.current) {
      await exportLongPng(previewRef.current, displayDevis.meta.number)
    }
  }, [displayDevis.meta.number])

  // Duplicate for edit (history mode)
  const handleDuplicate = useCallback(() => {
    if (!historyDevis) return
    const cloned: Devis = {
      ...historyDevis,
      id: uuid(),
      meta: {
        ...historyDevis.meta,
        number: generateDraftNumber(),
      },
      savedAt: undefined,
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'LOAD_DEVIS', devis: cloned })
    onClose()
  }, [historyDevis, dispatch, onClose])

  // Language options for temp switch
  const langOptions: { lang: Lang; flag: string; label: string }[] = [
    { lang: 'fr', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'FR' },
    { lang: 'it', flag: '\ud83c\uddee\ud83c\uddf9', label: 'IT' },
    { lang: 'es', flag: '\ud83c\uddea\ud83c\uddf8', label: 'ES' },
    { lang: 'de', flag: '\ud83c\udde9\ud83c\uddea', label: 'DE' },
    { lang: 'zh', flag: '\ud83c\udde8\ud83c\uddf3', label: 'ZH' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-[960px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky export bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-[#FEFBF2]/95 backdrop-blur rounded-t-xl border-b border-[var(--divider)]">
          <div className="flex items-center gap-3">
            {readOnly && (
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--ink-muted)]">
                Lecture seule &middot; Historique
              </span>
            )}
            {readOnly && (
              <div className="flex gap-1">
                {langOptions.map((opt) => (
                  <button
                    key={opt.lang}
                    type="button"
                    onClick={() => setTempLang(opt.lang)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      (tempLang ?? sourceDevis.lang) === opt.lang
                        ? 'bg-[var(--ink)] text-white'
                        : 'text-[var(--ink-muted)] hover:bg-[var(--surface-alt)]'
                    }`}
                  >
                    {opt.flag} {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {readOnly && historyDevis && (
              <button
                type="button"
                onClick={handleDuplicate}
                className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] transition-colors"
              >
                Dupliquer et &eacute;diter
              </button>
            )}

            <PdfDownloadButton devis={displayDevis} totals={totals} />

            <button
              type="button"
              onClick={handlePngExport}
              className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-alt)] transition-colors"
            >
              Image longue
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-md text-[var(--ink-muted)] hover:bg-[var(--surface-alt)] transition-colors"
              aria-label="关闭"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Magazine panel with washi tape and info labels */}
        <div className="bg-[#FEFBF2] rounded-b-xl pb-8 relative">
          {/* Washi tape decoration */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-48 h-6 rounded-sm opacity-70"
            style={{
              background: 'linear-gradient(135deg, #F5C6D0 0%, #F8D5DC 50%, #F5C6D0 100%)',
              transform: 'translateX(-50%) rotate(-2deg)',
            }}
          />

          {/* Info labels in margins */}
          <div className="flex gap-6 px-8 pt-8 pb-4">
            {/* Client sticky */}
            <div className="px-3 py-2 rounded bg-[#FFF9C4] shadow-sm text-xs -rotate-1 shrink-0">
              <p className="font-semibold text-[var(--ink)]">{vm.destinataire.name}</p>
              <p className="text-[var(--ink-muted)]">{vm.destinataire.postalCity}</p>
            </div>

            {/* Amount card */}
            <div className="px-3 py-2 rounded bg-[#E8F5E9] shadow-sm text-xs rotate-1 shrink-0">
              <p className="font-semibold text-[var(--ink)]">{vm.totalsFormatted.total}</p>
              <p className="text-[var(--ink-muted)]">{vm.isFrance ? 'TTC' : 'Total'}</p>
            </div>

            {/* N card */}
            <div className="px-3 py-2 rounded bg-[#E3F2FD] shadow-sm text-xs -rotate-1 shrink-0">
              <p className="font-semibold text-[var(--ink)]">{vm.meta.number}</p>
            </div>

            {/* Language card */}
            <div className="px-3 py-2 rounded bg-[#FFF3E0] shadow-sm text-xs rotate-1 shrink-0">
              <p className="font-semibold text-[var(--ink)]">{displayDevis.lang.toUpperCase()}</p>
            </div>

            {/* PRET stamp */}
            <div className="px-3 py-1.5 rounded border-2 border-[#C54B3C] text-[#C54B3C] text-xs font-bold uppercase tracking-wider rotate-[-3deg] shrink-0 self-center">
              PR&Ecirc;T
            </div>
          </div>

          {/* The A4 preview */}
          <div className="px-8" ref={previewRef}>
            <DevisPreviewContent vm={vm} />
          </div>
        </div>
      </div>
    </div>
  )
}
