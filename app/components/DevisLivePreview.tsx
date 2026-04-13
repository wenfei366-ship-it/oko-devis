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
    dispatch({ type: 'UPDATE_ITEM', id: item.id, changes: { qty: newQty, lineTotalOverride: undefined } })
  }, [devis.items, dispatch])

  const handlePriceChange = useCallback((itemIndex: number, newPrice: number) => {
    const item = devis.items[itemIndex]
    if (!item || item.kind !== 'line') return
    dispatch({ type: 'UPDATE_ITEM', id: item.id, changes: { unitPrice: newPrice, lineTotalOverride: undefined } })
  }, [devis.items, dispatch])

  const handleTotalChange = useCallback((itemIndex: number, newTotal: number) => {
    const item = devis.items[itemIndex]
    if (!item) return
    if (item.kind === 'package') {
      dispatch({
        type: 'UPDATE_ITEM',
        id: item.id,
        changes: {
          monthlyPrice: newTotal / 12,
          annualPrice: newTotal,
        },
      })
      return
    }
    const qty = item.qty > 0 ? item.qty : 1
    dispatch({
      type: 'UPDATE_ITEM',
      id: item.id,
      changes: {
        unitPrice: newTotal / qty,
        lineTotalOverride: newTotal,
      },
    })
  }, [devis.items, dispatch])

  const handleRemoveItem = useCallback((itemIndex: number) => {
    const item = devis.items[itemIndex]
    if (!item) return
    dispatch({ type: 'REMOVE_ITEM', id: item.id })
  }, [devis.items, dispatch])

  return (
    <DevisPreviewContent
      vm={vm}
      onQtyChange={handleQtyChange}
      onPriceChange={handlePriceChange}
      onTotalChange={handleTotalChange}
      onRemoveItem={handleRemoveItem}
    />
  )
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
        className={`border border-[#A8702E] rounded px-1 outline-none bg-[#F8F1E0] ${className ?? ''}`}
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
      className={`group/field inline-flex items-center gap-0.5 cursor-pointer border-b border-dashed border-transparent hover:border-[#A8702E] transition-colors ${className ?? ''}`}
    >
      {value}
      <span className="opacity-0 group-hover/field:opacity-60 text-[#A8702E] text-[10px] ml-0.5 select-none" aria-hidden>✎</span>
    </span>
  )
}

/** Standalone renderer — also used for PNG export */
export function DevisPreviewContent({
  vm,
  onQtyChange,
  onPriceChange,
  onTotalChange,
  onRemoveItem,
}: {
  vm: DevisViewModel
  onQtyChange?: (itemIndex: number, qty: number) => void
  onPriceChange?: (itemIndex: number, price: number) => void
  onTotalChange?: (itemIndex: number, total: number) => void
  onRemoveItem?: (itemIndex: number) => void
}) {
  const destinataireLines = [
    vm.destinataire.address,
    vm.destinataire.postalCity,
    vm.destinataire.contactName,
    vm.destinataire.phone,
    vm.destinataire.email,
  ].filter(Boolean).join('\n')

  return (
    <div
      className="shadow-lg rounded-sm mx-auto"
      style={{
        width: 800,
        fontFamily: 'var(--font-inter), Inter, Arial, sans-serif',
        color: '#2A2620',
        fontSize: 12,
        lineHeight: 1.5,
        backgroundColor: '#F8F1E0',
      }}
    >
      {/* ═══ Header — document title left, OKO logo right ═══ */}
      <div className="flex items-start justify-between" style={{ padding: '56px 64px 12px 64px', paddingRight: 92 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 38 }}>
          <h2
            className="font-bold"
            style={{
              fontSize: 72,
              color: '#2A2620',
              fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
              letterSpacing: -2,
              lineHeight: 0.9,
            }}
          >
            {vm.labels.devisTitle}
          </h2>
          {/* N° + date row */}
          <div className="flex items-center" style={{ gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: '#A8702E' }}>
              N°  {vm.meta.number}
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#A8702E', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: 1.5, color: '#5C5142' }}>
              {vm.meta.date.toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oko-logo.png" alt="OKO" style={{ height: 95, width: 95, objectFit: 'contain' }} />
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 2.5, color: '#A8702E' }}>
            joinoko.com
          </span>
        </div>
      </div>

      {/* ═══ Hard divider ═══ */}
      <div style={{ margin: '0 64px', height: 1.5, backgroundColor: '#2A2620' }} />

      {/* ═══ Emetteur / Destinataire — dashed border box ═══ */}
      <div
        className="grid grid-cols-2"
        style={{
          margin: '20px 64px 0',
          gap: 48,
          border: '1px dashed rgba(217,207,184,0.7)',
          borderRadius: 2,
          padding: '12px 14px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#A8702E' }}>
            {vm.labels.emetteur}
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#2A2620' }}>{vm.emetteur.name}</p>
          <p style={{ fontSize: 11, color: '#5C5142', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {vm.emetteur.address}{'\n'}{vm.emetteur.rcs}{'\n'}{vm.emetteur.email}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#A8702E' }}>
            {vm.labels.destinataire}
          </p>
          {vm.destinataire.name && (
            <p style={{ fontSize: 15, fontWeight: 700, color: '#2A2620' }}>{vm.destinataire.name}</p>
          )}
          {destinataireLines && (
            <p style={{ fontSize: 11, color: '#5C5142', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
              {destinataireLines}
            </p>
          )}
        </div>
      </div>

      {/* ═══ Objet + Date + Validité + Début — dashed border box ═══ */}
      <div
        className="grid grid-cols-4"
        style={{
          margin: '20px 64px 0',
          gap: 48,
          border: '1px dashed rgba(217,207,184,0.7)',
          borderRadius: 2,
          padding: '8px 14px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: '#A8702E' }}>{vm.labels.objet}</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#2A2620' }}>{vm.meta.objet}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: '#A8702E' }}>{vm.labels.issueDate}</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#2A2620' }}>{vm.meta.date}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: '#A8702E' }}>{vm.labels.validity}</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#2A2620' }}>{vm.meta.validity}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: '#A8702E' }}>{vm.labels.debutPrestation}</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#2A2620' }}>{vm.meta.debutPrestation}</p>
        </div>
      </div>

      {/* ═══ Soft divider ═══ */}
      <div style={{ margin: '20px 64px 0', height: 0.5, backgroundColor: '#D9CFB8' }} />

      {/* ═══ Items table ═══ */}
      {vm.groupedItems.length > 0 && (
        <div style={{ padding: '20px 64px 0' }}>
          {/* Table header — dashed border + beige bg */}
          <div
            className="grid grid-cols-[1fr_120px_100px_100px_24px]"
            style={{
              backgroundColor: '#F2EAD3',
              border: '1px dashed rgba(217,207,184,0.7)',
              borderRadius: 2,
              padding: '12px 14px',
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: '#2A2620' }}>
              {vm.labels.designation}
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: '#2A2620', textAlign: 'right' }}>
              {vm.labels.qtyDuration}
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: '#2A2620', textAlign: 'right' }}>
              {vm.labels.unitPrice}
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: '#2A2620', textAlign: 'right' }}>
              {vm.labels.lineTotal}
            </p>
            <span aria-hidden />
          </div>

          {/* Table rows grouped by billing meaning */}
          {vm.groupedItems.map((group) => (
            <div key={group.key}>
              <div
                style={{
                  padding: '10px 14px 6px',
                  marginTop: 6,
                  backgroundColor: group.key === 'recurring' ? '#F8EFDC' : '#EFE3C6',
                  borderLeft: '3px solid #B8922F',
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#A8702E', textTransform: 'uppercase' }}>
                  {group.title}
                </p>
                <p style={{ fontSize: 9, color: '#6B5A3D', marginTop: 1 }}>
                  {group.subtitle}
                </p>
              </div>

              {group.items.map((item) => {
                const idx = vm.items.indexOf(item)
                return (
                  <div key={idx} data-section={`item-${idx}`}>
                    <div
                      className="grid grid-cols-[1fr_120px_100px_100px_24px]"
                      style={{ padding: '12px 14px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#2A2620' }}>{item.name}</p>
                        {item.description && (
                          <div style={{ fontSize: 10, color: '#5C5142', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#5C5142', textAlign: 'right' }}>
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
                      <div style={{ fontSize: 11, color: '#5C5142', textAlign: 'right' }}>
                        {onPriceChange && item.kind === 'line' ? (
                          <EditableField
                            value={item.unitPriceLabel}
                            fieldName="prix unitaire"
                            onSave={(raw) => {
                              const cleaned = raw.replace(/[€\s]/g, '').replace(',', '.')
                              const num = parseFloat(cleaned)
                              if (!isNaN(num) && num >= 0) onPriceChange(idx, num)
                            }}
                          />
                        ) : (
                          item.unitPriceLabel
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#2A2620', textAlign: 'right' }}>
                        {onTotalChange ? (
                          <EditableField
                            value={item.lineAmountLabel}
                            fieldName="total"
                            onSave={(raw) => {
                              const cleaned = raw.replace(/[€\s\u00a0\u202f]/g, '').replace(',', '.')
                              const num = parseFloat(cleaned)
                              if (!isNaN(num) && num >= 0) onTotalChange(idx, num)
                            }}
                          />
                        ) : (
                          item.lineAmountLabel
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            aria-label={`Supprimer ${item.name}`}
                            title="Supprimer"
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#9B2A2A',
                              fontSize: 14,
                              fontWeight: 700,
                              lineHeight: '18px',
                              cursor: 'pointer',
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ height: 0.5, backgroundColor: '#E8DFC6' }} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* ═══ Dual cards (MENSUEL / ANNUEL) ═══ */}
      {vm.dualCards && (
        <div style={{ padding: '8px 64px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.6, color: '#A8702E', marginBottom: 6 }}>
            FORMULES AU CHOIX  ·  {vm.labels.mensuel} / {vm.labels.annuel}
          </p>
          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            {/* Monthly card */}
            <div style={{ position: 'relative', backgroundColor: '#F6EFDC', borderRadius: 6, height: 70, padding: '6px 16px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.4, color: '#6B5A3D' }}>
                {vm.labels.mensuel}
              </p>
              {vm.dualCards.monthly.economy > 0 && (
                <p style={{ fontSize: 10, fontWeight: 500, color: '#9B8550', marginTop: 3 }}>
                  <span style={{ textDecoration: 'line-through' }}>
                    {vm.labels.tarifNormal}  {formatEuro(vm.dualCards.monthly.baseline)}/mois
                  </span>
                </p>
              )}
              <p style={{
                position: 'absolute', right: 16, top: 16,
                fontSize: 24, fontStyle: 'italic', fontWeight: 700, color: '#2A2620',
                fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
              }}>
                {formatEuro(vm.dualCards.monthly.final)}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9B8550', fontFamily: 'var(--font-inter), Inter, sans-serif', fontStyle: 'normal', marginLeft: 4 }}>
                  {vm.labels.perMonth}
                </span>
              </p>
              {vm.dualCards.monthly.economy > 0 && (
                <p style={{ fontSize: 10, fontStyle: 'italic', fontWeight: 700, color: '#9B2A2A', marginTop: 3 }}>
                  {vm.labels.economie}  {formatEuro(vm.dualCards.monthly.economy)}/mois  ·  − {vm.dualCards.monthly.economyPct} %
                </p>
              )}
            </div>

            {/* Annual card */}
            <div style={{ position: 'relative', backgroundColor: '#1C1611', borderRadius: 6, height: 70, padding: '6px 16px', overflow: 'hidden' }}>
              {/* Gold top bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#B8922F' }} />
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.4, color: '#F5D48A' }}>
                {vm.labels.annuel}  &#9733;  {vm.labels.recommande}
              </p>
              {vm.dualCards.annual.economy > 0 && (
                <p style={{ fontSize: 10, fontWeight: 500, color: '#9B8550', marginTop: 3 }}>
                  <span style={{ textDecoration: 'line-through' }}>
                    {vm.labels.tarifNormal}  {formatEuro(vm.dualCards.annual.baseline)}/an
                  </span>
                </p>
              )}
              <p style={{
                position: 'absolute', right: 16, top: 14,
                fontSize: 26, fontStyle: 'italic', fontWeight: 700, color: '#F8EFDC',
                fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
              }}>
                {formatEuro(vm.dualCards.annual.final)}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#B8922F', fontFamily: 'var(--font-inter), Inter, sans-serif', fontStyle: 'normal', marginLeft: 4 }}>
                  {vm.labels.perYear}
                </span>
              </p>
              {vm.dualCards.annual.economy > 0 && (
                <p style={{ fontSize: 10, fontStyle: 'italic', fontWeight: 700, color: '#F5D48A', marginTop: 3 }}>
                  {vm.labels.economie}  {formatEuro(vm.dualCards.annual.economy)}/an  ·  − {vm.dualCards.annual.economyPct} %
                </p>
              )}
            </div>
          </div>
          {vm.totals.oneOffTotal > 0 && (
            <div
              style={{
                marginTop: 8,
                backgroundColor: '#EFE3C6',
                borderLeft: '3px solid #B8922F',
                borderRadius: 4,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.1, color: '#6B5A3D', textTransform: 'uppercase' }}>
                {vm.labels.oneOffTotal}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#2A2620' }}>
                {formatEuro(vm.totals.oneOffTotal)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* TOTAL HT bar — only when no dual cards (fallback for individual services) */}
      {!vm.dualCards && vm.items.length > 0 && (
        <div style={{ padding: '14px 64px 0' }}>
          <div
            className="flex items-center justify-between"
            style={{ borderRadius: 6, backgroundColor: '#2A2620', padding: '10px 14px' }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, color: '#F8F1E0', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
              {vm.labels.totalHT}
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#F8F1E0', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
              {vm.isFrance ? `${vm.totalsFormatted.totalHT} HT` : vm.totalsFormatted.total}
            </span>
          </div>
        </div>
      )}

      {/* ═══ Soft divider ═══ */}
      <div style={{ margin: '20px 64px 0', height: 0.5, backgroundColor: '#D9CFB8' }} />

      {/* ═══ Inclus gratuitement — dashed border box, two columns ═══ */}
      {vm.inclusGratuit.length > 0 && (
        <div
          style={{
            margin: '20px 64px 0',
            border: '1px dashed rgba(217,207,184,0.7)',
            borderRadius: 2,
            padding: '12px 14px',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#A8702E', marginBottom: 8 }}>
            {vm.labels.inclusGratuitement}
          </p>
          <div className="grid grid-cols-2" style={{ gap: '4px 24px' }}>
            {vm.inclusGratuit.map((name, i) => (
              <p key={i} style={{ fontSize: 11, color: '#5C5142' }}>
                ✓  {name}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Soft divider ═══ */}
      <div style={{ margin: '20px 64px 0', height: 0.5, backgroundColor: '#D9CFB8' }} />

      {/* ═══ Bank details — solid border box, two columns ═══ */}
      <div
        style={{
          margin: '20px 64px 0',
          borderRadius: 6,
          backgroundColor: '#FBF7EA',
          border: '1px solid #D9CFB8',
          padding: '14px 16px',
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#A8702E', marginBottom: 8 }}>
          {vm.labels.coordonneesBancaires}
        </p>
        <div className="grid grid-cols-2" style={{ gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: '#968974' }}>IBAN</p>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.5, color: '#2A2620' }}>
              {vm.bankDetails.iban}
            </p>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: '#968974', marginTop: 4 }}>BIC / SWIFT</p>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 0.5, color: '#2A2620' }}>{vm.bankDetails.bic}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: '#968974' }}>BÉNÉFICIAIRE</p>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#2A2620' }}>
              OKO  ·  {vm.emetteur.address}
            </p>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: '#968974', marginTop: 4 }}>BANQUE</p>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#2A2620' }}>
              {vm.bankDetails.bank}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Conditions generales — dashed border box ═══ */}
      <div
        style={{
          margin: '20px 64px 0',
          border: '1px dashed rgba(217,207,184,0.7)',
          borderRadius: 2,
          padding: '12px 14px',
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#A8702E', marginBottom: 6 }}>
          {vm.labels.conditionsGenerales}
        </p>
        <div>
          {vm.conditionsGenerales.map((clause, i) => (
            <p key={i} style={{ fontSize: 10, color: '#5C5142', lineHeight: 1.7 }}>
              {clause}
            </p>
          ))}
        </div>
      </div>

      {/* ═══ Soft divider ═══ */}
      <div style={{ margin: '20px 64px 0', height: 0.5, backgroundColor: '#D9CFB8' }} />

      {/* ═══ Signature block — two columns ═══ */}
      <div className="grid grid-cols-[1fr_260px]" style={{ padding: '24px 64px 48px', gap: 32 }}>
        {/* Left: BON POUR ACCORD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#A8702E' }}>
            {vm.labels.bonPourAccord}
          </p>
          <div style={{ height: 80 }} />
          <div style={{ height: 0.5, width: 240, backgroundColor: '#2A2620' }} />
          <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: 1, color: '#5C5142' }}>
            {vm.labels.dateSignature}
          </p>
        </div>
        {/* Right: L'ÉQUIPE OKO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#A8702E' }}>
            {vm.labels.equipeOko}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/oko-signature.png"
            alt="Signature OKO"
            style={{ height: 80, width: 150, objectFit: 'contain' }}
          />
          <div style={{ height: 0.5, backgroundColor: '#2A2620' }} />
          <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: 0.5, color: '#5C5142' }}>
            L&apos;équipe OKO  ·  support@joinoko.com
          </p>
        </div>
      </div>

      {/* Legal footnote for non-FR */}
      {vm.legalFootnote && (
        <div style={{ padding: '0 64px 48px' }}>
          <p style={{ fontSize: 9, color: '#968974', fontStyle: 'italic' }}>{vm.legalFootnote}</p>
        </div>
      )}
    </div>
  )
}
