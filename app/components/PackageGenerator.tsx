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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 6, 4, 0.75)' }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: 1120,
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundColor: '#F8EFDC',
          borderRadius: 14,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: '#E8DCBE', opacity: 0.18, mixBlendMode: 'multiply' }}
        />

        {/* Scrollable content */}
        <div className="relative z-10 overflow-y-auto" style={{ maxHeight: '90vh' }}>
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              width: 44,
              height: 44,
              backgroundColor: '#1C1611',
              borderRadius: '50%',
            }}
            aria-label="关闭"
          >
            <span style={{ color: '#F4EBD4', fontSize: 20, lineHeight: 1 }}>&times;</span>
          </button>

          {/* Header */}
          <div className="text-center" style={{ paddingTop: 40, paddingBottom: 24, paddingLeft: 60, paddingRight: 60 }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 2.4,
                color: '#9B8550',
                marginBottom: 10,
              }}
            >
              ATELIER OKO &middot; PACK PERSONNALIS&Eacute;
            </p>
            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 42,
                fontWeight: 700,
                fontStyle: 'italic',
                color: '#1C1611',
                marginBottom: 8,
                lineHeight: 1.1,
              }}
            >
              套餐生成器
            </h2>
            <p
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 14,
                fontStyle: 'italic',
                color: '#6B5A3D',
                maxWidth: 600,
                margin: '0 auto',
                lineHeight: 1.5,
              }}
            >
              Compose un pack sur mesure — Choisis les services, fixe ton prix total, et ajoute-le au devis en une ligne.
            </p>
            {/* Gold rule */}
            <div
              style={{
                height: 1,
                backgroundColor: '#B8922F',
                opacity: 0.4,
                marginTop: 24,
              }}
            />
          </div>

          {/* Two-column layout */}
          <div
            className="flex"
            style={{ paddingLeft: 40, paddingRight: 40, gap: 0, minHeight: 380 }}
          >
            {/* LEFT COLUMN */}
            <div style={{ flex: '0 0 480px', paddingRight: 30 }}>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  color: '#1C1611',
                  marginBottom: 4,
                }}
              >
                ① S&Eacute;LECTIONNE LES SERVICES
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  fontStyle: 'italic',
                  color: '#9B8550',
                  marginBottom: 14,
                }}
              >
                Coche les services &agrave; inclure dans le pack
              </p>

              <div className="space-y-2">
                {eligibleServices.map((svc) => {
                  const isSelected = selected.has(svc.id)
                  return (
                    <label
                      key={svc.id}
                      className="flex items-center gap-3 cursor-pointer transition-colors"
                      style={{
                        width: 460,
                        maxWidth: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#FEFBF2' : '#F6EFDC',
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          backgroundColor: isSelected ? '#1C1611' : '#FEFBF2',
                          border: isSelected ? 'none' : '1.5px solid #C4B899',
                        }}
                      >
                        {isSelected && (
                          <span style={{ color: '#F5D48A', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(svc.id)}
                        className="sr-only"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 12,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#1C1611' : '#6B5A3D',
                            lineHeight: 1.3,
                          }}
                        >
                          {svc.name.fr} &middot; {svc.name.zh}
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 10,
                            color: isSelected ? '#6B5A3D' : '#9B8550',
                            lineHeight: 1.3,
                            marginTop: 2,
                          }}
                        >
                          {svc.description.zh}
                        </p>
                      </div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 11,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#B8922F' : '#9B8550',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {svc.defaultPrice} € / mois
                      </p>
                    </label>
                  )
                })}
              </div>

              {eligibleServices.length > 5 && (
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    fontStyle: 'italic',
                    color: '#9B8550',
                    marginTop: 10,
                    textAlign: 'center',
                  }}
                >
                  + d&rsquo;autres services disponibles
                </p>
              )}
            </div>

            {/* Vertical gold divider */}
            <div
              style={{
                width: 1,
                backgroundColor: '#B8922F',
                opacity: 0.3,
                alignSelf: 'stretch',
                flexShrink: 0,
              }}
            />

            {/* RIGHT COLUMN */}
            <div style={{ flex: 1, paddingLeft: 30, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  color: '#1C1611',
                  marginBottom: 14,
                }}
              >
                ② CONFIGURE LE PACK
              </p>

              {/* Pack card */}
              <div
                style={{
                  backgroundColor: '#FEFBF2',
                  borderRadius: 12,
                  borderLeft: '4px solid #B8922F',
                  padding: '20px 22px',
                }}
              >
                {/* Auto name label */}
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    color: '#9B8550',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                  }}
                >
                  NOM AUTO
                </p>
                {/* Pack name */}
                <p
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 26,
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: '#1C1611',
                    lineHeight: 1.2,
                    marginBottom: 12,
                  }}
                >
                  {selectedServices.length > 0
                    ? `Pack sur mesure · ${selectedServices.length} services`
                    : 'Pack sur mesure · 0 service'}
                </p>

                {/* Gold divider */}
                <div style={{ height: 1, backgroundColor: '#B8922F', opacity: 0.3, marginBottom: 14 }} />

                {/* SERVICES INCLUS */}
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    color: '#9B8550',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  SERVICES INCLUS
                </p>

                {selectedServices.length === 0 ? (
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 11,
                      fontStyle: 'italic',
                      color: '#9B8550',
                      marginBottom: 14,
                    }}
                  >
                    Aucun service s&eacute;lectionn&eacute;
                  </p>
                ) : (
                  <div className="space-y-1.5" style={{ marginBottom: 14 }}>
                    {selectedServices.map((svc) => (
                      <div key={svc.id}>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#1C1611',
                            lineHeight: 1.3,
                          }}
                        >
                          ✦ {svc.name.fr} — {svc.name.zh}
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 10,
                            fontStyle: 'italic',
                            color: '#6B5A3D',
                            lineHeight: 1.3,
                            paddingLeft: 14,
                          }}
                        >
                          {svc.description.fr}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gold divider */}
                <div style={{ height: 1, backgroundColor: '#B8922F', opacity: 0.3, marginBottom: 14 }} />

                {/* TARIFICATION */}
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    color: '#9B8550',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}
                >
                  TARIFICATION
                </p>

                <div className="flex gap-3">
                  {/* MENSUEL card */}
                  <div
                    className="flex-1 cursor-pointer"
                    style={{
                      backgroundColor: '#F6EFDC',
                      borderRadius: 10,
                      padding: '12px 14px',
                      minHeight: 92,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#6B5A3D',
                        marginBottom: 6,
                      }}
                    >
                      MENSUEL &middot; 月付
                    </p>
                    {baselineMonthly > 0 && effectiveMonthly < baselineMonthly && (
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 11,
                          color: '#9B8550',
                          textDecoration: 'line-through',
                          marginBottom: 2,
                        }}
                      >
                        {formatEuro(baselineMonthly)}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      {!editingMonthly ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMonthly(true)
                            setMonthlyOverride(String(effectiveMonthly))
                          }}
                          className="cursor-text hover:opacity-80 transition-opacity"
                          title="点击编辑价格"
                          style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 30,
                            fontWeight: 700,
                            fontStyle: 'italic',
                            color: '#1C1611',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          {formatEuro(effectiveMonthly)}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={monthlyOverride}
                            onChange={(e) => setMonthlyOverride(e.target.value)}
                            onBlur={() => setEditingMonthly(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingMonthly(false)}
                            className="focus:outline-none"
                            style={{
                              width: 80,
                              fontFamily: '"Playfair Display", serif',
                              fontSize: 30,
                              fontWeight: 700,
                              fontStyle: 'italic',
                              color: '#1C1611',
                              background: 'transparent',
                              borderBottom: '2px solid #B8922F',
                            }}
                            autoFocus
                          />
                        </div>
                      )}
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#9B8550',
                        }}
                      >
                        / mois
                      </span>
                    </div>
                    {monthlyEconomy > 0 && (
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 10,
                          fontWeight: 700,
                          fontStyle: 'italic',
                          color: '#9B2A2A',
                          marginTop: 4,
                        }}
                      >
                        Économie : {formatEuro(monthlyEconomy)} / mois
                      </p>
                    )}
                  </div>

                  {/* ANNUEL card */}
                  <div
                    className="flex-1 relative cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: '#1C1611',
                      borderRadius: 10,
                      padding: '12px 14px',
                      minHeight: 92,
                    }}
                  >
                    {/* Gold top bar */}
                    <div
                      className="absolute top-0 left-0 right-0"
                      style={{ height: 4, backgroundColor: '#B8922F' }}
                    />
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#F5D48A',
                        marginBottom: 6,
                      }}
                    >
                      ANNUEL &middot; 年付 ★
                    </p>
                    {baselineAnnual > 0 && effectiveAnnual < baselineAnnual && (
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 11,
                          color: '#9B8550',
                          textDecoration: 'line-through',
                          marginBottom: 2,
                        }}
                      >
                        {formatEuro(baselineAnnual)}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      {!editingAnnual ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAnnual(true)
                            setAnnualOverride(String(effectiveAnnual))
                          }}
                          className="cursor-text hover:opacity-80 transition-opacity"
                          title="点击编辑价格"
                          style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 30,
                            fontWeight: 700,
                            fontStyle: 'italic',
                            color: '#F8EFDC',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          {formatEuro(effectiveAnnual)}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={annualOverride}
                            onChange={(e) => setAnnualOverride(e.target.value)}
                            onBlur={() => setEditingAnnual(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingAnnual(false)}
                            className="focus:outline-none"
                            style={{
                              width: 80,
                              fontFamily: '"Playfair Display", serif',
                              fontSize: 30,
                              fontWeight: 700,
                              fontStyle: 'italic',
                              color: '#F8EFDC',
                              background: 'transparent',
                              borderBottom: '2px solid #B8922F',
                            }}
                            autoFocus
                          />
                        </div>
                      )}
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 14,
                          color: '#B8922F',
                        }}
                      >
                        / an
                      </span>
                    </div>
                    {annualEconomy > 0 && (
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 10,
                          fontWeight: 700,
                          fontStyle: 'italic',
                          color: '#F5D48A',
                          marginTop: 4,
                        }}
                      >
                        Économie : {formatEuro(annualEconomy)} / an
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM PREVIEW ③ */}
          <div style={{ paddingLeft: 40, paddingRight: 40, marginTop: 24 }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.8,
                color: '#1C1611',
                marginBottom: 10,
              }}
            >
              ③ APERÇU DANS LE DEVIS
            </p>

            {/* Preview card */}
            <div
              className="flex items-center"
              style={{
                backgroundColor: '#EFE3C6',
                borderRadius: 8,
                padding: '14px 18px',
                minHeight: 70,
                gap: 16,
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 15,
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: '#1C1611',
                    lineHeight: 1.2,
                  }}
                >
                  {selectedServices.length > 0
                    ? `Pack sur mesure · ${selectedServices.length} services`
                    : 'Pack sur mesure'}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    color: '#6B5A3D',
                    marginTop: 2,
                  }}
                >
                  {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} inclus &middot; Facturation annuelle
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    fontStyle: 'italic',
                    color: '#9B8550',
                    marginTop: 2,
                  }}
                >
                  {selectedServices.map((s) => s.name.fr).join(', ') || '—'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    color: '#6B5A3D',
                    marginBottom: 2,
                  }}
                >
                  x 12 mois
                </p>
                <p
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 20,
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: '#1C1611',
                    lineHeight: 1,
                  }}
                >
                  {formatEuro(effectiveAnnual)}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    color: '#9B8550',
                    marginTop: 2,
                  }}
                >
                  HT / an
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 20, paddingBottom: 30 }}>
            {/* Gold rule */}
            <div style={{ height: 1, backgroundColor: '#B8922F', opacity: 0.4, marginBottom: 20 }} />

            <div className="flex items-center justify-end gap-4">
              {/* Cancel button */}
              <button
                type="button"
                onClick={onClose}
                className="relative transition-opacity hover:opacity-90"
                style={{
                  width: 160,
                  height: 56,
                  backgroundColor: '#F8EFDC',
                  borderRadius: 12,
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#1C1611',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 0 #1C1611',
                }}
              >
                取消
              </button>

              {/* Add button */}
              <button
                type="button"
                onClick={addPackage}
                disabled={selectedServices.length === 0}
                className="relative transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  width: 196,
                  height: 56,
                  backgroundColor: '#1C1611',
                  borderRadius: 12,
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#F8EFDC',
                  cursor: selectedServices.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(28, 22, 17, 0.3)',
                }}
              >
                添加到 devis →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
