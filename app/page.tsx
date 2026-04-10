'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DevisProvider } from './components/DevisContext'
import { ServiceCatalog } from './components/ServiceCatalog'
import { CustomerForm } from './components/CustomerForm'
import { MetaForm } from './components/MetaForm'
import { LineItemsTable } from './components/LineItemsTable'
import { DiscountControl } from './components/DiscountControl'
import { TotalsPanel } from './components/TotalsPanel'
import { ExportBar } from './components/ExportBar'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-[var(--ink-muted)]">Chargement…</div>
      </div>
    )
  }

  return (
    <DevisProvider>
      <div className="min-h-screen">
        {/* ── Top nav ── */}
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl font-bold text-[var(--ink)]">OKO</span>
              <span className="h-4 w-[1px] bg-[var(--divider)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Devis Generator
              </span>
            </div>
            <nav className="flex items-center gap-4 text-xs font-medium text-[var(--ink-soft)]">
              <Link href="/" className="hover:text-[var(--gold)]">
                Nouveau devis
              </Link>
              <Link href="/history" className="hover:text-[var(--gold)]">
                Historique
              </Link>
            </nav>
          </div>
        </header>

        {/* ── Warning banner ── */}
        <div className="border-b border-[var(--divider-soft)] bg-[var(--bg-cream-soft)] px-6 py-2">
          <p className="mx-auto max-w-[1480px] text-[11px] text-[var(--ink-muted)]">
            ⚠️ <strong>Historique local uniquement</strong> — visible sur ce navigateur. Pour un archivage durable, téléchargez le PDF.
          </p>
        </div>

        {/* ── Main layout ── */}
        <main className="mx-auto grid max-w-[1480px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[320px_1fr_340px] pb-28">
          {/* Left — Catalog */}
          <div className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
            <ServiceCatalog />
          </div>

          {/* Center — Builder */}
          <div className="flex flex-col gap-5">
            <MetaForm />
            <CustomerForm />
            <LineItemsTable />
          </div>

          {/* Right — Discount + Totals */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
            <DiscountControl />
            <TotalsPanel />
          </div>
        </main>

        {/* ── Floating export bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
          <div className="mx-auto max-w-[1480px] px-6 pb-4 pointer-events-auto">
            <ExportBar />
          </div>
        </div>
      </div>
    </DevisProvider>
  )
}
