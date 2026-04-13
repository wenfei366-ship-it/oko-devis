'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DevisProvider, useDevis } from './DevisContext'
import TopNav from './TopNav'
import ServiceCatalog from './ServiceCatalog'
import DevisLivePreview from './DevisLivePreview'
import CustomerForm from './CustomerForm'
import DatePickerCard from './DatePickerCard'
import LanguagePicker from './LanguagePicker'
import MagazineModal from './MagazineModal'
import type { Lang } from '../lib/types'

const LANGUAGE_PILL: Record<Lang, { flag: string; label: string }> = {
  fr: { flag: '🇫🇷', label: 'Français' },
  it: { flag: '🇮🇹', label: 'Italiano' },
  es: { flag: '🇪🇸', label: 'Español' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  zh: { flag: '🇨🇳', label: '中文' },
}

function ScaledPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [paperH, setPaperH] = useState(0)
  const paperWidth = 800

  const recalc = useCallback(() => {
    if (!containerRef.current) return
    const w = Math.max(containerRef.current.clientWidth - 48, 320)
    const s = Math.min(w / paperWidth, 1)
    setScale(s)
    const paper = containerRef.current.querySelector('[data-paper]') as HTMLElement | null
    if (paper) setPaperH(paper.scrollHeight)
  }, [paperWidth])

  useEffect(() => {
    recalc()
    const ro = new ResizeObserver(recalc)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', recalc)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recalc)
    }
  }, [recalc])

  const scaledWidth = paperWidth * scale
  const scaledHeight = paperH * scale

  return (
    <div ref={containerRef} className="h-full px-6 pb-6 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex justify-center" style={{ minWidth: scaledWidth }}>
        <div
          style={{
            width: scaledWidth,
            minHeight: scaledHeight || undefined,
            position: 'relative',
          }}
        >
          <div
            data-paper
            className="rounded-[3px]"
            style={{
              width: paperWidth,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              boxShadow: '8px 8px 24px rgba(28,22,17,0.18)',
              backgroundColor: '#FEFBF2',
            }}
          >
            <DevisLivePreview />
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateDevisButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center h-[76px] rounded-[14px] text-[18px] font-bold transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#1C1611', color: '#F8EFDC', boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}
      >
        创建 devis  →
      </button>
    </div>
  )
}

function BuilderContent() {
  const [showModal, setShowModal] = useState(false)
  const { devis } = useDevis()
  const languagePill = LANGUAGE_PILL[devis.lang]

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#F6EFDC' }}>
      <TopNav onCreateDevis={() => setShowModal(true)} />

      <div
        className="grid flex-1 overflow-hidden"
        style={{
          padding: '24px 20px',
          gap: 12,
          gridTemplateColumns: 'clamp(252px, 18vw, 288px) minmax(0, 1fr) clamp(360px, 27vw, 408px)',
        }}
      >
        {/* Left column — catalog (w=240, bg #FEFBF2, rounded 14, shadow) */}
        <aside
          className="min-w-0 overflow-y-auto rounded-[14px]"
          style={{
            backgroundColor: '#FEFBF2',
            boxShadow: '4px 0 16px rgba(28,22,17,0.08)',
          }}
        >
          <ServiceCatalog />
        </aside>

        {/* Middle column — preview (flex, bg #EFE3C6, rounded 14, shadow) */}
        <main
          className="min-w-0 overflow-hidden rounded-[14px]"
          style={{
            backgroundColor: '#EFE3C6',
            boxShadow: '4px 0 16px rgba(28,22,17,0.08)',
          }}
        >
          {/* Header inside mid panel */}
          <div className="px-5 pt-6 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>
                  实时预览 · 可直接编辑
                </div>
                <div className="text-[9px] font-semibold tracking-[1.4px] mt-1" style={{ color: '#9B8550' }}>
                  APERÇU A4  ·  édition en direct  ·  scroll ↕
                </div>
              </div>
              {/* Language pill */}
              <div
                className="flex items-center gap-1.5 h-[28px] px-3 rounded-full text-[11px] font-bold"
                style={{ backgroundColor: '#FEFBF2', color: '#1C1611' }}
              >
                <span>{languagePill.flag}</span>
                <span>{languagePill.label}</span>
              </div>
            </div>
          </div>

          {/* A4 paper — scaled to fit container, only vertical scroll */}
          <ScaledPreview />
        </main>

        {/* Right column — forms (w=436) */}
        <aside className="min-w-0 flex flex-col gap-3 overflow-y-auto">
          {/* Client card */}
          <div
            className="rounded-[14px] p-5"
            style={{
              backgroundColor: '#FEFBF2',
              boxShadow: '4px 0 16px rgba(28,22,17,0.08)',
            }}
          >
            <CustomerForm />
          </div>

          {/* Date card */}
          <div
            className="rounded-[14px] p-5"
            style={{
              backgroundColor: '#FEFBF2',
              boxShadow: '4px 0 16px rgba(28,22,17,0.08)',
            }}
          >
            <DatePickerCard />
          </div>

          {/* Language card */}
          <div
            className="rounded-[14px] p-5"
            style={{
              backgroundColor: '#FEFBF2',
              boxShadow: '4px 0 16px rgba(28,22,17,0.08)',
            }}
          >
            <LanguagePicker />
          </div>

          {/* Create devis button */}
          <CreateDevisButton onClick={() => setShowModal(true)} />
        </aside>
      </div>

      {showModal && (
        <MagazineModal readOnly={false} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

export default function BuilderShell() {
  return (
    <DevisProvider>
      <BuilderContent />
    </DevisProvider>
  )
}
