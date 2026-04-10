// Data model for OKO Devis Generator
// See plan: /Users/zhangxiaonan/.claude/plans/scalable-tinkering-tome.md

export type BillingCadence = 'monthly' | 'annual' | 'oneOff' | 'perUnit'
export type PdfSection = 'forfait' | 'complement' | 'hardware'
export type ServiceCategory = 'core' | 'marketing' | 'content' | 'fees' | 'hardware'
export type ServiceUnit = 'mois' | 'an' | 'photo' | 'unique' | 'unit'

export interface Service {
  id: string
  category: ServiceCategory
  billingCadence: BillingCadence
  pdfSection: PdfSection
  nameFr: string
  nameCn: string
  description: string
  defaultPrice: number // HT en euros
  unit: ServiceUnit
  defaultQty: number
  recurringEligible: boolean
}

export interface LineItem {
  id: string
  serviceId: string
  designation: string
  description: string
  qty: number
  unit: ServiceUnit
  qtyLabel: string // display: "12 mois" / "À la carte" / "1 unique"
  unitPrice: number // HT
  billingCadence: BillingCadence
  pdfSection: PdfSection
  recurringEligible: boolean
}

export type DiscountScope = 'all' | 'recurring' | 'selectedIds'

export type Discount =
  | { kind: 'none' }
  | {
      kind: 'percent'
      value: number // 0-100
      label: string
      scope: DiscountScope
      targetIds?: string[]
    }
  | {
      kind: 'fixed'
      value: number // euros
      label: string
      scope: DiscountScope
      targetIds?: string[]
    }
  | {
      kind: 'free-months'
      freeCount: number // e.g. 2
      basis: number // e.g. 12
      label: string
      scope: 'recurring'
    }

export interface Customer {
  name: string
  legalForm?: string
  siren?: string
  address: string
  city: string
  postalCode: string
  country: string
  contactName: string
  email: string
  phone: string
  tva?: string
}

export interface DevisMeta {
  number: string
  date: string // ISO
  validityDays: number
  objet: string
  startDate: string // ISO or empty ""
}

export interface Devis {
  id: string
  meta: DevisMeta
  customer: Customer
  items: LineItem[]
  discount: Discount
  notes: string
  taxRate: number // 0.20 default
  createdAt: string
  updatedAt: string
}

// Derived totals (computed on-the-fly, never stored on the model)
export interface DevisTotals {
  subtotalHT: number
  recurringSubtotal: number
  discountAmount: number
  totalHT: number
  tva: number
  totalTTC: number
}
