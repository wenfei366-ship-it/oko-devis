// OKO Devis Generator — hardcoded i18n dictionaries (no AI / API)
// All user-visible strings in the devis output go through these dictionaries.
// UI labels in the builder (the sales tool itself) stay in Chinese.

import type { I18nString, Lang } from './types'

// ---------- Generic helper ----------

export function tr(s: I18nString, lang: Lang): string {
  return s[lang] || s.fr
}

// ---------- UI/document labels ----------

export const LABELS = {
  // Column headers
  designation: { fr: 'DÉSIGNATION', it: 'DESCRIZIONE', es: 'DESCRIPCIÓN', de: 'BEZEICHNUNG', zh: '服务项目' } as I18nString,
  qtyDuration: { fr: 'QTÉ / DURÉE', it: 'QTÀ / DURATA', es: 'CANT / DURACIÓN', de: 'MENGE / DAUER', zh: '数量 / 期限' } as I18nString,
  unitPrice: { fr: 'PU HT', it: 'PREZZO UNITARIO', es: 'PRECIO UNITARIO', de: 'EINZELPREIS', zh: '单价' } as I18nString,
  lineTotal: { fr: 'TOTAL HT', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,

  // Total labels (note: HT/TVA/TTC only used for France)
  subtotal: { fr: 'Sous-total HT', it: 'Subtotale', es: 'Subtotal', de: 'Zwischensumme', zh: '小计' } as I18nString,
  discount: { fr: 'Remise', it: 'Sconto', es: 'Descuento', de: 'Rabatt', zh: '折扣' } as I18nString,
  totalHT: { fr: 'TOTAL HT', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,
  tva: { fr: 'TVA 20 %', it: '—', es: '—', de: '—', zh: '—' } as I18nString,
  totalTtc: { fr: 'TOTAL TTC', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,

  // Tariff comparison card
  tarifNormal: { fr: 'Tarif normal', it: 'Prezzo normale', es: 'Precio normal', de: 'Normalpreis', zh: '原价' } as I18nString,
  economie: { fr: 'Économie', it: 'Risparmio', es: 'Ahorro', de: 'Ersparnis', zh: '节省' } as I18nString,
  mensuel: { fr: 'MENSUEL', it: 'MENSILE', es: 'MENSUAL', de: 'MONATLICH', zh: '月付' } as I18nString,
  annuel: { fr: 'ANNUEL', it: 'ANNUALE', es: 'ANUAL', de: 'JÄHRLICH', zh: '年付' } as I18nString,
  recommande: { fr: 'recommandé', it: 'consigliato', es: 'recomendado', de: 'empfohlen', zh: '推荐' } as I18nString,
  perMonth: { fr: '/ mois', it: '/ mese', es: '/ mes', de: '/ Monat', zh: '/月' } as I18nString,
  perYear: { fr: '/ an', it: '/ anno', es: '/ año', de: '/ Jahr', zh: '/年' } as I18nString,

  // Parties
  emetteur: { fr: 'ÉMETTEUR', it: 'EMITTENTE', es: 'EMISOR', de: 'ABSENDER', zh: '开具方' } as I18nString,
  destinataire: { fr: 'DESTINATAIRE', it: 'DESTINATARIO', es: 'DESTINATARIO', de: 'EMPFÄNGER', zh: '收件方' } as I18nString,

  // Meta
  devisNumber: { fr: 'N°', it: 'N°', es: 'N°', de: 'Nr.', zh: '编号' } as I18nString,
  date: { fr: 'DATE', it: 'DATA', es: 'FECHA', de: 'DATUM', zh: '日期' } as I18nString,
  validity: { fr: 'VALIDITÉ', it: 'VALIDITÀ', es: 'VALIDEZ', de: 'GÜLTIGKEIT', zh: '有效期' } as I18nString,
  objet: { fr: 'OBJET', it: 'OGGETTO', es: 'ASUNTO', de: 'GEGENSTAND', zh: '主题' } as I18nString,
  debutPrestation: { fr: 'DÉBUT PRESTATION', it: 'INIZIO SERVIZIO', es: 'INICIO SERVICIO', de: 'LEISTUNGSBEGINN', zh: '服务起始' } as I18nString,
  validityText: { fr: '30 jours', it: '30 giorni', es: '30 días', de: '30 Tage', zh: '30 天' } as I18nString,
  startToAgree: { fr: 'À convenir', it: 'Da concordare', es: 'A convenir', de: 'Nach Vereinbarung', zh: '双方确定' } as I18nString,

  // Sections
  forfaitAnnuel: { fr: 'Forfait annuel', it: 'Forfait annuale', es: 'Paquete anual', de: 'Jahrespaket', zh: '年费套餐' } as I18nString,
  inclusGratuitement: { fr: 'INCLUS GRATUITEMENT DANS L\'OFFRE', it: 'INCLUSO GRATUITAMENTE', es: 'INCLUIDO GRATUITAMENTE', de: 'KOSTENLOS ENTHALTEN', zh: '免费包含' } as I18nString,
  coordonneesBancaires: { fr: 'COORDONNÉES BANCAIRES', it: 'COORDINATE BANCARIE', es: 'DATOS BANCARIOS', de: 'BANKVERBINDUNG', zh: '银行账户' } as I18nString,
  conditionsGenerales: { fr: 'CONDITIONS GÉNÉRALES', it: 'CONDIZIONI GENERALI', es: 'CONDICIONES GENERALES', de: 'ALLGEMEINE GESCHÄFTSBEDINGUNGEN', zh: '通用条款' } as I18nString,

  // Signature
  bonPourAccord: { fr: 'BON POUR ACCORD', it: 'PER ACCETTAZIONE', es: 'APROBADO', de: 'EINVERSTANDEN', zh: '确认接受' } as I18nString,
  equipeOko: { fr: 'L\'ÉQUIPE OKO', it: 'IL TEAM OKO', es: 'EL EQUIPO OKO', de: 'DAS OKO-TEAM', zh: 'OKO 团队' } as I18nString,
  dateSignature: { fr: 'Date et signature du client', it: 'Data e firma del cliente', es: 'Fecha y firma del cliente', de: 'Datum und Unterschrift', zh: '客户日期及签字' } as I18nString,

  // Legal footnote — shown on non-FR versions in FRENCH (not translated)
  // because the French version is the legally binding one
  legalFootnote: {
    fr: '',
    it: 'Version française du devis fait foi en cas de litige.',
    es: 'Version française du devis fait foi en cas de litige.',
    de: 'Version française du devis fait foi en cas de litige.',
    zh: 'Version française du devis fait foi en cas de litige.',
  } as I18nString,
} as const

// ---------- Service dictionary (10 services × 5 languages) ----------

export type ServiceKey =
  | 'website'
  | 'reservation'
  | 'online-ordering'
  | 'in-store-ordering'
  | 'wheel-game'
  | 'ai-google'
  | 'e-reputation'
  | 'ai-photo'
  | 'printer-wifi'
  | 'website-setup'

export const SERVICE_DICT: Record<ServiceKey, { name: I18nString; description: I18nString }> = {
  website: {
    name: { fr: 'Site web', it: 'Sito web', es: 'Sitio web', de: 'Website', zh: '商家主页' },
    description: {
      fr: 'Site vitrine multilingue · SEO optimisé · mises à jour illimitées',
      it: 'Sito vetrina multilingua · SEO ottimizzato · aggiornamenti illimitati',
      es: 'Sitio web multilingüe · SEO optimizado · actualizaciones ilimitadas',
      de: 'Mehrsprachige Webseite · SEO-optimiert · unbegrenzte Updates',
      zh: '多语言官网 · SEO 优化 · 无限次更新',
    },
  },
  reservation: {
    name: { fr: 'Réservation', it: 'Prenotazione', es: 'Reservas', de: 'Reservierung', zh: '订位系统' },
    description: {
      fr: 'Réservation en ligne + confirmation automatique par email',
      it: 'Prenotazione online + conferma automatica via email',
      es: 'Reserva en línea + confirmación automática por email',
      de: 'Online-Reservierung + automatische E-Mail-Bestätigung',
      zh: '在线预订 + 自动邮件确认',
    },
  },
  'online-ordering': {
    name: { fr: 'Commande en ligne', it: 'Ordini online', es: 'Pedidos en línea', de: 'Online-Bestellung', zh: '线上点单' },
    description: {
      fr: 'Commande à emporter / livraison · emballage & frais inclus',
      it: 'Asporto / consegna · imballaggio e spedizione inclusi',
      es: 'Para llevar / entrega · embalaje y envío incluidos',
      de: 'Abholung / Lieferung · Verpackung & Versand inklusive',
      zh: '外卖 / 自取 · 包装 + 配送费包含',
    },
  },
  'in-store-ordering': {
    name: { fr: 'Commande sur place', it: 'Ordini al tavolo', es: 'Pedidos en mesa', de: 'Tisch-Bestellung', zh: '店内点单' },
    description: {
      fr: 'Commande sur place par QR code ou tablette serveur',
      it: 'Ordine al tavolo via QR code o tablet del cameriere',
      es: 'Pedido en mesa por código QR o tablet',
      de: 'Tisch-Bestellung via QR-Code oder Kellner-Tablet',
      zh: '堂食扫码点单 / 服务员点单',
    },
  },
  'wheel-game': {
    name: { fr: 'Jeu de la roue', it: 'Ruota della fortuna', es: 'Ruleta', de: 'Glücksrad', zh: '大转盘游戏' },
    description: {
      fr: 'Jeu de fidélisation · collecte emails + relance automatique',
      it: 'Gioco fidelizzazione · raccolta email + recall automatico',
      es: 'Juego de fidelización · captación de emails + seguimiento',
      de: 'Treue-Gewinnspiel · E-Mail-Sammlung + automatische Nachfassaktion',
      zh: '忠诚度游戏 · 收集邮箱 + 自动召回',
    },
  },
  'ai-google': {
    name: { fr: 'Réponses IA Google', it: 'Risposte IA Google', es: 'Respuestas IA Google', de: 'KI-Antworten Google', zh: 'Google 评价 AI 回复' },
    description: {
      fr: 'IA qui répond à tous les avis Google 24h/24',
      it: 'IA che risponde a tutte le recensioni Google 24/7',
      es: 'IA que responde a todas las reseñas de Google 24/7',
      de: 'KI beantwortet Google-Bewertungen rund um die Uhr',
      zh: 'AI 24 小时自动回复 Google 评价',
    },
  },
  'e-reputation': {
    name: { fr: 'E-réputation', it: 'E-reputazione', es: 'E-reputación', de: 'Online-Reputation', zh: '口碑管理' },
    description: {
      fr: 'Gestion Google Business + veille des avis clients',
      it: 'Gestione Google Business + monitoraggio recensioni',
      es: 'Gestión Google Business + seguimiento de reseñas',
      de: 'Google Business Management + Bewertungsüberwachung',
      zh: 'Google 商家管理 + 客户评价监控',
    },
  },
  'ai-photo': {
    name: { fr: 'Photo IA', it: 'Foto IA', es: 'Foto IA', de: 'KI-Fotos', zh: 'AI 菜品摄影' },
    description: {
      fr: 'Photos de plats générées par IA · qualité professionnelle',
      it: 'Foto dei piatti generate da IA · qualità professionale',
      es: 'Fotos de platos generadas por IA · calidad profesional',
      de: 'KI-generierte Gerichtsfotos · Profi-Qualität',
      zh: 'AI 生成菜品照片 · 专业品质',
    },
  },
  'printer-wifi': {
    name: { fr: 'Imprimante WiFi', it: 'Stampante WiFi', es: 'Impresora WiFi', de: 'WLAN-Drucker', zh: 'WiFi 票据打印机' },
    description: {
      fr: 'Imprimante ticket de caisse sans fil · configuration OKO',
      it: 'Stampante scontrini wireless · configurazione OKO',
      es: 'Impresora de tickets inalámbrica · configuración OKO',
      de: 'Drahtloser Beleg-Drucker · OKO-Konfiguration',
      zh: '无线小票打印机 · OKO 已配置',
    },
  },
  'website-setup': {
    name: { fr: 'Frais de création', it: 'Spese di creazione', es: 'Gastos de creación', de: 'Einrichtungsgebühr', zh: '建站费' },
    description: {
      fr: 'Mise en ligne du site · paramétrage initial · formation',
      it: 'Messa online del sito · configurazione iniziale · formazione',
      es: 'Puesta en línea · configuración inicial · formación',
      de: 'Website-Veröffentlichung · Ersteinrichtung · Schulung',
      zh: '网站上线 · 初始配置 · 培训',
    },
  },
}

export function serviceName(id: ServiceKey, lang: Lang): string {
  return tr(SERVICE_DICT[id].name, lang)
}

export function serviceDesc(id: ServiceKey, lang: Lang): string {
  return tr(SERVICE_DICT[id].description, lang)
}

// ---------- Pack names ----------

export const PACK_NAMES: Record<'surMesure', I18nString> = {
  surMesure: {
    fr: 'Pack sur mesure',
    it: 'Pacchetto su misura',
    es: 'Paquete a medida',
    de: 'Maßgeschneidertes Paket',
    zh: '定制套餐',
  },
}

export function packName(key: keyof typeof PACK_NAMES, lang: Lang): string {
  return tr(PACK_NAMES[key], lang)
}

/** Build the auto pack name: "Pack sur mesure · 5 services" */
export function packNameWithCount(count: number, lang: Lang): string {
  const base = packName('surMesure', lang)
  const svcWord: I18nString = { fr: 'services', it: 'servizi', es: 'servicios', de: 'Services', zh: '个服务' }
  return `${base}  ·  ${count} ${tr(svcWord, lang)}`
}

// ---------- Default objet line ----------

export const DEFAULT_OBJET: I18nString = {
  fr: 'Devis pour services digitaux',
  it: 'Preventivo per servizi digitali',
  es: 'Presupuesto para servicios digitales',
  de: 'Angebot für digitale Dienstleistungen',
  zh: '数字化服务报价',
}

// ---------- Validation helper (used in tests) ----------

/** Return a list of i18n keys missing any language translation. */
export function findMissingTranslations(): string[] {
  const missing: string[] = []
  const langs: Lang[] = ['fr', 'it', 'es', 'de', 'zh']

  function check(path: string, s: I18nString) {
    for (const l of langs) {
      if (typeof s[l] !== 'string') missing.push(`${path}[${l}] (not a string)`)
      // legalFootnote[fr] is intentionally empty
      else if (s[l].length === 0 && !(path === 'LABELS.legalFootnote' && l === 'fr'))
        missing.push(`${path}[${l}] (empty)`)
    }
  }

  for (const [k, v] of Object.entries(LABELS)) check(`LABELS.${k}`, v as I18nString)
  for (const [k, v] of Object.entries(SERVICE_DICT)) {
    check(`SERVICE_DICT.${k}.name`, v.name)
    check(`SERVICE_DICT.${k}.description`, v.description)
  }
  for (const [k, v] of Object.entries(PACK_NAMES)) check(`PACK_NAMES.${k}`, v as I18nString)
  check('DEFAULT_OBJET', DEFAULT_OBJET)

  return missing
}
