'use client'

import { useState } from 'react'
import { DevisProvider } from './DevisContext'
import TopNav from './TopNav'
import ServiceCatalog from './ServiceCatalog'
import DevisLivePreview from './DevisLivePreview'
import CustomerForm from './CustomerForm'
import DatePickerCard from './DatePickerCard'
import LanguagePicker from './LanguagePicker'
import MagazineModal from './MagazineModal'

export default function BuilderShell() {
  const [showModal, setShowModal] = useState(false)

  return (
    <DevisProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <TopNav onCreateDevis={() => setShowModal(true)} />

        <div className="flex flex-1 overflow-hidden">
          {/* Left column — service catalog */}
          <aside className="w-[240px] min-w-[240px] border-r border-[var(--divider)] overflow-y-auto bg-[var(--surface)]">
            <ServiceCatalog />
          </aside>

          {/* Middle column — live preview */}
          <main className="flex-1 overflow-y-auto bg-[var(--bg-cream-soft)] p-6">
            <div className="mx-auto" style={{ maxWidth: 840 }}>
              <DevisLivePreview />
            </div>
          </main>

          {/* Right column — forms */}
          <aside className="w-[436px] min-w-[436px] border-l border-[var(--divider)] overflow-y-auto bg-[var(--surface)] p-4 space-y-4">
            <CustomerForm />
            <DatePickerCard />
            <LanguagePicker />
          </aside>
        </div>
      </div>

      {showModal && (
        <MagazineModal
          readOnly={false}
          onClose={() => setShowModal(false)}
        />
      )}
    </DevisProvider>
  )
}
