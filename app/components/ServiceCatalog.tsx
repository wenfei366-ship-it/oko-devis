'use client'

import { Plus } from 'lucide-react'
import { CATALOG, CATEGORY_LABELS } from '../lib/catalog'
import type { Service } from '../lib/types'
import { formatEuroShort } from '../lib/calculations'
import { useDevis } from './DevisContext'

export function ServiceCatalog() {
  const { addService } = useDevis()

  const grouped = CATALOG.reduce<Record<string, Service[]>>((acc, s) => {
    ;(acc[s.category] ??= []).push(s)
    return acc
  }, {})

  return (
    <aside className="flex flex-col gap-5">
      <div>
        <h2 className="text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)] uppercase mb-1">
          Catalogue
        </h2>
        <p className="text-xs text-[var(--ink-muted)]">
          Cliquez sur un service pour l&apos;ajouter au devis.
        </p>
      </div>

      {Object.entries(grouped).map(([category, services]) => (
        <section key={category}>
          <h3 className="text-[11px] font-semibold tracking-[0.12em] text-[var(--ink-soft)] uppercase mb-2">
            {CATEGORY_LABELS[category as Service['category']]}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {services.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => addService(s)}
                  className="group flex w-full items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left hover:border-[var(--gold)] hover:shadow-sm transition"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-white group-hover:bg-[var(--gold)] transition">
                    <Plus size={14} strokeWidth={2.5} />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-[var(--ink)] leading-tight">
                      {s.nameFr}
                    </span>
                    <span className="text-[11px] text-[var(--ink-muted)] leading-tight mt-0.5 line-clamp-2">
                      {s.description}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--gold)] mt-1">
                      {formatEuroShort(s.defaultPrice)} / {s.unit}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  )
}
