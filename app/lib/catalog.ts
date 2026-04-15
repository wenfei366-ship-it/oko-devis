// OKO Devis Generator — service catalog
// Prices are in EUR HT. Services reference i18n entries for name + description.

import type { Service } from './types'
import { SERVICE_DICT, type ServiceKey } from './i18n'

function build(
  id: ServiceKey,
  overrides: Omit<Service, 'id' | 'name' | 'description'>
): Service {
  return {
    id,
    name: SERVICE_DICT[id].name,
    description: SERVICE_DICT[id].description,
    ...overrides,
  }
}

export const CATALOG: Service[] = [
  build('website', {
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    defaultPrice: 30,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  }),
  build('reservation', {
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  }),
  build('online-ordering', {
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  }),
  build('in-store-ordering', {
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  }),
  build('wheel-game', {
    category: 'marketing',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  }),
  build('ai-google', {
    category: 'marketing',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  }),
  build('e-reputation', {
    category: 'marketing',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  }),
  build('ai-photo', {
    category: 'content',
    billingCadence: 'perUnit',
    pdfSection: 'complement',
    defaultPrice: 5,
    unit: 'photo',
    defaultQty: 10,
    recurringEligible: false,
  }),
  build('social-media-campaign', {
    category: 'marketing',
    billingCadence: 'oneOff',
    pdfSection: 'complement',
    defaultPrice: 300,
    unit: 'mois',
    defaultQty: 1,
    recurringEligible: false,
  }),
  build('domain-fee', {
    category: 'fees',
    billingCadence: 'annual',
    pdfSection: 'fees',
    defaultPrice: 20,
    unit: 'an',
    defaultQty: 1,
    recurringEligible: true,
  }),
  build('sunmi-terminal', {
    category: 'hardware',
    billingCadence: 'oneOff',
    pdfSection: 'hardware',
    defaultPrice: 240,
    unit: 'unique',
    defaultQty: 1,
    recurringEligible: false,
  }),
  build('printer-wifi', {
    category: 'hardware',
    billingCadence: 'oneOff',
    pdfSection: 'hardware',
    defaultPrice: 120,
    unit: 'unique',
    defaultQty: 1,
    recurringEligible: false,
  }),
  build('website-setup', {
    category: 'fees',
    billingCadence: 'oneOff',
    pdfSection: 'fees',
    defaultPrice: 100,
    unit: 'unique',
    defaultQty: 1,
    recurringEligible: false,
  }),
]

export function getServiceById(id: string): Service | undefined {
  return CATALOG.find((s) => s.id === id)
}
