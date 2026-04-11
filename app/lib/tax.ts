// OKO Devis Generator — tax logic
// HT/TVA only for France; all other countries show flat total.

import type { Country } from './types'

export const FRANCE_TVA_RATE = 0.20

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function applyTax(
  totalHT: number,
  country: Country
): { tva: number; total: number; showBreakdown: boolean } {
  if (country === 'FR') {
    const tva = round2(totalHT * FRANCE_TVA_RATE)
    return { tva, total: round2(totalHT + tva), showBreakdown: true }
  }
  return { tva: 0, total: totalHT, showBreakdown: false }
}

export function isFrance(country: Country): boolean {
  return country === 'FR'
}
