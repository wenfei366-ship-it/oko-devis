// OKO Devis Generator — shared view-model
// Single source of truth consumed by HTML preview, PDF, and PNG renderers.

import type { Devis, DevisItem, DevisTotals, LineItem, PackageLine, Lang } from './types'
import { tr, LABELS, FREE_SERVICES } from './i18n'
import { OKO_SENDER, CGV, CGV_ORDER } from './legal'
import { CATALOG } from './catalog'
import { computeTotals, lineAmount, formatEuro, formatEuroCompact } from './calculations'

// ---------- ViewModel shape ----------

export interface ViewModelItem {
  kind: 'line' | 'package'
  section: ViewModelItemSection
  name: string
  description: string
  qtyLabel: string
  unitPriceLabel: string
  lineAmount: number
  lineAmountLabel: string
  childNames?: string[]
}

export type ViewModelItemSection = 'recurring' | 'oneOffFees' | 'hardware'

export interface ViewModelItemGroup {
  key: ViewModelItemSection
  title: string
  subtitle: string
  items: ViewModelItem[]
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
    oneOffTotal: string
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
    issueDate: string
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
  groupedItems: ViewModelItemGroup[]
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

const SECTION_LABELS: Record<ViewModelItemSection, { title: Record<Lang, string>; subtitle: Record<Lang, string> }> = {
  recurring: {
    title: {
      fr: 'Abonnement services',
      it: 'Abbonamento servizi',
      es: 'Suscripción de servicios',
      de: 'Service-Abonnement',
      zh: '订阅服务',
    },
    subtitle: {
      fr: 'Choix mensuel ou annuel',
      it: 'Scelta mensile o annuale',
      es: 'Elección mensual o anual',
      de: 'Monatlich oder jährlich',
      zh: '可选月费或年费',
    },
  },
  oneOffFees: {
    title: {
      fr: 'Frais ponctuels / sur mesure',
      it: 'Costi una tantum / su misura',
      es: 'Costes puntuales / a medida',
      de: 'Einmalige / individuelle Kosten',
      zh: '一次性 / 定制费用',
    },
    subtitle: {
      fr: 'Payable une seule fois, hors abonnement',
      it: 'Da pagare una sola volta, fuori abbonamento',
      es: 'Pago único, fuera de la suscripción',
      de: 'Einmalig zahlbar, außerhalb des Abonnements',
      zh: '单独一次性支付，不计入月费',
    },
  },
  hardware: {
    title: {
      fr: 'Équipement',
      it: 'Attrezzatura',
      es: 'Equipamiento',
      de: 'Ausstattung',
      zh: '设备费用',
    },
    subtitle: {
      fr: 'Matériel facturé séparément',
      it: 'Materiale fatturato separatamente',
      es: 'Material facturado por separado',
      de: 'Geräte werden separat berechnet',
      zh: '设备单独额外一次性支付',
    },
  },
}

const CATALOG_PRICE_MAP = new Map(CATALOG.map((service) => [service.id, service.defaultPrice]))

function itemSection(item: DevisItem): ViewModelItemSection {
  if (item.kind === 'package') return 'recurring'
  if (item.recurringEligible) return 'recurring'
  return item.pdfSection === 'hardware' ? 'hardware' : 'oneOffFees'
}

function buildItemGroups(items: ViewModelItem[], lang: Lang): ViewModelItemGroup[] {
  const order: ViewModelItemSection[] = ['recurring', 'oneOffFees', 'hardware']
  return order.flatMap((key) => {
    const groupItems = items.filter((item) => item.section === key)
    if (groupItems.length === 0) return []
    const labels = SECTION_LABELS[key]
    return [{
      key,
      title: labels.title[lang],
      subtitle: labels.subtitle[lang],
      items: groupItems,
    }]
  })
}

function formatQty(item: DevisItem, lang: Lang): string {
  if (item.kind === 'package') {
    return `12 ${tr(LABELS.unitAn, lang)}`
  }
  const line = item as LineItem
  switch (line.billingCadence) {
    case 'monthly':
      return `${line.qty} ${tr(LABELS.unitMois, lang)}`
    case 'annual':
      return `${line.qty} ${tr(LABELS.perYear, lang).replace('/', '').trim()}`
    case 'perUnit':
      return `${line.qty} ${line.unit === 'photo' ? tr(LABELS.unitPhoto, lang) : line.unit}`
    case 'oneOff':
      if (!line.unit) return `${line.qty}`
      if (line.unit !== 'unique') return `${line.qty} ${line.unit}`
      return `1 ${tr(LABELS.unitUnique, lang)}`
    default:
      return `${line.qty}`
  }
}

function formatUnitPrice(item: DevisItem, lang: Lang): string {
  if (item.kind === 'package') {
    const pack = item as PackageLine
    return pack.preferredMode === 'monthly'
      ? `${formatEuroCompact(pack.monthlyPrice)} ${tr(LABELS.perMonth, lang)}`
      : `${formatEuroCompact(pack.annualPrice)} ${tr(LABELS.perYear, lang)}`
  }
  const line = item as LineItem
  switch (line.billingCadence) {
    case 'monthly':
      return `${formatEuroCompact(line.unitPrice)} ${tr(LABELS.perMonth, lang)}`
    case 'annual':
      return `${formatEuroCompact(line.unitPrice)} ${tr(LABELS.perYear, lang)}`
    case 'perUnit':
      return `${formatEuroCompact(line.unitPrice)} / ${line.unit}`
    case 'oneOff':
      return formatEuroCompact(line.unitPrice)
    default:
      return formatEuroCompact(line.unitPrice)
  }
}

function economyPct(baseline: number, economy: number): number {
  return baseline > 0 ? Math.round((economy / baseline) * 100) : 0
}

function buildDualCards(items: DevisItem[]): DualCard | null {
  const values = items.reduce(
    (acc, item) => {
      if (item.kind === 'package') {
        const pack = item as PackageLine
        acc.monthlyBaseline += pack.baselineMonthly
        acc.monthlyFinal += pack.monthlyPrice
        acc.annualBaseline += pack.baselineAnnual
        acc.annualFinal += pack.annualPrice
        return acc
      }

      const line = item as LineItem
      if (!line.recurringEligible) return acc

      const annualAmount = lineAmount(line)
      const monthlyAmount = line.billingCadence === 'monthly'
        ? line.unitPrice
        : annualAmount / 12

      acc.monthlyBaseline += monthlyAmount
      acc.monthlyFinal += monthlyAmount
      acc.annualBaseline += annualAmount
      acc.annualFinal += annualAmount
      return acc
    },
    { monthlyBaseline: 0, monthlyFinal: 0, annualBaseline: 0, annualFinal: 0 }
  )

  if (values.annualBaseline <= 0) return null

  const monthlyEconomy = Math.max(0, values.monthlyBaseline - values.monthlyFinal)
  const annualEconomy = Math.max(0, values.annualBaseline - values.annualFinal)

  return {
    monthly: {
      baseline: values.monthlyBaseline,
      final: values.monthlyFinal,
      economy: monthlyEconomy,
      economyPct: economyPct(values.monthlyBaseline, monthlyEconomy),
    },
    annual: {
      baseline: values.annualBaseline,
      final: values.annualFinal,
      economy: annualEconomy,
      economyPct: economyPct(values.annualBaseline, annualEconomy),
    },
  }
}

// ---------- Builder ----------

export function buildViewModel(devis: Devis, totalsOverride?: DevisTotals): DevisViewModel {
  const lang = devis.lang
  const totals = totalsOverride ?? computeTotals(devis)

  const items: ViewModelItem[] = devis.items.map((item) => {
    if (item.kind === 'package') {
      const pack = item as PackageLine
      const isMonthlyMode = pack.preferredMode === 'monthly'
      const baseline = isMonthlyMode ? pack.baselineMonthly : pack.baselineAnnual
      const packagePrice = isMonthlyMode ? pack.monthlyPrice : pack.annualPrice
      const economy = Math.max(0, baseline - packagePrice)
      const cadenceLabel = isMonthlyMode ? tr(LABELS.perMonth, lang) : tr(LABELS.perYear, lang)

      const serviceDetails = pack.childNamesSnapshot.map((n, i) => {
        const desc = pack.childDescsSnapshot[i]
        const monthlyPrice = pack.childMonthlyPricesSnapshot?.[i] ?? CATALOG_PRICE_MAP.get(pack.childServiceIds[i]) ?? 0
        const displayPrice = isMonthlyMode ? monthlyPrice : monthlyPrice * 12
        const priceLabel = `${formatEuroCompact(displayPrice)} ${cadenceLabel}`
        return desc
          ? `✦  ${tr(n, lang)}  —  ${tr(desc, lang)}  ·  ${priceLabel}`
          : `✦  ${tr(n, lang)}  ·  ${priceLabel}`
      })
      serviceDetails.push(`${tr(LABELS.tarifNormal, lang)} : ${formatEuroCompact(baseline)} ${cadenceLabel}`)
      serviceDetails.push(`${tr(LABELS.packagePrice, lang)} : ${formatEuroCompact(packagePrice)} ${cadenceLabel}`)
      if (economy > 0) {
        serviceDetails.push(`${tr(LABELS.economie, lang)} : ${formatEuroCompact(economy)} ${cadenceLabel}`)
      }
      return {
        kind: 'package' as const,
        section: itemSection(item),
        name: tr(pack.nameSnapshot, lang),
        description: serviceDetails.join('\n'),
        qtyLabel: `12 ${tr(LABELS.unitAn, lang)}`,
        unitPriceLabel: formatUnitPrice(item, lang),
        lineAmount: lineAmount(item),
        lineAmountLabel: formatEuro(lineAmount(item)),
      }
    }
    return {
      kind: 'line' as const,
      section: itemSection(item),
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

  // Dual cards — show whenever recurring services can be quoted as a choice.
  // Discounts only control whether the "normal price" and savings copy are meaningful.
  const dualCards = buildDualCards(devis.items)

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
      devisTitle: tr(devis.meta.title ?? LABELS.devisTitle, lang),
      designation: tr(LABELS.designation, lang),
      qtyDuration: tr(LABELS.qtyDuration, lang),
      unitPrice: totals.isFrance ? tr(LABELS.unitPrice, lang) : tr(LABELS.unitPriceNoTax, lang),
      lineTotal: totals.isFrance ? tr(LABELS.lineTotal, lang) : tr(LABELS.lineTotalNoTax, lang),
      emetteur: tr(LABELS.emetteur, lang),
      destinataire: tr(LABELS.destinataire, lang),
      subtotal: totals.isFrance ? tr(LABELS.subtotal, lang) : tr(LABELS.subtotalNoTax, lang),
      discount: tr(LABELS.discount, lang),
      totalHT: totals.isFrance ? tr(LABELS.totalHT, lang) : tr(LABELS.totalNoTax, lang),
      tva: tr(LABELS.tva, lang),
      totalTtc: tr(LABELS.totalTtc, lang),
      oneOffTotal: tr(LABELS.oneOffTotal, lang),
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
      issueDate: tr(LABELS.issueDate, lang),
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
      name: devis.customer.name,
      address: devis.customer.address,
      postalCity: [devis.customer.postalCode, devis.customer.city].filter(Boolean).join(' '),
      contactName: devis.customer.contactName,
      email: devis.customer.email,
      phone: devis.customer.phone,
    },
    items,
    groupedItems: buildItemGroups(items, lang),
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
