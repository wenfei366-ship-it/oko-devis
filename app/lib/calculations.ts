import type { Devis, Discount, DevisTotals, LineItem } from './types'

export function lineTotal(item: LineItem): number {
  return roundEuro(item.qty * item.unitPrice)
}

export function subtotalHT(items: LineItem[]): number {
  return roundEuro(items.reduce((acc, i) => acc + lineTotal(i), 0))
}

export function recurringSubtotal(items: LineItem[]): number {
  return roundEuro(
    items
      .filter((i) => i.recurringEligible)
      .reduce((acc, i) => acc + lineTotal(i), 0)
  )
}

export function discountAmount(items: LineItem[], discount: Discount): number {
  if (discount.kind === 'none') return 0

  const base = discountBase(items, discount)

  switch (discount.kind) {
    case 'percent':
      return roundEuro(base * (discount.value / 100))
    case 'fixed':
      // Cannot discount more than the base
      return roundEuro(Math.min(discount.value, base))
    case 'free-months':
      return roundEuro(base * (discount.freeCount / discount.basis))
  }
}

function discountBase(items: LineItem[], discount: Discount): number {
  if (discount.kind === 'none') return 0
  if (discount.kind === 'free-months') return recurringSubtotal(items)

  const scope = discount.scope
  if (scope === 'all') return subtotalHT(items)
  if (scope === 'recurring') return recurringSubtotal(items)
  if (scope === 'selectedIds') {
    const ids = new Set(discount.targetIds ?? [])
    return roundEuro(
      items.filter((i) => ids.has(i.id)).reduce((acc, i) => acc + lineTotal(i), 0)
    )
  }
  return 0
}

export function computeTotals(devis: Pick<Devis, 'items' | 'discount' | 'taxRate'>): DevisTotals {
  const sub = subtotalHT(devis.items)
  const rec = recurringSubtotal(devis.items)
  const disc = discountAmount(devis.items, devis.discount)
  const totHT = roundEuro(sub - disc)
  const tva = roundEuro(totHT * devis.taxRate)
  const totTTC = roundEuro(totHT + tva)
  return {
    subtotalHT: sub,
    recurringSubtotal: rec,
    discountAmount: disc,
    totalHT: totHT,
    tva,
    totalTTC: totTTC,
  }
}

// Round to 2 decimal places (cents), avoiding float drift
export function roundEuro(n: number): number {
  return Math.round(n * 100) / 100
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatEuroShort(n: number): string {
  // "500 € HT" style for subtotals
  const rounded = roundEuro(n)
  const hasDecimals = rounded % 1 !== 0
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded) + ' €'
}
