'use client'

import { useState } from 'react'
import { DevisProvider, useDevis } from './DevisContext'
import TopNav from './TopNav'
import ServiceCatalog from './ServiceCatalog'
import DevisLivePreview from './DevisLivePreview'
import CustomerForm from './CustomerForm'
import DatePickerCard from './DatePickerCard'
import LanguagePicker from './LanguagePicker'
import MagazineModal from './MagazineModal'
import { computeTotals } from '../lib/calculations'

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
  const totals = computeTotals(devis)

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#F6EFDC' }}>
      <TopNav onCreateDevis={() => setShowModal(true)} />

      {/* 3-column body matching Pencil YxXBG: left 240, middle flex, right 436 */}
      <div className="flex flex-1 overflow-hidden" style={{ padding: '24px 20px' }}>
        {/* Left column — catalog (w=240, bg #FEFBF2, rounded 14, shadow) */}
        <aside
          className="flex-shrink-0 overflow-y-auto rounded-[14px]"
          style={{
            width: 240,
            backgroundColor: '#FEFBF2',
            boxShadow: '4px 0 16px rgba(28,22,17,0.08)',
          }}
        >
          <ServiceCatalog />
        </aside>

        {/* Middle column — preview (flex, bg #EFE3C6, rounded 14, shadow) */}
        <main
          className="flex-1 mx-3 overflow-y-auto rounded-[14px]"
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
                <span>🇫🇷</span>
                <span>Français</span>
              </div>
            </div>
          </div>

          {/* A4 paper with shadow */}
          <div className="px-5 pb-6">
            <div
              className="rounded-[3px]"
              style={{
                boxShadow: '8px 8px 24px rgba(28,22,17,0.18)',
                backgroundColor: '#FEFBF2',
              }}
            >
              <DevisLivePreview />
            </div>
          </div>
        </main>

        {/* Right column — forms (w=436) */}
        <aside className="flex-shrink-0 flex flex-col gap-3 overflow-y-auto" style={{ width: 436 }}>
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
