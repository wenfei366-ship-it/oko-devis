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

// Conditions générales — 8 clauses, each in 5 languages
// FR = legally binding; IT/ES/DE/ZH are operational translations

export type CgvKey =
  | 'validite'
  | 'objet'
  | 'prix'
  | 'paiement'
  | 'acompte'
  | 'delais'
  | 'penalites'
  | 'reserveProp'
  | 'resiliation'
  | 'rgpd'
  | 'droitJuridiction'
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
    fr: 'Acompte — 30 % à la signature du devis, solde à la mise en service. Aucun escompte en cas de paiement anticipé.',
    it: 'Acconto — 30 % alla firma del preventivo, saldo alla messa in servizio. Nessuno sconto per pagamento anticipato.',
    es: 'Anticipo — 30 % a la firma del presupuesto, saldo a la puesta en servicio. Sin descuento por pago anticipado.',
    de: 'Anzahlung — 30 % bei Angebotsunterzeichnung, Rest bei Inbetriebnahme. Kein Skonto bei Vorauszahlung.',
    zh: '定金 — 签署报价单时支付 30%，启用时付清余款。提前付款不享折扣。',
  },
  delais: {
    fr: 'Délais d\'exécution — Mise en service sous 7 jours ouvrés après réception du bon pour accord et de l\'acompte.',
    it: 'Tempi di esecuzione — Messa in servizio entro 7 giorni lavorativi dopo ricezione dell\'accettazione e dell\'acconto.',
    es: 'Plazos de ejecución — Puesta en servicio en 7 días hábiles tras recepción de la aprobación y el anticipo.',
    de: 'Ausführungsfristen — Inbetriebnahme innerhalb von 7 Werktagen nach Auftragserteilung und Anzahlungseingang.',
    zh: '交付时间 — 收到确认函和定金后 7 个工作日内完成上线。',
  },
  penalites: {
    fr: 'Pénalités de retard — Taux d\'intérêt légal majoré de 10 points de pourcentage, plus indemnité forfaitaire de recouvrement de 40 € (art. L441-10 du Code de commerce).',
    it: 'Penali di mora — Tasso legale maggiorato di 10 punti percentuali, oltre a un\'indennità fissa di recupero di 40 €.',
    es: 'Penalizaciones por retraso — Tipo de interés legal incrementado en 10 puntos porcentuales, más una indemnización fija de recuperación de 40 €.',
    de: 'Verzugszinsen — Gesetzlicher Zinssatz zuzüglich 10 Prozentpunkten, plus Pauschalentschädigung von 40 €.',
    zh: '逾期罚金 — 按法定利率加 10 个百分点计息，另加 40 欧元固定追索费。',
  },
  reserveProp: {
    fr: 'Réserve de propriété — Les services et matériels fournis restent la propriété d\'OKO jusqu\'au paiement intégral du prix convenu.',
    it: 'Riserva di proprietà — I servizi e i materiali forniti restano di proprietà di OKO fino al pagamento integrale del prezzo concordato.',
    es: 'Reserva de propiedad — Los servicios y materiales suministrados siguen siendo propiedad de OKO hasta el pago íntegro.',
    de: 'Eigentumsvorbehalt — Die gelieferten Leistungen und Materialien bleiben bis zur vollständigen Bezahlung Eigentum von OKO.',
    zh: '所有权保留 — 所交付服务及硬件在全额付款前均归 OKO 所有。',
  },
  resiliation: {
    fr: 'Résiliation — Préavis d\'un mois par écrit. Les sommes non consommées peuvent être converties en crédit sur d\'autres services OKO.',
    it: 'Risoluzione — Preavviso di un mese per iscritto. Gli importi non utilizzati possono essere convertiti in credito su altri servizi OKO.',
    es: 'Rescisión — Preaviso de un mes por escrito. Los importes no consumidos pueden convertirse en crédito para otros servicios OKO.',
    de: 'Kündigung — Einmonatige schriftliche Kündigungsfrist. Nicht verbrauchte Beträge können in Guthaben für andere OKO-Dienste umgewandelt werden.',
    zh: '终止 — 需提前一个月书面通知。未使用金额可转换为其他 OKO 服务的信用额度。',
  },
  rgpd: {
    fr: 'Données personnelles — Les données clients sont traitées conformément au RGPD. Délégué à la protection : support@joinoko.com.',
    it: 'Dati personali — I dati dei clienti sono trattati in conformità al GDPR. Responsabile: support@joinoko.com.',
    es: 'Datos personales — Los datos de clientes se tratan conforme al RGPD. Delegado: support@joinoko.com.',
    de: 'Personenbezogene Daten — Kundendaten werden DSGVO-konform verarbeitet. Datenschutzbeauftragter: support@joinoko.com.',
    zh: '个人数据 — 客户数据依据 GDPR 处理。数据保护负责人：support@joinoko.com。',
  },
  droitJuridiction: {
    fr: 'Droit applicable & juridiction — Droit français. Tribunal de commerce de Paris compétent en cas de litige. Le présent devis est établi en français.',
    it: 'Legge applicabile e foro competente — Diritto francese. Tribunale commerciale di Parigi competente in caso di controversie.',
    es: 'Derecho aplicable y jurisdicción — Derecho francés. Tribunal de comercio de París competente en caso de litigio.',
    de: 'Anwendbares Recht & Gerichtsstand — Französisches Recht. Handelsgericht Paris zuständig bei Streitigkeiten.',
    zh: '适用法律与管辖 — 适用法国法律。争议由巴黎商事法院管辖。',
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
  'penalites',
  'reserveProp',
  'resiliation',
  'rgpd',
  'droitJuridiction',
  'acceptation',
]
