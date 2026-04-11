// OKO Devis Generator — pure calculation functions
// All amounts in EUR HT. Tax applied separately via tax.ts.

import type {
  Devis,
  DevisItem,
  DevisTotals,
  LineItem,
  PackageLine,
  Discount,
} from './types'
import { applyTax, isFrance } from './tax'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ---------- Line amount ----------

export function lineAmount(item: DevisItem): number {
  if (item.kind === 'package') {
    return item.preferredMode === 'monthly'
      ? round2(item.monthlyPrice * 12)
      : round2(item.annualPrice)
  }
  return round2(item.qty * item.unitPrice)
}

// ---------- Subtotals ----------

export function subtotalHT(items: DevisItem[]): number {
  return round2(items.reduce((sum, item) => sum + lineAmount(item), 0))
}

export function recurringItems(items: DevisItem[]): DevisItem[] {
  return items.filter((i) =>
    i.kind === 'package' ? true : i.recurringEligible
  )
}

export function oneOffItems(items: DevisItem[]): DevisItem[] {
  return items.filter((i) =>
    i.kind === 'package' ? false : !i.recurringEligible
  )
}

export function recurringSubtotal(items: DevisItem[]): number {
  return round2(recurringItems(items).reduce((s, i) => s + lineAmount(i), 0))
}

export function oneOffSubtotal(items: DevisItem[]): number {
  return round2(oneOffItems(items).reduce((s, i) => s + lineAmount(i), 0))
}

/** Monthly baseline for recurring items (sum of monthly service prices, or package monthly) */
export function recurringMonthlyBaseline(items: DevisItem[]): number {
  return round2(
    recurringItems(items).reduce((s, i) => {
      if (i.kind === 'package') return s + i.baselineMonthly
      // monthly services: unitPrice IS the monthly price
      return s + i.unitPrice
    }, 0)
  )
}

/** Annual baseline = monthly baseline × 12 */
export function recurringAnnualBaseline(items: DevisItem[]): number {
  return round2(recurringMonthlyBaseline(items) * 12)
}

// ---------- Discount ----------

export function discountBase(items: DevisItem[], discount: Discount): number {
  if (discount.kind === 'none') return 0

  switch (discount.scope) {
    case 'all':
      return subtotalHT(items)
    case 'recurring':
      return recurringSubtotal(items)
    case 'selectedIds': {
      const ids = new Set(discount.targetIds ?? [])
      return round2(
        items
          .filter((i) => ids.has(i.id))
          .reduce((s, i) => s + lineAmount(i), 0)
      )
    }
  }
}

export function discountAmount(items: DevisItem[], discount: Discount): number {
  if (discount.kind === 'none') return 0

  const base = discountBase(items, discount)

  switch (discount.kind) {
    case 'percent': {
      const clampedPct = Math.min(Math.max(discount.value, 0), 100)
      return Math.min(round2(base * (clampedPct / 100)), base)
    }
    case 'fixed':
      return Math.min(round2(discount.value), base) // never discount more than base
  }
}

// ---------- Main orchestrator ----------

export function computeTotals(devis: Devis): DevisTotals {
  const { items, discount, customer } = devis

  const sub = subtotalHT(items)
  const disc = discountAmount(items, discount)
  const totalHT = round2(sub - disc)

  const france = isFrance(customer.country)
  const { tva, total } = applyTax(totalHT, customer.country)

  // Per-cadence breakdown for dual MENSUEL/ANNUEL card
  const recMonthlyBase = recurringMonthlyBaseline(items)
  const recAnnualBase = recurringAnnualBaseline(items)

  // If discount applies to recurring items, compute final recurring values
  let recMonthlyFinal = recMonthlyBase
  let recAnnualFinal = recAnnualBase
  if (discount.kind !== 'none') {
    const shouldAffectRecurring =
      discount.scope === 'all' ||
      discount.scope === 'recurring' ||
      // selectedIds scope: check if any selected id belongs to a recurring item
      (discount.scope === 'selectedIds' &&
        (discount.targetIds ?? []).some((tid) =>
          recurringItems(items).some((ri) => ri.id === tid)
        ))

    if (shouldAffectRecurring) {
      const recItems = recurringItems(items)
      const recBase = recurringSubtotal(items)
      const recDisc = discountAmount(recItems, discount)
      const recFinal = round2(recBase - recDisc)
      recAnnualFinal = recFinal
      recMonthlyFinal = round2(recFinal / 12)
    }
  }

  return {
    subtotal: sub,
    discountAmount: disc,
    totalHT,
    tva,
    total,
    isFrance: france,
    recurringMonthlyBaseline: recMonthlyBase,
    recurringMonthlyFinal: recMonthlyFinal,
    recurringAnnualBaseline: recAnnualBase,
    recurringAnnualFinal: recAnnualFinal,
    oneOffTotal: oneOffSubtotal(items),
  }
}

/** Format EUR with fr-FR locale: "1 234,56 €" */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
