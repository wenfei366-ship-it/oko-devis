// OKO Devis Generator — data model v3
// Plan: ~/.claude/plans/oko-devis-v3.md

// ---------- Language & country ----------

export type Lang = 'fr' | 'it' | 'es' | 'de' | 'zh'
export const ALL_LANGS: readonly Lang[] = ['fr', 'it', 'es', 'de', 'zh'] as const

export type Country = 'FR' | 'IT' | 'ES' | 'DE' | 'BE' | 'CH' | 'LU' | 'OTHER'

// I18n dictionary — every human-readable string has 5 translations
export type I18nString = Record<Lang, string>

// ---------- Service catalog ----------

export type BillingCadence = 'monthly' | 'annual' | 'oneOff' | 'perUnit'
export type PdfSection = 'forfait' | 'complement' | 'hardware' | 'fees'
export type ServiceCategory = 'core' | 'marketing' | 'content' | 'fees' | 'hardware'
export type ServiceUnit = 'mois' | 'an' | 'photo' | 'unique' | 'unit'

export interface Service {
  id: string
  category: ServiceCategory
  billingCadence: BillingCadence
  pdfSection: PdfSection
  /** i18n name — `name[lang]` returns the display name */
  name: I18nString
  /** i18n short description (one line) */
  description: I18nString
  /** EUR HT — always stored as the native cadence (monthly price for `monthly`,
   * annual price for `annual`, per-unit for `perUnit`, total for `oneOff`) */
  defaultPrice: number
  unit: ServiceUnit
  defaultQty: number
  recurringEligible: boolean
  /** true if user-created via "自定义新服务" and stored in localStorage */
  custom?: boolean
}

// ---------- Line items (discriminated union) ----------

export interface LineItem {
  kind: 'line'
  id: string
  serviceId: string
  /** Snapshot of name/desc at add-time — retroactive service edits don't corrupt
   * historical devis. Populate from the active-language service dictionary. */
  nameSnapshot: I18nString
  descSnapshot: I18nString
  qty: number
  unit: ServiceUnit
  unitPrice: number
  billingCadence: BillingCadence
  pdfSection: PdfSection
  recurringEligible: boolean
}

/**
 * Conversion rule: Service → LineItem (at add-time)
 * - website (monthly 30): qty=12, unit='mois', unitPrice=30 → 360 €/an
 * - reservation (monthly 50): qty=12, unit='mois', unitPrice=50 → 600 €/an
 * - ai-photo (perUnit 5): qty=N, unit='photo', unitPrice=5 → N × 5
 * - printer-wifi (oneOff 120): qty=1, unit='unique', unitPrice=120 → 120
 * - website-setup (oneOff 100): qty=1, unit='unique', unitPrice=100 → 100
 *
 * `lineAmount(item) = item.qty * item.unitPrice` — uniform for all kinds.
 */

export interface PackageLine {
  kind: 'package'
  id: string
  nameSnapshot: I18nString
  childServiceIds: string[]
  childNamesSnapshot: I18nString[]
  childDescsSnapshot: I18nString[]
  /** editable by sales, EUR HT / month */
  monthlyPrice: number
  /** editable by sales, EUR HT / year — not necessarily 12× monthly */
  annualPrice: number
  /** readonly — sum of original recurring service monthly prices */
  baselineMonthly: number
  /** readonly — sum × 12 */
  baselineAnnual: number
  /** both: drives calculation AND display highlight (★) */
  preferredMode: 'monthly' | 'annual'
  recurringEligible: true
}

export type DevisItem = LineItem | PackageLine

// ---------- Discounts ----------

export type DiscountScope = 'all' | 'recurring' | 'selectedIds'

export type Discount =
  | { kind: 'none' }
  | {
      kind: 'percent'
      /** 0..100 */
      value: number
      label: I18nString
      scope: DiscountScope
      /** LineItem.id or PackageLine.id (NOT serviceId) */
      targetIds?: string[]
    }
  | {
      kind: 'fixed'
      /** EUR */
      value: number
      label: I18nString
      scope: DiscountScope
      targetIds?: string[]
    }

/**
 * Discount scope semantics:
 * - 'all'         → base = subtotalHT (all lines + oneOff hardware)
 * - 'recurring'   → base = sum of recurring items (LineItem.recurringEligible ||
 *                   item.kind === 'package'); oneOff hardware excluded
 * - 'selectedIds' → base = sum of items whose `id` is in targetIds
 */

// ---------- Customer ----------

export interface Customer {
  name: string
  address: string
  postalCode: string
  city: string
  country: Country
  contactName: string
  email: string
  phone: string
  // NO SIREN, NO TVA — explicit user requirement (B2B devis for restaurants)
}

// ---------- Devis ----------

export interface DevisMeta {
  /** Optional manual document title override; defaults to LABELS.devisTitle. */
  title?: I18nString
  /** DRAFT-YYYY-nnn-XXXX */
  number: string
  /** ISO date string */
  date: string
  validityDays: number
  /** Auto-generated per language */
  objet: I18nString
  /** ISO date or '' for "À convenir" */
  startDate: string
}

export interface Devis {
  id: string
  meta: DevisMeta
  customer: Customer
  items: DevisItem[]
  discount: Discount
  notes: string
  /** Output language (FR by default) */
  lang: Lang
  createdAt: string
  updatedAt: string
  /** Stamped automatically when magazine modal opens via "创建 devis →". Once
   * set, storage enforces fork-on-conflict — see storage.saveToHistory */
  savedAt?: string
}

// ---------- Derived totals (never stored) ----------

export interface DevisTotals {
  /** Sum of all line amounts before discount */
  subtotal: number
  discountAmount: number
  /** subtotal - discountAmount */
  totalHT: number
  /** totalHT × 0.20 iff country=FR, else 0 */
  tva: number
  /** totalHT + tva (=== totalHT for non-FR) */
  total: number
  /** Gate for UI: show HT/TVA/TTC breakdown only when true */
  isFrance: boolean

  // Per-cadence breakdown for dual MENSUEL/ANNUEL card display
  recurringMonthlyBaseline: number
  recurringMonthlyFinal: number
  recurringAnnualBaseline: number
  recurringAnnualFinal: number
  oneOffTotal: number
}
