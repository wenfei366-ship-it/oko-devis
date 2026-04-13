// OKO Devis Generator — OKO sender constants + CGV text per language
// The FRENCH version is the legally binding one; other languages are operational
// translations (UI) for client readability.

import type { I18nString } from './types'

export const OKO_SENDER = {
  legalName: 'OKO',
  legalForm: 'Société par actions simplifiée',
  siren: '881 648 323',
  rcs: 'R.C.S. Paris 881 648 323',
  capital: '1 000 €',
  tvaIntra: 'FR03 881 648 323',
  address: '31 boulevard de Magenta',
  postalCode: '75010',
  city: 'Paris',
  country: 'France',
  email: 'support@joinoko.com',
  website: 'joinoko.com',
  iban: 'FR76 2823 3000 0101 2871 8986 862',
  bic: 'REVOFRP2',
  bankName: 'Revolut Bank UAB — SEPA / SWIFT',
} as const

// Conditions générales — active clauses translated in 5 languages
// FR = legally binding; IT/ES/DE/ZH are operational translations

export type CgvKey =
  | 'validite'
  | 'objet'
  | 'prix'
  | 'paiement'
  | 'acompte'
  | 'delais'
  | 'resiliation'
  | 'acceptation'

export const CGV: Record<CgvKey, I18nString> = {
  validite: {
    fr: 'Validité — Ce devis est valable 30 jours à compter de sa date d\'émission.',
    it: 'Validità — Questo preventivo è valido 30 giorni dalla data di emissione.',
    es: 'Validez — Este presupuesto es válido 30 días desde su fecha de emisión.',
    de: 'Gültigkeit — Dieses Angebot ist 30 Tage ab Ausstellungsdatum gültig.',
    zh: '有效期 — 本报价单自开具之日起 30 天内有效。',
  },
  objet: {
    fr: 'Objet — Prestations de services numériques pour la restauration.',
    it: 'Oggetto — Servizi digitali per la ristorazione.',
    es: 'Objeto — Servicios digitales para la restauración.',
    de: 'Gegenstand — Digitale Dienstleistungen für die Gastronomie.',
    zh: '主题 — 餐饮业数字化服务。',
  },
  prix: {
    fr: 'Prix — Tous les prix sont indiqués en euros hors taxes. TVA au taux en vigueur (20 %) en sus, applicable uniquement pour les clients français.',
    it: 'Prezzi — Tutti i prezzi sono indicati in euro al netto delle imposte.',
    es: 'Precios — Todos los precios se indican en euros sin impuestos.',
    de: 'Preise — Alle Preise sind in Euro ohne Steuern angegeben.',
    zh: '价格 — 所有价格均以欧元不含税计算。',
  },
  paiement: {
    fr: 'Modalités de paiement — Forfait annuel payable en une fois (remise appliquée) ou en 12 mensualités (sans remise). Services à la carte et matériel payables à la commande ou à réception de facture.',
    it: 'Modalità di pagamento — Forfait annuale pagabile in un\'unica soluzione (sconto applicato) o in 12 rate mensili (senza sconto). Servizi à la carte e materiale pagabili all\'ordine o alla ricezione della fattura.',
    es: 'Formas de pago — Paquete anual pagadero en una vez (con descuento) o en 12 mensualidades (sin descuento). Servicios a la carta y material pagaderos al pedido o a la recepción de la factura.',
    de: 'Zahlungsbedingungen — Jahrespaket einmalig zahlbar (mit Rabatt) oder in 12 Monatsraten (ohne Rabatt). À-la-carte-Dienste und Hardware zahlbar bei Bestellung oder Rechnungseingang.',
    zh: '付款方式 — 年费套餐可一次性支付（含折扣）或分 12 月付款（不含折扣）。单点服务及硬件需下单时或收到发票时支付。',
  },
  acompte: {
    fr: 'Frais de création — Les frais de création du site sont facturés une seule fois, au moment de la présentation du site démo.',
    it: 'Spese di creazione — Le spese di realizzazione del sito vengono fatturate una sola volta, al momento della presentazione del sito demo.',
    es: 'Gastos de creación — Los gastos de creación del sitio se cobran una sola vez, en el momento de la presentación del sitio demo.',
    de: 'Erstellungskosten — Die Kosten für die Website-Erstellung werden einmalig bei der Präsentation der Demo-Website berechnet.',
    zh: '建站费 — 网站 demo 提交时收取一次性费用。',
  },
  delais: {
    fr: 'Délais d\'exécution — Mise en service sous 7 jours ouvrés après réception du bon pour accord et de l\'acompte.',
    it: 'Tempi di esecuzione — Messa in servizio entro 7 giorni lavorativi dopo ricezione dell\'accettazione e dell\'acconto.',
    es: 'Plazos de ejecución — Puesta en servicio en 7 días hábiles tras recepción de la aprobación y el anticipo.',
    de: 'Ausführungsfristen — Inbetriebnahme innerhalb von 7 Werktagen nach Auftragserteilung und Anzahlungseingang.',
    zh: '交付时间 — 收到确认函和定金后 7 个工作日内完成上线。',
  },
  resiliation: {
    fr: 'Résiliation — Préavis d\'un mois par écrit.',
    it: 'Risoluzione — Preavviso di un mese per iscritto.',
    es: 'Rescisión — Preaviso de un mes por escrito.',
    de: 'Kündigung — Einmonatige schriftliche Kündigungsfrist.',
    zh: '终止 — 需提前一个月书面通知。',
  },
  acceptation: {
    fr: 'Acceptation — À retourner daté, signé et précédé de la mention manuscrite « Bon pour accord » à support@joinoko.com.',
    it: 'Accettazione — Da restituire datato, firmato e preceduto dalla dicitura manoscritta « Per accettazione » a support@joinoko.com.',
    es: 'Aceptación — Devolver fechado, firmado y precedido de la mención manuscrita « Aprobado » a support@joinoko.com.',
    de: 'Annahme — Datiert und unterzeichnet mit dem handschriftlichen Vermerk „Einverstanden" an support@joinoko.com zurücksenden.',
    zh: '接受 — 请在其上手写"确认接受"并签字日期后发送至 support@joinoko.com。',
  },
}

export const CGV_ORDER: CgvKey[] = [
  'validite',
  'objet',
  'prix',
  'paiement',
  'acompte',
  'delais',
  'resiliation',
  'acceptation',
]
