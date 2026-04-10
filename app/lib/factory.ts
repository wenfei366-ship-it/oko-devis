import type { Devis, LineItem, Service, Customer } from './types'
import { getDefaultQtyLabel } from './catalog'
import { generateDraftNumber } from './storage'

export function createEmptyCustomer(): Customer {
  return {
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    contactName: '',
    email: '',
    phone: '',
  }
}

export function createEmptyDevis(): Devis {
  const now = new Date().toISOString()
  return {
    id: cryptoRandomId(),
    meta: {
      number: generateDraftNumber(),
      date: now,
      validityDays: 30,
      objet: 'Devis pour services digitaux adaptés',
      startDate: '',
    },
    customer: createEmptyCustomer(),
    items: [],
    discount: { kind: 'none' },
    notes: '',
    taxRate: 0.2,
    createdAt: now,
    updatedAt: now,
  }
}

export function serviceToLineItem(service: Service): LineItem {
  return {
    id: cryptoRandomId(),
    serviceId: service.id,
    designation: service.nameFr,
    description: service.description,
    qty: service.defaultQty,
    unit: service.unit,
    qtyLabel: getDefaultQtyLabel(service),
    unitPrice: service.defaultPrice,
    billingCadence: service.billingCadence,
    pdfSection: service.pdfSection,
    recurringEligible: service.recurringEligible,
  }
}

export function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
