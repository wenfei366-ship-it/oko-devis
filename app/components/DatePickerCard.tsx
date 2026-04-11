'use client'

import { useDevis } from './DevisContext'

export default function DatePickerCard() {
  const { devis, dispatch } = useDevis()

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider">
        日期
      </p>
      <div className="relative">
        <input
          type="date"
          value={devis.meta.date}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_META', meta: { date: e.target.value } })
          }
          className="w-full text-sm px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white focus:outline-none focus:border-[var(--gold)] transition-colors"
          aria-label="Devis 日期"
        />
      </div>
    </div>
  )
}
