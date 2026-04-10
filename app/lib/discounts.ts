import type { Discount } from './types'

// Preset discounts — real OKO pricing patterns from sample devis
export const DISCOUNT_PRESETS: { id: string; discount: Discount }[] = [
  {
    id: 'none',
    discount: { kind: 'none' },
  },
  {
    id: 'free-months-2',
    discount: {
      kind: 'free-months',
      freeCount: 2,
      basis: 12,
      label: 'Payez 10 mois, profitez de 12',
      scope: 'recurring',
    },
  },
  {
    id: 'percent-30-recurring',
    discount: {
      kind: 'percent',
      value: 30,
      label: 'Grand pack −30 % (abonnements)',
      scope: 'recurring',
    },
  },
  {
    id: 'percent-40-recurring',
    discount: {
      kind: 'percent',
      value: 40,
      label: 'Grand pack premium −40 % (abonnements)',
      scope: 'recurring',
    },
  },
  {
    id: 'fixed-700',
    discount: {
      kind: 'fixed',
      value: 700,
      label: 'Remise personnalisée −700 €',
      scope: 'all',
    },
  },
]

export function describeDiscount(d: Discount): string {
  switch (d.kind) {
    case 'none':
      return 'Aucune remise'
    case 'percent':
      return `${d.label} (−${d.value} %)`
    case 'fixed':
      return `${d.label} (−${d.value} €)`
    case 'free-months':
      return `${d.label} (${d.freeCount} mois offerts sur ${d.basis})`
  }
}
