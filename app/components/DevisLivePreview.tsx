'use client'

import { useMemo, useState, useRef, useCallback } from 'react'
import { useDevis } from './DevisContext'
import { computeTotals, formatEuro } from '@/app/lib/calculations'
import { buildViewModel, type DevisViewModel } from '@/app/lib/viewModel'

export default function DevisLivePreview() {
  const { devis, dispatch } = useDevis()
  const totals = useMemo(() => computeTotals(devis), [devis])
  const vm = useMemo(() => buildViewModel(devis, totals), [devis, totals])

  const handleQtyChange = useCallback((itemIndex: number, newQty: number) => {
    const item = devis.items[itemIndex]
    if (!item || item.kind !== 'line') return
    dispatch({ type: 'UPDATE_ITEM', id: item.id, changes: { qty: newQty } })
  }, [devis.items, dispatch])

  const handlePriceChange = useCallback((itemIndex: number, newPrice: number) => {
    const item = devis.items[itemIndex]
    if (!item || item.kind !== 'line') return
    dispatch({ type: 'UPDATE_ITEM', id: item.id, changes: { unitPrice: newPrice } })
  }, [devis.items, dispatch])

  return <DevisPreviewContent vm={vm} onQtyChange={handleQtyChange} onPriceChange={handlePriceChange} />
}

interface EditableFieldProps {
  value: string
  onSave: (raw: string) => void
  fieldName: string
  className?: string
}

function EditableField({ value, onSave, fieldName, className }: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = useCallback(() => {
    setDraft(value)
    setEditing(true)
    // focus on next tick after render
    setTimeout(() => inputRef.current?.select(), 0)
  }, [value])

  const commit = useCallback(() => {
    setEditing(false)
    if (draft !== value) {
      onSave(draft)
    }
  }, [draft, value, onSave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }, [commit])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        aria-label={`Modifier ${fieldName}`}
        className={`border border-[#B8922F] rounded px-1 outline-none bg-[#FEFBF2] ${className ?? ''}`}
        style={{ minWidth: 40, width: `${Math.max(draft.length, 3) + 2}ch` }}
        autoFocus
      />
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={startEdit}
      onKeyDown={(e) => e.key === 'Enter' && startEdit()}
      aria-label={`Modifier ${fieldName}`}
      title={`Modifier ${fieldName}`}
      className={`group/field inline-flex items-center gap-0.5 cursor-pointer border-b border-dashed border-transparent hover:border-[#B8922F] transition-colors ${className ?? ''}`}
    >
      {value}
      <span className="opacity-0 group-hover/field:opacity-60 text-[#B8922F] text-[10px] ml-0.5 select-none" aria-hidden>✎</span>
    </span>
  )
}

/** Standalone renderer — also used for PNG export */
export function DevisPreviewContent({
  vm,
  onQtyChange,
  onPriceChange,
}: {
  vm: DevisViewModel
  onQtyChange?: (itemIndex: number, qty: number) => void
  onPriceChange?: (itemIndex: number, price: number) => void
}) {
  return (
    <div
      className="bg-[#FEFBF2] shadow-lg rounded-sm mx-auto"
      style={{
        width: 800,
        fontFamily: 'var(--font-inter), Inter, Arial, sans-serif',
        color: '#1C1611',
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      {/* Header — matches Slftq: DEVIS big left, OKO logo right */}
      <div className="flex items-start justify-between px-16 pt-12 pb-2">
        <h2
          className="font-bold italic"
          style={{
            fontSize: 52,
            color: '#1C1611',
            fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          DEVIS
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/oko-logo.png" alt="OKO" style={{ height: 40, width: 'auto' }} />
      </div>
      {/* N° + date + joinoko.com */}
      <div className="px-16 pb-1 flex items-center gap-2">
        <span className="text-[11px] font-semibold tracking-[1px]" style={{ color: '#9B8550' }}>
          N° {vm.meta.number}  ·  {vm.meta.date}
        </span>
        <span className="ml-auto text-[10px] font-medium tracking-[0.6px]" style={{ color: '#9B8550' }}>
          joinoko.com
        </span>
      </div>

      {/* Gold rule */}
      <div className="mx-16 mt-3" style={{ height: 1.5, backgroundColor: '#B8922F', opacity: 0.55 }} />

      {/* Emetteur / Destinataire — two columns */}
      <div className="px-16 py-4 grid grid-cols-2 gap-8">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[1.4px] mb-1" style={{ color: '#9B8550' }}>
            {vm.labels.emetteur}
          </p>
          <p className="text-[12px] font-bold" style={{ color: '#1C1611' }}>{vm.emetteur.name}</p>
          <p className="text-[10px]" style={{ color: '#1C1611' }}>{vm.emetteur.address}</p>
          <p className="text-[10px]" style={{ color: '#1C1611' }}>{vm.emetteur.rcs}</p>
          <p className="text-[10px]" style={{ color: '#6B5A3D' }}>{vm.emetteur.email}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[1.4px] mb-1" style={{ color: '#9B8550' }}>
            {vm.labels.destinataire}
          </p>
          <p className="text-[12px] font-bold" style={{ color: '#1C1611' }}>{vm.destinataire.name || '—'}</p>
          <p className="text-[10px]" style={{ color: '#1C1611' }}>{vm.destinataire.address || '—'}</p>
          <p className="text-[10px]" style={{ color: '#1C1611' }}>{vm.destinataire.postalCity || '—'}</p>
          <p className="text-[10px]" style={{ color: '#6B5A3D' }}>{vm.destinataire.contactName}</p>
          <p className="text-[10px]" style={{ color: '#6B5A3D' }}>{vm.destinataire.phone}</p>
        </div>
      </div>

      {/* Objet + Date + Validité + Début row */}
      <div className="px-16 pb-2 grid grid-cols-4 gap-4 text-[10px]">
        <div>
          <p className="font-semibold uppercase tracking-[1px]" style={{ color: '#9B8550' }}>{vm.labels.objet}</p>
          <p className="text-[11px] italic mt-0.5" style={{ fontFamily: 'var(--font-playfair)', color: '#1C1611' }}>{vm.meta.objet}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[1px]" style={{ color: '#9B8550' }}>{vm.labels.date}</p>
          <p className="mt-0.5" style={{ color: '#1C1611' }}>{vm.meta.date}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[1px]" style={{ color: '#9B8550' }}>{vm.labels.validity}</p>
          <p className="mt-0.5" style={{ color: '#1C1611' }}>{vm.meta.validity}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[1px]" style={{ color: '#9B8550' }}>{vm.labels.debutPrestation}</p>
          <p className="mt-0.5 italic" style={{ color: '#1C1611' }}>{vm.meta.debutPrestation}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-16 border-t border-[#D9CFB8]" />

      {/* Items table */}
      {vm.items.length > 0 && (
        <div className="px-16 py-4">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_100px_100px] gap-2 pb-2 border-b border-[#D9CFB8]">
            <p className="text-[10px] uppercase tracking-widest text-[#968974] font-semibold">
              {vm.labels.designation}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#968974] font-semibold text-center">
              {vm.labels.qtyDuration}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#968974] font-semibold text-right">
              {vm.labels.unitPrice}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#968974] font-semibold text-right">
              {vm.labels.lineTotal}
            </p>
          </div>

          {/* Table rows */}
          {vm.items.map((item, idx) => (
            <div
              key={idx}
              data-section={`item-${idx}`}
              className="grid grid-cols-[1fr_100px_100px_100px] gap-2 py-2 border-b border-[#E8DFC6]"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-[#968974] mt-0.5">{item.description}</p>
                )}
                {item.childNames && item.childNames.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.childNames.map((cn, ci) => (
                      <span
                        key={ci}
                        className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#F6EFDC] text-[#5C5142]"
                      >
                        {cn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-center self-center">
                {onQtyChange && item.kind === 'line' ? (
                  <EditableField
                    value={item.qtyLabel}
                    fieldName="quantité"
                    onSave={(raw) => {
                      const num = parseFloat(raw)
                      if (!isNaN(num) && num > 0) onQtyChange(idx, num)
                    }}
                  />
                ) : (
                  item.qtyLabel
                )}
              </div>
              <div className="text-xs text-right self-center">
                {onPriceChange && item.kind === 'line' ? (
                  <EditableField
                    value={item.unitPriceLabel}
                    fieldName="prix unitaire"
                    onSave={(raw) => {
                      // Accept formats like "€30", "30", "30,00", "30.00"
                      const cleaned = raw.replace(/[€\s]/g, '').replace(',', '.')
                      const num = parseFloat(cleaned)
                      if (!isNaN(num) && num >= 0) onPriceChange(idx, num)
                    }}
                  />
                ) : (
                  item.unitPriceLabel
                )}
              </div>
              <p className="text-sm font-semibold text-right self-center">
                {item.lineAmountLabel}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Dual cards (MENSUEL / ANNUEL) */}
      {vm.dualCards && (
        <div className="px-16 py-3">
          <div className="grid grid-cols-2 gap-4">
            {/* Monthly card */}
            <div className="rounded-lg border border-[#D9CFB8] p-4 bg-[#FDFAF0]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#968974] mb-2">
                {vm.labels.mensuel}
              </p>
              <p className="text-xs text-[#968974] line-through">
                {vm.labels.tarifNormal} : {formatEuro(vm.dualCards.monthly.baseline)}
              </p>
              <p className="text-xl font-bold text-[#1C1611] mt-1">
                {formatEuro(vm.dualCards.monthly.final)}
                <span className="text-xs font-normal text-[#968974] ml-1">{vm.labels.perMonth}</span>
              </p>
              <p className="text-xs text-[#4B8A5A] mt-1">
                {vm.labels.economie} : {formatEuro(vm.dualCards.monthly.economy)} ({vm.dualCards.monthly.economyPct}%)
              </p>
            </div>

            {/* Annual card */}
            <div className="rounded-lg border-2 border-[#B8922F] p-4 bg-[#FBF7EC]">
              <div className="flex items-center gap-1 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B8922F]">
                  {vm.labels.annuel} &#9733;
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B8922F] text-white">
                  {vm.labels.recommande}
                </span>
              </div>
              <p className="text-xs text-[#968974] line-through">
                {vm.labels.tarifNormal} : {formatEuro(vm.dualCards.annual.baseline)}
              </p>
              <p className="text-xl font-bold text-[#1C1611] mt-1">
                {formatEuro(vm.dualCards.annual.final)}
                <span className="text-xs font-normal text-[#968974] ml-1">{vm.labels.perYear}</span>
              </p>
              <p className="text-xs text-[#4B8A5A] mt-1">
                {vm.labels.economie} : {formatEuro(vm.dualCards.annual.economy)} ({vm.dualCards.annual.economyPct}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Totals section — dark bar matching Slftq TOTAL HT */}
      <div className="px-16 py-4">
        {/* TOTAL HT dark bar */}
        <div
          className="flex items-center justify-between rounded-[4px] px-5"
          style={{
            height: 56,
            backgroundColor: '#1C1611',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: '#B8922F' }} />
            <span className="text-[13px] font-bold tracking-[1.8px]" style={{ color: '#F8EFDC' }}>
              {vm.isFrance ? vm.labels.totalHT : vm.labels.totalHT}
            </span>
          </div>
          <span
            className="font-bold italic"
            style={{
              fontSize: 22,
              color: '#F8EFDC',
              fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
            }}
          >
            {vm.isFrance ? `${vm.totalsFormatted.totalHT} HT` : vm.totalsFormatted.total}
          </span>
        </div>

        {/* TVA + TTC below (France only) */}
        {vm.isFrance && (
          <div className="mt-2 text-right space-y-0.5">
            <p className="text-[11px]" style={{ color: '#6B5A3D' }}>
              {vm.labels.tva} : {vm.totalsFormatted.tva}
            </p>
            <p className="text-[13px] font-bold" style={{ color: '#1C1611' }}>
              {vm.labels.totalTtc} : {vm.totalsFormatted.total}
            </p>
          </div>
        )}
        {!vm.isFrance && (
          <div className="mt-1 text-right" />
        )}
      </div>

      {/* Inclus gratuitement */}
      {vm.inclusGratuit.length > 0 && (
        <div className="px-16 py-3">
          <p className="text-[10px] uppercase tracking-widest text-[#968974] font-semibold mb-2">
            {vm.labels.inclusGratuitement}
          </p>
          <ul className="space-y-1">
            {vm.inclusGratuit.map((name, i) => (
              <li key={i} className="text-xs text-[#5C5142] flex items-center gap-1.5">
                <span className="text-[#4B8A5A]">&#10003;</span> {name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bank details — two columns matching Slftq */}
      <div className="px-16 py-4 border-t border-[#E8DFC6]">
        <p className="text-[9px] font-semibold uppercase tracking-[1.4px] mb-3" style={{ color: '#9B8550' }}>
          {vm.labels.coordonneesBancaires}
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div
            className="rounded-[4px] p-3"
            style={{ backgroundColor: '#F6EFDC' }}
          >
            <p className="text-[9px] font-semibold tracking-[1px] mb-1" style={{ color: '#9B8550' }}>IBAN</p>
            <p className="text-[11px] font-bold tracking-[0.6px]" style={{ color: '#1C1611' }}>
              {vm.bankDetails.iban}
            </p>
            <p className="text-[9px] mt-1" style={{ color: '#6B5A3D' }}>
              BIC : {vm.bankDetails.bic}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold tracking-[1px] mb-1" style={{ color: '#9B8550' }}>OKO</p>
            <p className="text-[10px]" style={{ color: '#1C1611' }}>
              {vm.emetteur.address}
            </p>
            <p className="text-[10px] mt-1" style={{ color: '#6B5A3D' }}>
              {vm.bankDetails.bank}
            </p>
          </div>
        </div>
      </div>

      {/* Conditions generales */}
      <div className="px-16 py-3 border-t border-[#E8DFC6]">
        <p className="text-[10px] uppercase tracking-widest text-[#968974] font-semibold mb-2">
          {vm.labels.conditionsGenerales}
        </p>
        <div className="space-y-1.5">
          {vm.conditionsGenerales.map((clause, i) => (
            <p key={i} className="text-[10px] text-[#968974] leading-relaxed">
              {clause}
            </p>
          ))}
        </div>
      </div>

      {/* Signature block — two columns matching Slftq */}
      <div className="px-16 py-6 border-t" style={{ borderColor: '#D4C58E' }}>
        <div className="grid grid-cols-2 gap-8">
          {/* Left: BON POUR ACCORD + client signature area */}
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[1.4px] mb-2" style={{ color: '#9B8550' }}>
              {vm.labels.bonPourAccord}
            </p>
            <p className="text-[10px] italic mb-6" style={{ color: '#6B5A3D' }}>
              {vm.labels.dateSignature}
            </p>
            <div className="h-[1px] w-full" style={{ backgroundColor: '#D4C58E', opacity: 0.6 }} />
          </div>
          {/* Right: L'ÉQUIPE OKO + signature image */}
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[1.4px] mb-2" style={{ color: '#9B8550' }}>
              {vm.labels.equipeOko}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/oko-signature.png"
              alt="Signature OKO"
              className="ml-auto"
              style={{ height: 48, width: 'auto', opacity: 0.85 }}
            />
            <p className="text-[9px] mt-2" style={{ color: '#6B5A3D' }}>
              © équipe OKO · support@joinoko.com
            </p>
          </div>
        </div>
      </div>

      {/* Legal footnote for non-FR */}
      {vm.legalFootnote && (
        <div className="px-16 pb-6">
          <p className="text-[9px] text-[#968974] italic">{vm.legalFootnote}</p>
        </div>
      )}
    </div>
  )
}
