'use client'

import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import { useDevis } from './DevisContext'
import { lineTotal, formatEuroShort } from '../lib/calculations'

export function LineItemsTable() {
  const { devis, updateItem, removeItem, moveItem, addCustomLine } = useDevis()

  const thClass = 'text-[10px] font-semibold tracking-[0.14em] text-[var(--ink-soft)] uppercase'
  const inputCls =
    'w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-[var(--ink)] hover:border-[var(--border)] focus:border-[var(--gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition'

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)] uppercase">
          Lignes du devis ({devis.items.length})
        </h2>
        <button
          type="button"
          onClick={addCustomLine}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition"
        >
          <Plus size={13} strokeWidth={2.5} /> Ligne personnalisée
        </button>
      </div>

      {devis.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-cream-soft)] p-8 text-center">
          <p className="text-sm text-[var(--ink-muted)]">
            Aucune ligne. Cliquez sur un service dans le catalogue à gauche pour l&apos;ajouter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full">
            <thead className="bg-[var(--bg-cream-soft)]">
              <tr>
                <th className={`${thClass} px-3 py-2 text-left`}>Désignation</th>
                <th className={`${thClass} px-2 py-2 text-right w-[90px]`}>Qté</th>
                <th className={`${thClass} px-2 py-2 text-right w-[110px]`}>Prix unit.</th>
                <th className={`${thClass} px-2 py-2 text-right w-[110px]`}>Total HT</th>
                <th className="w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {devis.items.map((it, idx) => (
                <tr
                  key={it.id}
                  className="border-t border-[var(--divider-soft)] hover:bg-[var(--bg-cream-soft)] transition"
                >
                  <td className="px-3 py-2 align-top">
                    <input
                      className={`${inputCls} font-semibold`}
                      value={it.designation}
                      placeholder="Désignation…"
                      onChange={(e) => updateItem(it.id, { designation: e.target.value })}
                    />
                    <input
                      className={`${inputCls} text-xs text-[var(--ink-muted)]`}
                      value={it.description}
                      placeholder="Description (optionnel)"
                      onChange={(e) => updateItem(it.id, { description: e.target.value })}
                    />
                  </td>
                  <td className="px-1 py-2 align-top">
                    <input
                      type="number"
                      min={0}
                      step="1"
                      className={`${inputCls} text-right`}
                      value={it.qty}
                      onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) || 0 })}
                    />
                    <input
                      className={`${inputCls} text-right text-xs text-[var(--ink-muted)]`}
                      value={it.qtyLabel}
                      onChange={(e) => updateItem(it.id, { qtyLabel: e.target.value })}
                      placeholder="12 mois"
                    />
                  </td>
                  <td className="px-1 py-2 align-top">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={`${inputCls} text-right`}
                      value={it.unitPrice}
                      onChange={(e) =>
                        updateItem(it.id, { unitPrice: Number(e.target.value) || 0 })
                      }
                    />
                    <label className="flex items-center justify-end gap-1 text-[10px] text-[var(--ink-muted)] mt-1 pr-2">
                      <input
                        type="checkbox"
                        className="accent-[var(--gold)]"
                        checked={it.recurringEligible}
                        onChange={(e) =>
                          updateItem(it.id, { recurringEligible: e.target.checked })
                        }
                      />
                      récurrent
                    </label>
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      {formatEuroShort(lineTotal(it))}
                    </span>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveItem(it.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-30"
                        title="Monter"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(it.id, 'down')}
                        disabled={idx === devis.items.length - 1}
                        className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-30"
                        title="Descendre"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="p-1 text-[var(--ink-muted)] hover:text-[var(--danger)]"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
