import { describe, it, expect } from 'vitest'
import { applyTax, isFrance, FRANCE_TVA_RATE } from './tax'
import type { Country } from './types'

describe('tax', () => {
  it('FRANCE_TVA_RATE is 0.20', () => {
    expect(FRANCE_TVA_RATE).toBe(0.20)
  })

  it('FR → showBreakdown=true, tva=20% of totalHT', () => {
    const r = applyTax(1000, 'FR')
    expect(r.showBreakdown).toBe(true)
    expect(r.tva).toBe(200)
    expect(r.total).toBe(1200)
  })

  it('FR → rounding edge case 0.005', () => {
    // 33.33 × 0.20 = 6.666 → should round to 6.67
    const r = applyTax(33.33, 'FR')
    expect(r.tva).toBe(6.67)
    expect(r.total).toBe(40.00)
  })

  it('FR → zero amount', () => {
    const r = applyTax(0, 'FR')
    expect(r.tva).toBe(0)
    expect(r.total).toBe(0)
    expect(r.showBreakdown).toBe(true) // still France
  })

  const nonFrCountries: Country[] = ['IT', 'ES', 'DE', 'BE', 'CH', 'LU', 'OTHER']
  for (const country of nonFrCountries) {
    it(`${country} → showBreakdown=false, tva=0, total=totalHT`, () => {
      const r = applyTax(1000, country)
      expect(r.showBreakdown).toBe(false)
      expect(r.tva).toBe(0)
      expect(r.total).toBe(1000)
    })
  }
})

describe('isFrance', () => {
  it('FR → true', () => expect(isFrance('FR')).toBe(true))
  it('IT → false', () => expect(isFrance('IT')).toBe(false))
  it('OTHER → false', () => expect(isFrance('OTHER')).toBe(false))
})
