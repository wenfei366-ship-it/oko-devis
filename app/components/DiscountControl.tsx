'use client'

import { useState } from 'react'
import { useDevis } from './DevisContext'
import type { Discount, DiscountScope } from '../lib/types'
import { DISCOUNT_PRESETS } from '../lib/discounts'
import { formatEuroShort } from '../lib/calculations'

export function DiscountControl() {
  const { devis, totals, setDiscount } = useDevis()
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [customKind, setCustomKind] = useState<'percent' | 'fixed'>('percent')
  const [customValue, setCustomValue] = useState<number>(0)
  const [customLabel, setCustomLabel] = useState('Remise personnalisée')
  const [customScope, setCustomScope] = useState<DiscountScope>('recurring')

  const currentId =
    devis.discount.kind === 'none'
      ? 'none'
      : DISCOUNT_PRESETS.find(
          (p) =>
            p.discount.kind === devis.discount.kind &&
            'label' in p.discount &&
            'label' in devis.discount &&
            p.discount.label === (devis.discount as { label: string }).label
        )?.id ?? 'custom'

  const applyCustom = () => {
    const d: Discount =
      customKind === 'percent'
        ? {
            kind: 'percent',
            value: Math.max(0, Math.min(100, customValue)),
            label: customLabel || 'Remise personnalisée',
            scope: customScope,
          }
        : {
            kind: 'fixed',
            value: Math.max(0, customValue),
            label: customLabel || 'Remise personnalisée',
            scope: customScope,
          }
    setDiscount(d)
  }

  const input =
    'rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition'

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)] uppercase">
          Remise
        </h2>
        <div className="flex rounded-md border border-[var(--border)] overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`px-3 py-1.5 ${
              mode === 'preset'
                ? 'bg-[var(--ink)] text-white'
                : 'bg-white text-[var(--ink-soft)]'
            }`}
          >
            Préréglages
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3 py-1.5 ${
              mode === 'custom'
                ? 'bg-[var(--ink)] text-white'
                : 'bg-white text-[var(--ink-soft)]'
            }`}
          >
            Personnalisée
          </button>
        </div>
      </div>

      {mode === 'preset' ? (
        <div className="grid grid-cols-1 gap-2">
          {DISCOUNT_PRESETS.map((p) => {
            const label =
              p.discount.kind === 'none'
                ? 'Aucune remise'
                : p.discount.kind === 'free-months'
                ? p.discount.label
                : p.discount.label
            const selected = currentId === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setDiscount(p.discount)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? 'border-[var(--gold)] bg-[var(--bg-cream-soft)] text-[var(--ink)]'
                    : 'border-[var(--border)] bg-white text-[var(--ink-soft)] hover:border-[var(--gold)]'
                }`}
              >
                <span className="font-medium">{label}</span>
                {p.discount.kind !== 'none' && (
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    {p.discount.kind === 'percent'
                      ? `−${p.discount.value} %`
                      : p.discount.kind === 'fixed'
                      ? `−${p.discount.value} €`
                      : `${p.discount.freeCount}/${p.discount.basis}`}
                    {' · '}
                    {'scope' in p.discount ? p.discount.scope : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select
              className={input}
              value={customKind}
              onChange={(e) => setCustomKind(e.target.value as 'percent' | 'fixed')}
            >
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe</option>
            </select>
            <input
              type="number"
              min={0}
              step={customKind === 'percent' ? '1' : '0.01'}
              className={`${input} flex-1`}
              value={customValue}
              onChange={(e) => setCustomValue(Number(e.target.value) || 0)}
              placeholder={customKind === 'percent' ? '10' : '100.00'}
            />
            <span className="flex items-center px-2 text-sm text-[var(--ink-muted)]">
              {customKind === 'percent' ? '%' : '€'}
            </span>
          </div>
          <select
            className={input}
            value={customScope}
            onChange={(e) => setCustomScope(e.target.value as DiscountScope)}
          >
            <option value="all">Appliquer à tout (HT)</option>
            <option value="recurring">Appliquer aux abonnements uniquement</option>
          </select>
          <input
            className={input}
            placeholder="Libellé affiché sur le devis"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
          />
          <button
            type="button"
            onClick={applyCustom}
            className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--gold)] transition"
          >
            Appliquer
          </button>
        </div>
      )}

      {totals.discountAmount > 0 && (
        <p className="mt-4 rounded-md bg-[var(--bg-cream-soft)] px-3 py-2 text-xs text-[var(--ink-soft)]">
          Remise calculée :{' '}
          <strong className="text-[var(--gold)]">−{formatEuroShort(totals.discountAmount)}</strong>
        </p>
      )}
    </section>
  )
}
