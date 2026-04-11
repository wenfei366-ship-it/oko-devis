import { describe, it, expect } from 'vitest'
import type { Devis, DevisItem, LineItem, PackageLine, Discount, Customer } from './types'
import {
  lineAmount,
  subtotalHT,
  recurringSubtotal,
  oneOffSubtotal,
  recurringMonthlyBaseline,
  recurringAnnualBaseline,
  discountAmount,
  computeTotals,
  formatEuro,
} from './calculations'
import { uuid } from './numbering'

const i18n = (s: string) => ({ fr: s, it: s, es: s, de: s, zh: s })

function mkLine(overrides: Partial<LineItem> = {}): LineItem {
  return {
    kind: 'line',
    id: uuid(),
    serviceId: 'website',
    nameSnapshot: i18n('Site web'),
    descSnapshot: i18n('desc'),
    qty: 12,
    unit: 'mois',
    unitPrice: 30,
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    recurringEligible: true,
    ...overrides,
  }
}

function mkPackage(overrides: Partial<PackageLine> = {}): PackageLine {
  return {
    kind: 'package',
    id: uuid(),
    nameSnapshot: i18n('Pack'),
    childServiceIds: ['website', 'reservation'],
    childNamesSnapshot: [i18n('Site web'), i18n('Réservation')],
    childDescsSnapshot: [i18n('desc1'), i18n('desc2')],
    monthlyPrice: 100,
    annualPrice: 1000,
    baselineMonthly: 80,
    baselineAnnual: 960,
    preferredMode: 'annual',
    recurringEligible: true,
    ...overrides,
  }
}

function mkCustomer(country: Customer['country'] = 'FR'): Customer {
  return {
    name: 'Test',
    address: '1 rue Test',
    postalCode: '75001',
    city: 'Paris',
    country,
    contactName: 'Test',
    email: 'test@test.fr',
    phone: '+33 1 00 00 00 00',
  }
}

function mkDevis(
  items: DevisItem[],
  discount: Discount = { kind: 'none' },
  country: Customer['country'] = 'FR'
): Devis {
  return {
    id: uuid(),
    meta: { number: 'DRAFT-2026-001-AAAA', date: '2026-01-01', validityDays: 30, objet: i18n('Test'), startDate: '' },
    customer: mkCustomer(country),
    items,
    discount,
    notes: '',
    lang: 'fr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ---------- lineAmount ----------

describe('lineAmount', () => {
  it('LineItem: qty × unitPrice', () => {
    expect(lineAmount(mkLine())).toBe(360)
  })

  it('LineItem: oneOff qty=1, price=120', () => {
    expect(lineAmount(mkLine({ qty: 1, unitPrice: 120, billingCadence: 'oneOff', recurringEligible: false }))).toBe(120)
  })

  it('LineItem: perUnit qty=10, price=5', () => {
    expect(lineAmount(mkLine({ qty: 10, unitPrice: 5, billingCadence: 'perUnit', recurringEligible: false }))).toBe(50)
  })

  it('LineItem: qty=0 → 0', () => {
    expect(lineAmount(mkLine({ qty: 0 }))).toBe(0)
  })

  it('LineItem: price=0 → 0', () => {
    expect(lineAmount(mkLine({ unitPrice: 0 }))).toBe(0)
  })

  it('PackageLine preferredMode=annual → annualPrice', () => {
    expect(lineAmount(mkPackage({ preferredMode: 'annual', annualPrice: 1000 }))).toBe(1000)
  })

  it('PackageLine preferredMode=monthly → monthlyPrice × 12', () => {
    expect(lineAmount(mkPackage({ preferredMode: 'monthly', monthlyPrice: 100 }))).toBe(1200)
  })
})

// ---------- subtotals ----------

describe('subtotals', () => {
  it('empty items → 0', () => {
    expect(subtotalHT([])).toBe(0)
    expect(recurringSubtotal([])).toBe(0)
    expect(oneOffSubtotal([])).toBe(0)
  })

  it('mixed items: 2 recurring + 1 oneOff', () => {
    const items: DevisItem[] = [
      mkLine({ unitPrice: 30, qty: 12 }),       // 360, recurring
      mkLine({ unitPrice: 50, qty: 12 }),       // 600, recurring
      mkLine({ unitPrice: 120, qty: 1, recurringEligible: false, billingCadence: 'oneOff' }), // 120, oneOff
    ]
    expect(subtotalHT(items)).toBe(1080)
    expect(recurringSubtotal(items)).toBe(960)
    expect(oneOffSubtotal(items)).toBe(120)
  })

  it('package counts as recurring', () => {
    const items: DevisItem[] = [
      mkPackage({ annualPrice: 1000, preferredMode: 'annual' }),
      mkLine({ unitPrice: 100, qty: 1, recurringEligible: false, billingCadence: 'oneOff' }),
    ]
    expect(recurringSubtotal(items)).toBe(1000)
    expect(oneOffSubtotal(items)).toBe(100)
  })
})

// ---------- recurring baselines ----------

describe('recurring baselines', () => {
  it('monthly baseline from line items', () => {
    const items: DevisItem[] = [
      mkLine({ unitPrice: 30 }),  // 30/month
      mkLine({ unitPrice: 50 }),  // 50/month
    ]
    expect(recurringMonthlyBaseline(items)).toBe(80)
    expect(recurringAnnualBaseline(items)).toBe(960)
  })

  it('package uses baselineMonthly', () => {
    const items: DevisItem[] = [
      mkPackage({ baselineMonthly: 200 }),
    ]
    expect(recurringMonthlyBaseline(items)).toBe(200)
    expect(recurringAnnualBaseline(items)).toBe(2400)
  })

  it('excludes oneOff items', () => {
    const items: DevisItem[] = [
      mkLine({ unitPrice: 30 }),
      mkLine({ unitPrice: 120, recurringEligible: false, billingCadence: 'oneOff' }),
    ]
    expect(recurringMonthlyBaseline(items)).toBe(30)
  })
})

// ---------- discounts ----------

describe('discountAmount', () => {
  const items: DevisItem[] = [
    mkLine({ id: 'a', unitPrice: 30, qty: 12 }),   // 360, recurring
    mkLine({ id: 'b', unitPrice: 50, qty: 12 }),   // 600, recurring
    mkLine({ id: 'c', unitPrice: 120, qty: 1, recurringEligible: false, billingCadence: 'oneOff' }), // 120
  ]

  it('none → 0', () => {
    expect(discountAmount(items, { kind: 'none' })).toBe(0)
  })

  it('percent 10% scope all → 108', () => {
    const d: Discount = { kind: 'percent', value: 10, label: i18n('−10%'), scope: 'all' }
    expect(discountAmount(items, d)).toBe(108) // 1080 × 10%
  })

  it('percent 10% scope recurring → 96', () => {
    const d: Discount = { kind: 'percent', value: 10, label: i18n('−10%'), scope: 'recurring' }
    expect(discountAmount(items, d)).toBe(96) // 960 × 10%
  })

  it('percent 10% scope selectedIds → targets only', () => {
    const d: Discount = { kind: 'percent', value: 10, label: i18n('−10%'), scope: 'selectedIds', targetIds: ['a'] }
    expect(discountAmount(items, d)).toBe(36) // 360 × 10%
  })

  it('fixed 200 scope all → 200', () => {
    const d: Discount = { kind: 'fixed', value: 200, label: i18n('−200€'), scope: 'all' }
    expect(discountAmount(items, d)).toBe(200)
  })

  it('fixed larger than base → capped to base', () => {
    const d: Discount = { kind: 'fixed', value: 5000, label: i18n('−5000€'), scope: 'all' }
    expect(discountAmount(items, d)).toBe(1080) // capped
  })

  it('fixed scope recurring → min(value, recurringBase)', () => {
    const d: Discount = { kind: 'fixed', value: 200, label: i18n('−200€'), scope: 'recurring' }
    expect(discountAmount(items, d)).toBe(200)
  })
})

// ---------- computeTotals ----------

describe('computeTotals', () => {
  it('France: shows TVA 20%', () => {
    const devis = mkDevis([mkLine({ unitPrice: 100, qty: 1 })], { kind: 'none' }, 'FR')
    const t = computeTotals(devis)
    expect(t.isFrance).toBe(true)
    expect(t.subtotal).toBe(100)
    expect(t.totalHT).toBe(100)
    expect(t.tva).toBe(20)
    expect(t.total).toBe(120)
  })

  it('Italy: no TVA', () => {
    const devis = mkDevis([mkLine({ unitPrice: 100, qty: 1 })], { kind: 'none' }, 'IT')
    const t = computeTotals(devis)
    expect(t.isFrance).toBe(false)
    expect(t.tva).toBe(0)
    expect(t.total).toBe(100)
  })

  it('Germany: no TVA', () => {
    const devis = mkDevis([mkLine({ unitPrice: 100, qty: 1 })], { kind: 'none' }, 'DE')
    const t = computeTotals(devis)
    expect(t.isFrance).toBe(false)
    expect(t.tva).toBe(0)
  })

  it('empty items → all zeros', () => {
    const t = computeTotals(mkDevis([]))
    expect(t.subtotal).toBe(0)
    expect(t.totalHT).toBe(0)
    expect(t.tva).toBe(0)
    expect(t.total).toBe(0)
    expect(t.oneOffTotal).toBe(0)
  })

  it('with discount: subtotal - discount = totalHT', () => {
    const items = [mkLine({ unitPrice: 50, qty: 12 })] // 600
    const d: Discount = { kind: 'percent', value: 20, label: i18n('−20%'), scope: 'all' }
    const devis = mkDevis(items, d)
    const t = computeTotals(devis)
    expect(t.subtotal).toBe(600)
    expect(t.discountAmount).toBe(120)
    expect(t.totalHT).toBe(480)
    expect(t.tva).toBe(96) // 480 × 0.2
    expect(t.total).toBe(576)
  })

  it('recurringMonthlyFinal reflects discount on recurring', () => {
    const items: DevisItem[] = [
      mkLine({ unitPrice: 30, qty: 12 }),
      mkLine({ unitPrice: 50, qty: 12 }),
    ]
    const d: Discount = { kind: 'percent', value: 50, label: i18n('−50%'), scope: 'recurring' }
    const devis = mkDevis(items, d)
    const t = computeTotals(devis)
    expect(t.recurringMonthlyBaseline).toBe(80)
    expect(t.recurringAnnualBaseline).toBe(960)
    expect(t.recurringAnnualFinal).toBe(480) // 960 - 50%
    expect(t.recurringMonthlyFinal).toBe(40) // 480 / 12
  })

  it('package in totals', () => {
    const items: DevisItem[] = [
      mkPackage({ annualPrice: 1000, monthlyPrice: 100, preferredMode: 'annual', baselineMonthly: 200 }),
    ]
    const devis = mkDevis(items)
    const t = computeTotals(devis)
    expect(t.subtotal).toBe(1000)
    expect(t.recurringMonthlyBaseline).toBe(200)
    expect(t.recurringAnnualBaseline).toBe(2400)
  })
})

// ---------- formatEuro ----------

describe('formatEuro', () => {
  it('formats with comma and euro sign', () => {
    const s = formatEuro(1234.56)
    // fr-FR format: "1 234,56 €" (non-breaking spaces may vary)
    expect(s).toContain('1')
    expect(s).toContain('234')
    expect(s).toContain('56')
    expect(s).toContain('€')
  })

  it('zero → 0,00 €', () => {
    const s = formatEuro(0)
    expect(s).toContain('0')
    expect(s).toContain('€')
  })
})
