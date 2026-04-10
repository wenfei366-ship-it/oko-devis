'use client'

import { useDevis } from './DevisContext'
import { formatEuro } from '../lib/calculations'

export function TotalsPanel() {
  const { totals } = useDevis()

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)] uppercase mb-4">
        Totaux
      </h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[var(--ink-soft)]">Sous-total HT</dt>
          <dd className="font-medium text-[var(--ink)]">{formatEuro(totals.subtotalHT)}</dd>
        </div>
        {totals.discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-[var(--gold)]">Remise</dt>
            <dd className="font-semibold text-[var(--gold)]">
              −{formatEuro(totals.discountAmount)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[var(--divider)] pt-2 mt-1">
          <dt className="text-[var(--ink-soft)]">Total HT</dt>
          <dd className="font-semibold text-[var(--ink)]">{formatEuro(totals.totalHT)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[var(--ink-soft)]">TVA 20 %</dt>
          <dd className="font-medium text-[var(--ink)]">{formatEuro(totals.tva)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--ink)] px-4 py-3.5">
        <span className="font-serif text-base font-bold tracking-wider text-[var(--bg-cream)]">
          TOTAL TTC
        </span>
        <span className="font-serif text-xl font-bold text-[var(--bg-cream)]">
          {formatEuro(totals.totalTTC)}
        </span>
      </div>
    </section>
  )
}
