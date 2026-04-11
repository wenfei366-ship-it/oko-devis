'use client'

import { useState, useMemo, useCallback } from 'react'
import { CATALOG } from '@/app/lib/catalog'
import type { PackageLine, Service } from '@/app/lib/types'
import { uuid } from '@/app/lib/numbering'
import { packNameWithCount } from '@/app/lib/i18n'
import { PACK_NAMES } from '@/app/lib/i18n'
import { formatEuro } from '@/app/lib/calculations'
import { useDevis } from './DevisContext'

interface PackageGeneratorProps {
  onClose: () => void
}

export default function PackageGenerator({ onClose }: PackageGeneratorProps) {
  const { devis, dispatch } = useDevis()
  const lang = devis.lang

  // Only recurring services can be bundled into a package
  const eligibleServices = CATALOG.filter((s) => s.recurringEligible)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingMonthly, setEditingMonthly] = useState(false)
  const [editingAnnual, setEditingAnnual] = useState(false)
  const [monthlyOverride, setMonthlyOverride] = useState<string>('')
  const [annualOverride, setAnnualOverride] = useState<string>('')

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedServices = useMemo(
    () => eligibleServices.filter((s) => selected.has(s.id)),
    [eligibleServices, selected]
  )

  const baselineMonthly = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.defaultPrice, 0),
    [selectedServices]
  )
  const baselineAnnual = baselineMonthly * 12

  const effectiveMonthly = monthlyOverride !== ''
    ? parseFloat(monthlyOverride) || 0
    : baselineMonthly
  const effectiveAnnual = annualOverride !== ''
    ? parseFloat(annualOverride) || 0
    : baselineAnnual

  const monthlyEconomy = baselineMonthly - effectiveMonthly
  const annualEconomy = baselineAnnual - effectiveAnnual

  const addPackage = useCallback(() => {
    if (selectedServices.length === 0) return

    const pack: PackageLine = {
      kind: 'package',
      id: uuid(),
      nameSnapshot: { ...PACK_NAMES.surMesure },
      childServiceIds: selectedServices.map((s) => s.id),
      childNamesSnapshot: selectedServices.map((s) => ({ ...s.name })),
      childDescsSnapshot: selectedServices.map((s) => ({ ...s.description })),
      monthlyPrice: effectiveMonthly,
      annualPrice: effectiveAnnual,
      baselineMonthly,
      baselineAnnual,
      preferredMode: 'annual',
      recurringEligible: true,
    }
    dispatch({ type: 'ADD_PACKAGE', pack })
    onClose()
  }, [selectedServices, effectiveMonthly, effectiveAnnual, baselineMonthly, baselineAnnual, dispatch, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-[#FEFBF2] rounded-xl shadow-2xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--divider)]">
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            套餐生成器
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-xl"
            aria-label="关闭"
          >
            &times;
          </button>
        </div>

        {/* Service selection */}
        <div className="px-6 py-4 space-y-2">
          <p className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider mb-2">
            选择服务（可多选）
          </p>
          {eligibleServices.map((svc) => (
            <label
              key={svc.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                selected.has(svc.id)
                  ? 'bg-[var(--bg-cream)] border-l-[3px] border-l-[var(--gold)]'
                  : 'hover:bg-[var(--surface-alt)]'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(svc.id)}
                onChange={() => toggle(svc.id)}
                className="accent-[var(--gold)]"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{svc.name.fr}</p>
                <p className="text-xs text-[var(--ink-muted)]">{svc.description.zh}</p>
              </div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {svc.defaultPrice} &euro; / mois
              </p>
            </label>
          ))}
        </div>

        {/* Pack summary */}
        {selectedServices.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--divider)]">
            <p className="text-sm font-medium text-[var(--ink)] mb-3">
              {packNameWithCount(selectedServices.length, lang)}
            </p>

            {/* Dual cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Monthly */}
              <div className="rounded-lg border border-[var(--divider)] p-4 bg-[#FDFAF0]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mb-2">
                  月付
                </p>
                <p className="text-xs text-[var(--ink-muted)] line-through">
                  原价 : {formatEuro(baselineMonthly)} / mois
                </p>
                <div className="mt-1">
                  {!editingMonthly ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMonthly(true)
                        setMonthlyOverride(String(effectiveMonthly))
                      }}
                      className="text-xl font-bold text-[var(--ink)] hover:text-[var(--gold)] transition-colors cursor-text"
                      title="点击编辑价格"
                    >
                      {formatEuro(effectiveMonthly)}
                      <span className="text-xs font-normal text-[var(--ink-muted)] ml-1">/ mois</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={monthlyOverride}
                        onChange={(e) => setMonthlyOverride(e.target.value)}
                        onBlur={() => setEditingMonthly(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingMonthly(false)}
                        className="w-24 text-xl font-bold px-1 py-0 border-b-2 border-[var(--gold)] bg-transparent focus:outline-none"
                        autoFocus
                      />
                      <span className="text-xs text-[var(--ink-muted)]">&euro; / mois</span>
                    </div>
                  )}
                </div>
                {monthlyEconomy > 0 && (
                  <p className="text-xs text-[var(--success)] mt-1">
                    节省 : {formatEuro(monthlyEconomy)} / mois
                  </p>
                )}
              </div>

              {/* Annual */}
              <div className="rounded-lg border-2 border-[var(--gold)] p-4 bg-[#FBF7EC]">
                <div className="flex items-center gap-1 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
                    年付 &#9733;
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--gold)] text-white">
                    推荐
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-muted)] line-through">
                  原价 : {formatEuro(baselineAnnual)} / an
                </p>
                <div className="mt-1">
                  {!editingAnnual ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAnnual(true)
                        setAnnualOverride(String(effectiveAnnual))
                      }}
                      className="text-xl font-bold text-[var(--ink)] hover:text-[var(--gold)] transition-colors cursor-text"
                      title="点击编辑价格"
                    >
                      {formatEuro(effectiveAnnual)}
                      <span className="text-xs font-normal text-[var(--ink-muted)] ml-1">/ an</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={annualOverride}
                        onChange={(e) => setAnnualOverride(e.target.value)}
                        onBlur={() => setEditingAnnual(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingAnnual(false)}
                        className="w-24 text-xl font-bold px-1 py-0 border-b-2 border-[var(--gold)] bg-transparent focus:outline-none"
                        autoFocus
                      />
                      <span className="text-xs text-[var(--ink-muted)]">&euro; / an</span>
                    </div>
                  )}
                </div>
                {annualEconomy > 0 && (
                  <p className="text-xs text-[var(--success)] mt-1">
                    节省 : {formatEuro(annualEconomy)} / an
                  </p>
                )}
              </div>
            </div>

            {/* Add button */}
            <button
              type="button"
              onClick={addPackage}
              className="mt-4 w-full py-2 rounded-md bg-[var(--gold)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              添加到 devis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
