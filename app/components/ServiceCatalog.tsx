'use client'

import { useState, useCallback } from 'react'
import { CATALOG } from '@/app/lib/catalog'
import type { Service, LineItem } from '@/app/lib/types'
import { uuid } from '@/app/lib/numbering'
import { useDevis } from './DevisContext'
import PackageGenerator from './PackageGenerator'

export default function ServiceCatalog() {
  const { devis, dispatch } = useDevis()
  const [showPackGen, setShowPackGen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customCadence, setCustomCadence] = useState<'monthly' | 'oneOff'>('monthly')

  const addedServiceIds = new Set(
    devis.items
      .filter((i): i is LineItem => i.kind === 'line')
      .map((i) => i.serviceId)
  )

  const addService = useCallback(
    (svc: Service) => {
      const item: LineItem = {
        kind: 'line',
        id: uuid(),
        serviceId: svc.id,
        nameSnapshot: { ...svc.name },
        descSnapshot: { ...svc.description },
        qty: svc.defaultQty,
        unit: svc.unit,
        unitPrice: svc.defaultPrice,
        billingCadence: svc.billingCadence,
        pdfSection: svc.pdfSection,
        recurringEligible: svc.recurringEligible,
      }
      dispatch({ type: 'ADD_SERVICE', item })
    },
    [dispatch]
  )

  const removeService = useCallback(
    (serviceId: string) => {
      const item = devis.items.find(
        (i) => i.kind === 'line' && (i as LineItem).serviceId === serviceId
      )
      if (item) {
        dispatch({ type: 'REMOVE_ITEM', id: item.id })
      }
    },
    [devis.items, dispatch]
  )

  const addCustomService = useCallback(() => {
    if (!customName.trim() || !customPrice.trim()) return
    const price = parseFloat(customPrice)
    if (isNaN(price) || price < 0) return

    const item: LineItem = {
      kind: 'line',
      id: uuid(),
      serviceId: `custom-${uuid()}`,
      nameSnapshot: { fr: customName, it: customName, es: customName, de: customName, zh: customName },
      descSnapshot: { fr: '', it: '', es: '', de: '', zh: '' },
      qty: customCadence === 'monthly' ? 12 : 1,
      unit: customCadence === 'monthly' ? 'mois' : 'unique',
      unitPrice: price,
      billingCadence: customCadence,
      pdfSection: 'complement',
      recurringEligible: customCadence === 'monthly',
    }
    dispatch({ type: 'ADD_CUSTOM_LINE', item })
    setCustomName('')
    setCustomPrice('')
    setShowCustom(false)
  }, [customName, customPrice, customCadence, dispatch])

  return (
    <div className="p-3 space-y-1">
      <p className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider px-1 mb-2">
        服务目录
      </p>

      {CATALOG.map((svc) => {
        const isAdded = addedServiceIds.has(svc.id)
        const annualPrice =
          svc.billingCadence === 'monthly'
            ? svc.defaultPrice * 12
            : svc.defaultPrice
        const isRecurring = svc.billingCadence === 'monthly'

        return (
          <div
            key={svc.id}
            className={`relative rounded-md px-3 py-2.5 transition-colors group ${
              isAdded
                ? 'bg-[var(--bg-cream)] border-l-[3px] border-l-[var(--gold)]'
                : 'hover:bg-[var(--surface-alt)]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ink)] truncate">
                  {svc.name.fr}
                </p>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5 line-clamp-1">
                  {svc.description.zh}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {annualPrice} &euro;{isRecurring ? ' / an' : ''}
                </p>
                {isRecurring && (
                  <p className="text-xs text-[var(--ink-muted)]">
                    = {svc.defaultPrice} &euro; / mois
                  </p>
                )}
                {svc.billingCadence === 'perUnit' && (
                  <p className="text-xs text-[var(--ink-muted)]">
                    / photo
                  </p>
                )}
                {svc.billingCadence === 'oneOff' && (
                  <p className="text-xs text-[var(--ink-muted)]">
                    une fois
                  </p>
                )}
              </div>
            </div>

            {/* Add / Remove button */}
            <button
              type="button"
              onClick={() => (isAdded ? removeService(svc.id) : addService(svc))}
              className={`absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-xs font-bold transition-all ${
                isAdded
                  ? 'text-[var(--danger)] hover:bg-red-50'
                  : 'text-[var(--gold)] opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-cream)]'
              }`}
              aria-label={isAdded ? `移除 ${svc.name.zh}` : `添加 ${svc.name.zh}`}
            >
              {isAdded ? '\u00d7' : '+'}
            </button>
          </div>
        )
      })}

      {/* Custom service */}
      <div className="pt-2 border-t border-[var(--divider-soft)]">
        {!showCustom ? (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="w-full text-left px-3 py-2 text-xs text-[var(--gold)] hover:bg-[var(--bg-cream)] rounded-md transition-colors"
          >
            + 自定义新服务
          </button>
        ) : (
          <div className="px-3 py-2 space-y-2">
            <input
              type="text"
              placeholder="服务名称"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full text-sm px-2 py-1 rounded border border-[var(--border)] bg-white focus:outline-none focus:border-[var(--gold)]"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="价格 (EUR)"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="flex-1 text-sm px-2 py-1 rounded border border-[var(--border)] bg-white focus:outline-none focus:border-[var(--gold)]"
              />
              <select
                value={customCadence}
                onChange={(e) => setCustomCadence(e.target.value as 'monthly' | 'oneOff')}
                className="text-xs px-2 py-1 rounded border border-[var(--border)] bg-white"
              >
                <option value="monthly">月付</option>
                <option value="oneOff">一次性</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addCustomService}
                className="text-xs px-3 py-1 bg-[var(--gold)] text-white rounded hover:opacity-90"
              >
                添加
              </button>
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="text-xs px-3 py-1 text-[var(--ink-muted)] hover:bg-[var(--surface-alt)] rounded"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Package generator trigger */}
      <button
        type="button"
        onClick={() => setShowPackGen(true)}
        className="w-full text-left px-3 py-2 text-xs text-[var(--gold)] hover:bg-[var(--bg-cream)] rounded-md transition-colors"
      >
        套餐生成器
      </button>

      {showPackGen && (
        <PackageGenerator onClose={() => setShowPackGen(false)} />
      )}
    </div>
  )
}
