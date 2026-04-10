'use client'

import { useDevis } from './DevisContext'

export function MetaForm() {
  const { devis, updateMeta } = useDevis()
  const m = devis.meta

  const input =
    'w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition'
  const label = 'text-[10px] font-semibold tracking-[0.14em] text-[var(--ink-soft)] uppercase mb-1 block'

  // For the date input, we need YYYY-MM-DD
  const dateValue = m.date ? m.date.slice(0, 10) : ''
  const startDateValue = m.startDate ? m.startDate.slice(0, 10) : ''

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)] uppercase mb-4">
        Métadonnées du devis
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className={label}>N° devis</label>
          <input
            className={input}
            value={m.number}
            onChange={(e) => updateMeta({ number: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Date d&apos;émission</label>
          <input
            type="date"
            className={input}
            value={dateValue}
            onChange={(e) =>
              updateMeta({
                date: e.target.value ? new Date(e.target.value).toISOString() : '',
              })
            }
          />
        </div>
        <div>
          <label className={label}>Validité (jours)</label>
          <input
            type="number"
            min={1}
            max={365}
            className={input}
            value={m.validityDays}
            onChange={(e) => updateMeta({ validityDays: Number(e.target.value) || 30 })}
          />
        </div>
        <div className="col-span-2 md:col-span-3">
          <label className={label}>Objet</label>
          <input
            className={input}
            placeholder="Devis pour services digitaux adaptés"
            value={m.objet}
            onChange={(e) => updateMeta({ objet: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Début prestation</label>
          <input
            type="date"
            className={input}
            value={startDateValue}
            onChange={(e) =>
              updateMeta({
                startDate: e.target.value ? new Date(e.target.value).toISOString() : '',
              })
            }
          />
        </div>
      </div>
    </section>
  )
}
