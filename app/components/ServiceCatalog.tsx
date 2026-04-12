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
  const [customDescription, setCustomDescription] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customUnit, setCustomUnit] = useState('')
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
      if (item) dispatch({ type: 'REMOVE_ITEM', id: item.id })
    },
    [devis.items, dispatch]
  )

  const addCustomService = useCallback(() => {
    if (!customName.trim() || !customPrice.trim()) return
    const price = parseFloat(customPrice)
    if (isNaN(price) || price < 0) return
    const unit = customCadence === 'monthly' ? 'mois' : customUnit.trim()
    const item: LineItem = {
      kind: 'line',
      id: uuid(),
      serviceId: `custom-${uuid()}`,
      nameSnapshot: { fr: customName, it: customName, es: customName, de: customName, zh: customName },
      descSnapshot: {
        fr: customDescription,
        it: customDescription,
        es: customDescription,
        de: customDescription,
        zh: customDescription,
      },
      qty: customCadence === 'monthly' ? 12 : 1,
      unit,
      unitPrice: price,
      billingCadence: customCadence,
      pdfSection: customCadence === 'monthly' ? 'forfait' : 'complement',
      recurringEligible: customCadence === 'monthly',
    }
    dispatch({ type: 'ADD_CUSTOM_LINE', item })
    setCustomName('')
    setCustomDescription('')
    setCustomPrice('')
    setCustomUnit('')
    setShowCustom(false)
  }, [customName, customDescription, customPrice, customUnit, customCadence, dispatch])

  return (
    <div className="p-5">
      {/* Header */}
      <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>产品目录</div>
      <div className="text-[9px] font-semibold tracking-[1.4px] mt-1 mb-3" style={{ color: '#9B8550' }}>
        CATALOGUE  ·  {CATALOG.length} services
      </div>

      {/* Search placeholder */}
      <div
        className="flex items-center gap-2 h-[36px] px-3 rounded-[8px] mb-2"
        style={{ backgroundColor: '#F6EFDC' }}
      >
        <span className="text-[13px]" style={{ color: '#9B8550' }}>⌕</span>
        <span className="text-[12px]" style={{ color: '#9B8550' }}>搜索服务…</span>
      </div>

      <div className="text-[10px] italic mb-4" style={{ color: '#8B7A3E' }}>
        点击 + 添加到预览
      </div>

      {/* Service cards */}
      <div className="flex flex-col gap-[8px]">
        {CATALOG.map((svc) => {
          const isAdded = addedServiceIds.has(svc.id)
          const annualPrice = svc.billingCadence === 'monthly' ? svc.defaultPrice * 12 : svc.defaultPrice
          const isRecurring = svc.billingCadence === 'monthly'

          return (
            <div
              key={svc.id}
              className="relative rounded-[10px] overflow-hidden"
              style={{
                height: 76,
                backgroundColor: isAdded ? '#F8EFDC' : '#F6EFDC',
                opacity: isAdded ? 1 : 0.85,
              }}
            >
              {/* Gold left bar for added items */}
              {isAdded && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: '#B8922F' }} />
              )}

              <div className="px-4 py-[10px]">
                {/* FR name (with ✓ if added) */}
                <div className="text-[13px] font-bold" style={{ color: '#1C1611' }}>
                  {svc.name.fr}{isAdded ? '  ✓' : ''}
                </div>
                {/* ZH description */}
                <div className="text-[10px] mt-[2px]" style={{ color: '#6B5A3D' }}>
                  {svc.description.zh}
                </div>
                {/* Annual price big */}
                <div className="text-[15px] font-bold italic mt-[2px]" style={{ color: '#B8922F', fontFamily: 'var(--font-playfair)' }}>
                  {isRecurring ? `${annualPrice} € / an` : svc.billingCadence === 'perUnit' ? `${svc.defaultPrice} € / photo` : `${svc.defaultPrice} €`}
                </div>
                {/* Monthly subtext */}
                {isRecurring && (
                  <div className="text-[9px] font-medium" style={{ color: '#9B8550' }}>
                    = {svc.defaultPrice} € / mois
                  </div>
                )}
                {svc.billingCadence === 'perUnit' && (
                  <div className="text-[9px] font-medium" style={{ color: '#9B8550' }}>à la carte</div>
                )}
                {svc.billingCadence === 'oneOff' && (
                  <div className="text-[9px] font-medium" style={{ color: '#9B8550' }}>
                    une fois{svc.id === 'website-setup' ? ' · à la signature' : ' · matériel'}
                  </div>
                )}
              </div>

              {/* Add/Remove button — top right */}
              <button
                type="button"
                onClick={() => (isAdded ? removeService(svc.id) : addService(svc))}
                className="absolute top-[8px] right-[8px] text-[18px] font-bold leading-none"
                style={{ color: isAdded ? '#9B2A2A' : '#1C1611' }}
                aria-label={isAdded ? `移除 ${svc.name.zh}` : `添加 ${svc.name.zh}`}
              >
                {isAdded ? '×' : '+'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Show more */}
      <div className="text-[10px] font-semibold text-center tracking-[0.4px] mt-3" style={{ color: '#9B8550' }}>
        ▾  展开全部 {CATALOG.length} 项
      </div>

      {/* Divider */}
      <div className="my-3" style={{ height: 1, backgroundColor: '#D4C58E', opacity: 0.5 }} />

      {/* Custom service */}
      {!showCustom ? (
        <>
          <div className="text-[9px] text-center italic mb-2" style={{ color: '#9B8550' }}>
            ou crée ton propre service
          </div>
          <div
            className="rounded-[10px] flex flex-col items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
            style={{ height: 76, backgroundColor: '#F8EFDC' }}
            onClick={() => setShowCustom(true)}
          >
            <div className="text-[18px] font-bold" style={{ color: '#1C1611' }}>✎  +</div>
            <div className="text-[12px] font-bold" style={{ color: '#1C1611' }}>自定义新服务</div>
            <div className="text-[9px] italic" style={{ color: '#9B8550' }}>Service personnalisé</div>
          </div>
        </>
      ) : (
        <div className="rounded-[10px] p-3 space-y-2" style={{ backgroundColor: '#F8EFDC' }}>
          <input
            type="text"
            placeholder="服务标题"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full text-[12px] px-3 py-2 rounded-[8px] border-none focus:outline-none"
            style={{ backgroundColor: '#F6EFDC' }}
          />
          <textarea
            placeholder="服务描述"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            className="w-full text-[12px] px-3 py-2 rounded-[8px] border-none focus:outline-none resize-none"
            style={{ backgroundColor: '#F6EFDC', minHeight: 64 }}
          />
          <input
            type="number"
            placeholder="€（0 = 免费赠送）"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            className="w-full text-[12px] px-3 py-2 rounded-[8px] border-none focus:outline-none"
            style={{ backgroundColor: '#F6EFDC' }}
          />
          <select
            value={customCadence}
            onChange={(e) => setCustomCadence(e.target.value as 'monthly' | 'oneOff')}
            className="w-full text-[12px] px-3 py-2 rounded-[8px] border-none"
            style={{ backgroundColor: '#F6EFDC' }}
          >
            <option value="monthly">月付</option>
            <option value="oneOff">一次性</option>
          </select>
          {customCadence === 'oneOff' && (
            <input
              type="text"
              placeholder="单位（可空，如 台 / 张 / 次）"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              className="w-full text-[12px] px-3 py-2 rounded-[8px] border-none focus:outline-none"
              style={{ backgroundColor: '#F6EFDC' }}
            />
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={addCustomService}
              className="text-[12px] font-bold px-4 py-1.5 rounded-[8px] text-white"
              style={{ backgroundColor: '#1C1611' }}
            >
              添加
            </button>
            <button type="button" onClick={() => setShowCustom(false)} className="text-[12px] px-4 py-1.5 rounded-[8px]" style={{ color: '#9B8550' }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* Package generator button */}
      <div
        className="mt-3 rounded-[10px] flex items-center gap-3 px-4 cursor-pointer transition-opacity hover:opacity-90"
        style={{ height: 56, backgroundColor: '#1C1611' }}
        onClick={() => setShowPackGen(true)}
      >
        <span className="text-[18px]" style={{ color: '#F5D48A' }}>◆</span>
        <div>
          <div className="text-[13px] font-bold" style={{ color: '#F8EFDC' }}>套餐生成器</div>
          <div className="text-[10px]" style={{ color: '#9B8550' }}>自由组合 · 自定义总价</div>
        </div>
        <span className="ml-auto text-[16px] font-semibold" style={{ color: '#F5D48A' }}>→</span>
      </div>

      {showPackGen && <PackageGenerator onClose={() => setShowPackGen(false)} />}
    </div>
  )
}
