// OKO Devis Generator — shared view-model
// Single source of truth consumed by HTML preview, PDF, and PNG renderers.

import type { Devis, DevisItem, DevisTotals, LineItem, PackageLine, Lang } from './types'
import { tr, LABELS, FREE_SERVICES } from './i18n'
import { OKO_SENDER, CGV, CGV_ORDER } from './legal'
import { computeTotals, lineAmount, formatEuro } from './calculations'

// ---------- ViewModel shape ----------

export interface ViewModelItem {
  kind: 'line' | 'package'
  name: string
  description: string
  qtyLabel: string
  unitPriceLabel: string
  lineAmount: number
  lineAmountLabel: string
  childNames?: string[]
}

export interface DualCard {
  monthly: { baseline: number; final: number; economy: number; economyPct: number }
  annual: { baseline: number; final: number; economy: number; economyPct: number }
}

export interface DevisViewModel {
  lang: Lang
  meta: {
    number: string
    date: string
    validity: string
    objet: string
    debutPrestation: string
  }
  labels: {
    devisTitle: string
    designation: string
    qtyDuration: string
    unitPrice: string
    lineTotal: string
    emetteur: string
    destinataire: string
    subtotal: string
    discount: string
    totalHT: string
    tva: string
    totalTtc: string
    mensuel: string
    annuel: string
    tarifNormal: string
    economie: string
    recommande: string
    perMonth: string
    perYear: string
    forfaitAnnuel: string
    inclusGratuitement: string
    coordonneesBancaires: string
    conditionsGenerales: string
    bonPourAccord: string
    equipeOko: string
    dateSignature: string
    number: string
    date: string
    validity: string
    objet: string
    debutPrestation: string
  }
  emetteur: {
    name: string
    address: string
    email: string
    website: string
    rcs: string
    capital: string
    tvaIntra: string
  }
  destinataire: {
    name: string
    address: string
    postalCity: string
    contactName: string
    email: string
    phone: string
  }
  items: ViewModelItem[]
  inclusGratuit: string[]
  bankDetails: { iban: string; bic: string; bank: string }
  conditionsGenerales: string[]
  totals: DevisTotals
  totalsFormatted: {
    subtotal: string
    discount: string
    totalHT: string
    tva: string
    total: string
  }
  dualCards: DualCard | null
  legalFootnote: string
  isFrance: boolean
}

// ---------- Helpers ----------

function formatQty(item: DevisItem, lang: Lang): string {
  if (item.kind === 'package') {
    return `12 ${tr(LABELS.unitAn, lang)}`
  }
  const line = item as LineItem
  switch (line.billingCadence) {
    case 'monthly':
      return `${line.qty} ${tr(LABELS.unitMois, lang)}`
    case 'perUnit':
      return `${line.qty} ${line.unit === 'photo' ? tr(LABELS.unitPhoto, lang) : line.unit}`
    case 'oneOff':
      return `1 ${tr(LABELS.unitUnique, lang)}`
    default:
      return `${line.qty}`
  }
}

function formatUnitPrice(item: DevisItem, lang: Lang): string {
  if (item.kind === 'package') {
    const pack = item as PackageLine
    return pack.preferredMode === 'monthly'
      ? `${formatEuro(pack.monthlyPrice)} ${tr(LABELS.perMonth, lang)}`
      : `${formatEuro(pack.annualPrice)} ${tr(LABELS.perYear, lang)}`
  }
  const line = item as LineItem
  switch (line.billingCadence) {
    case 'monthly':
      return `${formatEuro(line.unitPrice)} ${tr(LABELS.perMonth, lang)}`
    case 'perUnit':
      return `${formatEuro(line.unitPrice)} / ${line.unit}`
    case 'oneOff':
      return formatEuro(line.unitPrice)
    default:
      return formatEuro(line.unitPrice)
  }
}

// ---------- Builder ----------

export function buildViewModel(devis: Devis, totalsOverride?: DevisTotals): DevisViewModel {
  const lang = devis.lang
  const totals = totalsOverride ?? computeTotals(devis)

  const items: ViewModelItem[] = devis.items.map((item) => {
    if (item.kind === 'package') {
      const pack = item as PackageLine
      return {
        kind: 'package' as const,
        name: tr(pack.nameSnapshot, lang),
        description: pack.childNamesSnapshot.map((n) => tr(n, lang)).join(' + '),
        qtyLabel: `12 ${tr(LABELS.unitAn, lang)}`,
        unitPriceLabel: formatUnitPrice(item, lang),
        lineAmount: lineAmount(item),
        lineAmountLabel: formatEuro(lineAmount(item)),
        childNames: pack.childNamesSnapshot.map((n) => tr(n, lang)),
      }
    }
    return {
      kind: 'line' as const,
      name: tr(item.nameSnapshot, lang),
      description: tr(item.descSnapshot, lang),
      qtyLabel: formatQty(item, lang),
      unitPriceLabel: formatUnitPrice(item, lang),
      lineAmount: lineAmount(item),
      lineAmountLabel: formatEuro(lineAmount(item)),
    }
  })

  // "Inclus gratuitement" — default free services always shown
  const inclusGratuit: string[] = FREE_SERVICES.map((s) => tr(s, lang))

  // Dual cards — show when there's a discount and recurring items
  let dualCards: DualCard | null = null
  if (
    totals.recurringAnnualBaseline > 0 &&
    totals.recurringAnnualBaseline !== totals.recurringAnnualFinal
  ) {
    const annualEconomy = totals.recurringAnnualBaseline - totals.recurringAnnualFinal
    const monthlyEconomy = totals.recurringMonthlyBaseline - totals.recurringMonthlyFinal
    dualCards = {
      monthly: {
        baseline: totals.recurringMonthlyBaseline,
        final: totals.recurringMonthlyFinal,
        economy: monthlyEconomy,
        economyPct: totals.recurringMonthlyBaseline > 0
          ? Math.round((monthlyEconomy / totals.recurringMonthlyBaseline) * 100)
          : 0,
      },
      annual: {
        baseline: totals.recurringAnnualBaseline,
        final: totals.recurringAnnualFinal,
        economy: annualEconomy,
        economyPct: totals.recurringAnnualBaseline > 0
          ? Math.round((annualEconomy / totals.recurringAnnualBaseline) * 100)
          : 0,
      },
    }
  }

  // Check if any service key matches known free services (website-setup when bundled)
  // For now, inclusGratuit from packages only

  const cgvTexts = CGV_ORDER.map((key) => tr(CGV[key], lang))

  const footnote = tr(LABELS.legalFootnote, lang)

  return {
    lang,
    meta: {
      number: devis.meta.number,
      date: devis.meta.date,
      validity: tr(LABELS.validityText, lang),
      objet: tr(devis.meta.objet, lang),
      debutPrestation: devis.meta.startDate || tr(LABELS.startToAgree, lang),
    },
    labels: {
      devisTitle: 'DEVIS',
      designation: tr(LABELS.designation, lang),
      qtyDuration: tr(LABELS.qtyDuration, lang),
      unitPrice: tr(LABELS.unitPrice, lang),
      lineTotal: tr(LABELS.lineTotal, lang),
      emetteur: tr(LABELS.emetteur, lang),
      destinataire: tr(LABELS.destinataire, lang),
      subtotal: tr(LABELS.subtotal, lang),
      discount: tr(LABELS.discount, lang),
      totalHT: tr(LABELS.totalHT, lang),
      tva: tr(LABELS.tva, lang),
      totalTtc: tr(LABELS.totalTtc, lang),
      mensuel: tr(LABELS.mensuel, lang),
      annuel: tr(LABELS.annuel, lang),
      tarifNormal: tr(LABELS.tarifNormal, lang),
      economie: tr(LABELS.economie, lang),
      recommande: tr(LABELS.recommande, lang),
      perMonth: tr(LABELS.perMonth, lang),
      perYear: tr(LABELS.perYear, lang),
      forfaitAnnuel: tr(LABELS.forfaitAnnuel, lang),
      inclusGratuitement: tr(LABELS.inclusGratuitement, lang),
      coordonneesBancaires: tr(LABELS.coordonneesBancaires, lang),
      conditionsGenerales: tr(LABELS.conditionsGenerales, lang),
      bonPourAccord: tr(LABELS.bonPourAccord, lang),
      equipeOko: tr(LABELS.equipeOko, lang),
      dateSignature: tr(LABELS.dateSignature, lang),
      number: tr(LABELS.devisNumber, lang),
      date: tr(LABELS.date, lang),
      validity: tr(LABELS.validity, lang),
      objet: tr(LABELS.objet, lang),
      debutPrestation: tr(LABELS.debutPrestation, lang),
    },
    emetteur: {
      name: OKO_SENDER.legalName,
      address: `${OKO_SENDER.address}, ${OKO_SENDER.postalCode} ${OKO_SENDER.city}`,
      email: OKO_SENDER.email,
      website: OKO_SENDER.website,
      rcs: OKO_SENDER.rcs,
      capital: `Capital : ${OKO_SENDER.capital}`,
      tvaIntra: OKO_SENDER.tvaIntra,
    },
    destinataire: {
      name: devis.customer.name || '—',
      address: devis.customer.address || '—',
      postalCity: [devis.customer.postalCode, devis.customer.city].filter(Boolean).join(' ') || '—',
      contactName: devis.customer.contactName || '—',
      email: devis.customer.email || '—',
      phone: devis.customer.phone || '—',
    },
    items,
    inclusGratuit,
    bankDetails: {
      iban: OKO_SENDER.iban,
      bic: OKO_SENDER.bic,
      bank: OKO_SENDER.bankName,
    },
    conditionsGenerales: cgvTexts,
    totals,
    totalsFormatted: {
      subtotal: formatEuro(totals.subtotal),
      discount: totals.discountAmount > 0 ? `- ${formatEuro(totals.discountAmount)}` : '',
      totalHT: formatEuro(totals.totalHT),
      tva: formatEuro(totals.tva),
      total: formatEuro(totals.total),
    },
    dualCards,
    legalFootnote: footnote,
    isFrance: totals.isFrance,
  }
}
