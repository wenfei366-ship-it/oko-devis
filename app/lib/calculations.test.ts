import { describe, it, expect } from 'vitest'
import type { LineItem, Discount } from './types'
import {
  lineTotal,
  subtotalHT,
  recurringSubtotal,
  discountAmount,
  computeTotals,
  roundEuro,
} from './calculations'

// Factory for test line items
const mkItem = (partial: Partial<LineItem> = {}): LineItem => ({
  id: partial.id ?? Math.random().toString(36).slice(2, 8),
  serviceId: partial.serviceId ?? 'website',
  designation: partial.designation ?? 'Test Item',
  description: partial.description ?? '',
  qty: partial.qty ?? 12,
  unit: partial.unit ?? 'mois',
  qtyLabel: partial.qtyLabel ?? '12 mois',
  unitPrice: partial.unitPrice ?? 30,
  billingCadence: partial.billingCadence ?? 'monthly',
  pdfSection: partial.pdfSection ?? 'forfait',
  recurringEligible: partial.recurringEligible ?? true,
})

describe('lineTotal', () => {
  it('multiplies qty × unitPrice', () => {
    expect(lineTotal(mkItem({ qty: 12, unitPrice: 30 }))).toBe(360)
    expect(lineTotal(mkItem({ qty: 3, unitPrice: 50 }))).toBe(150)
  })

  it('handles zero correctly', () => {
    expect(lineTotal(mkItem({ qty: 0, unitPrice: 30 }))).toBe(0)
    expect(lineTotal(mkItem({ qty: 12, unitPrice: 0 }))).toBe(0)
  })

  it('rounds to 2 decimals', () => {
    expect(lineTotal(mkItem({ qty: 3, unitPrice: 33.333 }))).toBe(100)
  })
})

describe('subtotalHT', () => {
  it('sums empty items to 0', () => {
    expect(subtotalHT([])).toBe(0)
  })

  it('sums multiple items', () => {
    const items = [
      mkItem({ qty: 12, unitPrice: 30 }), // 360
      mkItem({ qty: 12, unitPrice: 50 }), // 600
      mkItem({ qty: 1, unitPrice: 240, recurringEligible: false }), // 240
    ]
    expect(subtotalHT(items)).toBe(1200)
  })
})

describe('recurringSubtotal', () => {
  it('includes only recurringEligible items', () => {
    const items = [
      mkItem({ qty: 12, unitPrice: 30, recurringEligible: true }), // 360
      mkItem({ qty: 12, unitPrice: 50, recurringEligible: true }), // 600
      mkItem({ qty: 1, unitPrice: 240, recurringEligible: false }), // 240 — excluded
    ]
    expect(recurringSubtotal(items)).toBe(960)
  })

  it('returns 0 when nothing recurring', () => {
    const items = [mkItem({ qty: 1, unitPrice: 100, recurringEligible: false })]
    expect(recurringSubtotal(items)).toBe(0)
  })
})

describe('discountAmount', () => {
  const recurringItems = [
    mkItem({ id: 'a', qty: 12, unitPrice: 50, recurringEligible: true }), // 600
    mkItem({ id: 'b', qty: 12, unitPrice: 50, recurringEligible: true }), // 600
  ]
  const mixedItems = [
    ...recurringItems,
    mkItem({ id: 'c', qty: 1, unitPrice: 240, recurringEligible: false }), // 240
  ]

  it('kind=none returns 0', () => {
    expect(discountAmount(mixedItems, { kind: 'none' })).toBe(0)
  })

  it('percent scope=all applies to subtotalHT', () => {
    const d: Discount = { kind: 'percent', value: 10, label: 't', scope: 'all' }
    expect(discountAmount(mixedItems, d)).toBe(144) // 1440 * 0.10
  })

  it('percent scope=recurring only applies to recurring items', () => {
    const d: Discount = { kind: 'percent', value: 10, label: 't', scope: 'recurring' }
    expect(discountAmount(mixedItems, d)).toBe(120) // 1200 * 0.10, hardware untouched
  })

  it('percent scope=selectedIds only applies to selected line items', () => {
    const d: Discount = {
      kind: 'percent',
      value: 50,
      label: 't',
      scope: 'selectedIds',
      targetIds: ['a'],
    }
    expect(discountAmount(mixedItems, d)).toBe(300) // 600 * 0.50
  })

  it('fixed scope=recurring applies and caps at base', () => {
    const d: Discount = { kind: 'fixed', value: 700, label: 't', scope: 'recurring' }
    expect(discountAmount(mixedItems, d)).toBe(700) // 1200 >= 700
  })

  it('fixed value caps at the base', () => {
    const d: Discount = { kind: 'fixed', value: 9999, label: 't', scope: 'all' }
    expect(discountAmount(mixedItems, d)).toBe(1440)
  })

  it('free-months correctly computes 2/12 of recurring', () => {
    const d: Discount = {
      kind: 'free-months',
      freeCount: 2,
      basis: 12,
      label: 'Pay 10 get 12',
      scope: 'recurring',
    }
    // recurring sum = 1200, 2/12 = 0.1666..., 1200 * 2/12 = 200
    expect(discountAmount(mixedItems, d)).toBe(200)
  })

  it('free-months does NOT touch hardware', () => {
    const d: Discount = {
      kind: 'free-months',
      freeCount: 2,
      basis: 12,
      label: 'Pay 10 get 12',
      scope: 'recurring',
    }
    const hardwareOnly = [
      mkItem({ id: 'h', qty: 1, unitPrice: 240, recurringEligible: false }),
    ]
    expect(discountAmount(hardwareOnly, d)).toBe(0)
  })
})

describe('computeTotals', () => {
  it('calculates Koï sample scenario', () => {
    // 2 services × 50€ × 12 mois = 1200€, remise fixe 700 => 500€ HT, TVA 20% => 100€, TTC 600€
    const items = [
      mkItem({ qty: 12, unitPrice: 50, recurringEligible: true }),
      mkItem({ qty: 12, unitPrice: 50, recurringEligible: true }),
    ]
    const totals = computeTotals({
      items,
      discount: { kind: 'fixed', value: 700, label: 'Remise Koï', scope: 'recurring' },
      taxRate: 0.2,
    })
    expect(totals.subtotalHT).toBe(1200)
    expect(totals.recurringSubtotal).toBe(1200)
    expect(totals.discountAmount).toBe(700)
    expect(totals.totalHT).toBe(500)
    expect(totals.tva).toBe(100)
    expect(totals.totalTTC).toBe(600)
  })

  it('handles empty items', () => {
    const totals = computeTotals({
      items: [],
      discount: { kind: 'none' },
      taxRate: 0.2,
    })
    expect(totals).toEqual({
      subtotalHT: 0,
      recurringSubtotal: 0,
      discountAmount: 0,
      totalHT: 0,
      tva: 0,
      totalTTC: 0,
    })
  })

  it('hardware is not touched by free-months discount', () => {
    const items = [
      mkItem({ id: 'sub', qty: 12, unitPrice: 30, recurringEligible: true }), // 360
      mkItem({ id: 'hw', qty: 1, unitPrice: 240, recurringEligible: false }), // 240 hardware
    ]
    const totals = computeTotals({
      items,
      discount: {
        kind: 'free-months',
        freeCount: 2,
        basis: 12,
        label: 'Pay 10 get 12',
        scope: 'recurring',
      },
      taxRate: 0.2,
    })
    expect(totals.subtotalHT).toBe(600)
    expect(totals.discountAmount).toBe(60) // 360 * 2/12
    expect(totals.totalHT).toBe(540) // 600 - 60
    expect(totals.tva).toBe(108)
    expect(totals.totalTTC).toBe(648)
  })
})

describe('roundEuro', () => {
  it('rounds to 2 decimals', () => {
    expect(roundEuro(1.234)).toBe(1.23)
    expect(roundEuro(1.235)).toBe(1.24)
    expect(roundEuro(1.2)).toBe(1.2)
  })
})
