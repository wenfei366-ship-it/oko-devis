import { describe, expect, it } from 'vitest'
import type { Customer, Devis, DevisItem, Discount, I18nString, LineItem, PackageLine } from './types'
import { buildViewModel } from './viewModel'
import { computeTotals } from './calculations'

const i18n = (s: string): I18nString => ({ fr: s, it: s, es: s, de: s, zh: s })

function mkCustomer(country: Customer['country'] = 'FR'): Customer {
  return {
    name: 'Restaurant Koi',
    address: '12 rue Test',
    postalCode: '75001',
    city: 'Paris',
    country,
    contactName: 'Martin',
    email: 'test@example.com',
    phone: '+33 1 00 00 00 00',
  }
}

function mkLine(overrides: Partial<LineItem> = {}): LineItem {
  return {
    kind: 'line',
    id: 'line-1',
    serviceId: 'reservation',
    nameSnapshot: i18n('Reservation'),
    descSnapshot: i18n('Reservation en ligne'),
    qty: 12,
    unit: 'mois',
    unitPrice: 50,
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    recurringEligible: true,
    ...overrides,
  }
}

function mkPackage(overrides: Partial<PackageLine> = {}): PackageLine {
  return {
    kind: 'package',
    id: 'package-1',
    nameSnapshot: i18n('Pack sur mesure'),
    childServiceIds: ['website', 'reservation'],
    childNamesSnapshot: [i18n('Site web'), i18n('Reservation')],
    childDescsSnapshot: [i18n('Site vitrine'), i18n('Reservation en ligne')],
    monthlyPrice: 100,
    annualPrice: 1000,
    baselineMonthly: 300,
    baselineAnnual: 3600,
    preferredMode: 'monthly',
    recurringEligible: true,
    ...overrides,
  }
}

function mkDevis(
  items: DevisItem[],
  discount: Discount = { kind: 'none' },
  country: Customer['country'] = 'FR',
): Devis {
  return {
    id: 'devis-1',
    meta: {
      number: 'DRAFT-2026-001-TEST',
      date: '2026-04-11',
      validityDays: 30,
      objet: i18n('Devis pour services digitaux'),
      startDate: '',
    },
    customer: mkCustomer(country),
    items,
    discount,
    notes: '',
    lang: 'fr',
    createdAt: '2026-04-11T00:00:00.000Z',
    updatedAt: '2026-04-11T00:00:00.000Z',
  }
}

describe('buildViewModel dual cards', () => {
  it('shows monthly and annual choices for recurring services without a discount', () => {
    const devis = mkDevis([mkLine()])
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.dualCards).not.toBeNull()
    expect(vm.dualCards?.monthly.final).toBe(50)
    expect(vm.dualCards?.annual.final).toBe(600)
    expect(vm.dualCards?.monthly.economy).toBe(0)
    expect(vm.dualCards?.annual.economy).toBe(0)
  })

  it('does not show dual cards for one-off services only', () => {
    const devis = mkDevis([
      mkLine({
        billingCadence: 'oneOff',
        recurringEligible: false,
        qty: 1,
        unit: 'unique',
        unitPrice: 120,
      }),
    ])
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.dualCards).toBeNull()
  })

  it('uses package monthly and annual prices separately even when preferred mode is monthly', () => {
    const devis = mkDevis([mkPackage()])
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.dualCards?.monthly.baseline).toBe(300)
    expect(vm.dualCards?.monthly.final).toBe(100)
    expect(vm.dualCards?.monthly.economy).toBe(200)
    expect(vm.dualCards?.annual.baseline).toBe(3600)
    expect(vm.dualCards?.annual.final).toBe(1000)
    expect(vm.dualCards?.annual.economy).toBe(2600)
  })
})

describe('buildViewModel tax labels', () => {
  it('uses HT labels for French customers', () => {
    const devis = mkDevis([mkLine()], { kind: 'none' }, 'FR')
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.labels.unitPrice).toBe('PU HT')
    expect(vm.labels.lineTotal).toBe('TOTAL HT')
    expect(vm.labels.subtotal).toBe('Sous-total HT')
    expect(vm.labels.totalHT).toBe('TOTAL HT')
  })

  it('removes HT labels for non-French customers even when the document language is French', () => {
    const devis = mkDevis([mkLine()], { kind: 'none' }, 'IT')
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.labels.unitPrice).toBe('PU')
    expect(vm.labels.lineTotal).toBe('TOTAL')
    expect(vm.labels.subtotal).toBe('Sous-total')
    expect(vm.labels.totalHT).toBe('TOTAL')
    expect(vm.totals.tva).toBe(0)
  })
})

describe('buildViewModel localized document title', () => {
  it('keeps DEVIS for French documents', () => {
    const devis = mkDevis([mkLine()])
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.labels.devisTitle).toBe('DEVIS')
  })

  it('translates the document title for non-French document languages', () => {
    const devis = mkDevis([mkLine()])
    devis.lang = 'it'
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.labels.devisTitle).toBe('PREVENTIVO')
  })

  it('uses a manual title override when provided', () => {
    const devis = mkDevis([mkLine()])
    devis.lang = 'it'
    devis.meta.title = i18n('报价单')
    const vm = buildViewModel(devis, computeTotals(devis))

    expect(vm.labels.devisTitle).toBe('报价单')
  })
})
