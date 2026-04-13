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
  devisTitle: { fr: 'DEVIS', it: 'PREVENTIVO', es: 'PRESUPUESTO', de: 'ANGEBOT', zh: '报价单' } as I18nString,

  // Column headers
  designation: { fr: 'DÉSIGNATION', it: 'DESCRIZIONE', es: 'DESCRIPCIÓN', de: 'BEZEICHNUNG', zh: '服务项目' } as I18nString,
  qtyDuration: { fr: 'QTÉ / DURÉE', it: 'QTÀ / DURATA', es: 'CANT / DURACIÓN', de: 'MENGE / DAUER', zh: '数量 / 期限' } as I18nString,
  unitPrice: { fr: 'PU HT', it: 'PREZZO UNITARIO', es: 'PRECIO UNITARIO', de: 'EINZELPREIS', zh: '单价' } as I18nString,
  unitPriceNoTax: { fr: 'PU', it: 'PREZZO UNITARIO', es: 'PRECIO UNITARIO', de: 'EINZELPREIS', zh: '单价' } as I18nString,
  lineTotal: { fr: 'TOTAL HT', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,
  lineTotalNoTax: { fr: 'TOTAL', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,

  // Total labels (note: HT/TVA/TTC only used for France)
  subtotal: { fr: 'Sous-total HT', it: 'Subtotale', es: 'Subtotal', de: 'Zwischensumme', zh: '小计' } as I18nString,
  subtotalNoTax: { fr: 'Sous-total', it: 'Subtotale', es: 'Subtotal', de: 'Zwischensumme', zh: '小计' } as I18nString,
  discount: { fr: 'Remise', it: 'Sconto', es: 'Descuento', de: 'Rabatt', zh: '折扣' } as I18nString,
  totalHT: { fr: 'TOTAL HT', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,
  totalNoTax: { fr: 'TOTAL', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,
  tva: { fr: 'TVA 20 %', it: '—', es: '—', de: '—', zh: '—' } as I18nString,
  totalTtc: { fr: 'TOTAL TTC', it: 'TOTALE', es: 'TOTAL', de: 'GESAMT', zh: '总计' } as I18nString,
  oneOffTotal: { fr: 'Frais ponctuels à régler une fois', it: 'Costi una tantum da pagare', es: 'Costes puntuales a pagar una vez', de: 'Einmalige Zusatzkosten', zh: '一次性费用合计' } as I18nString,

  // Tariff comparison card
  tarifNormal: { fr: 'Tarif normal', it: 'Prezzo normale', es: 'Precio normal', de: 'Normalpreis', zh: '原价' } as I18nString,
  packagePrice: { fr: 'Prix du pack', it: 'Prezzo del pacchetto', es: 'Precio del paquete', de: 'Paketpreis', zh: '套餐价' } as I18nString,
  economie: { fr: 'Économie', it: 'Risparmio', es: 'Ahorro', de: 'Ersparnis', zh: '节省' } as I18nString,
  offered: { fr: 'Offert', it: 'In omaggio', es: 'Ofrecido', de: 'Gratis', zh: '赠送' } as I18nString,
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
  issueDate: { fr: 'DATE D\'ÉMISSION', it: 'DATA DI EMISSIONE', es: 'FECHA DE EMISIÓN', de: 'AUSSTELLUNGSDATUM', zh: '签发日期' } as I18nString,
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

  // Unit labels for qty display
  unitMois: { fr: 'mois', it: 'mese', es: 'mes', de: 'Monat', zh: '个月' } as I18nString,
  unitAn: { fr: 'mois', it: 'mesi', es: 'meses', de: 'Monate', zh: '个月' } as I18nString,
  unitPhoto: { fr: 'photos', it: 'foto', es: 'fotos', de: 'Fotos', zh: '张照片' } as I18nString,
  unitUnique: { fr: 'unité', it: 'unità', es: 'unidad', de: 'Einheit', zh: '次' } as I18nString,

  // Legal footnote — shown on non-FR versions in FRENCH (not translated)
  // Localized explanation that the French version remains legally binding
  legalFootnote: {
    fr: '',
    it: 'In caso di controversia, fa fede la versione francese del preventivo.',
    es: 'En caso de litigio, prevalece la versión francesa del presupuesto.',
    de: 'Im Streitfall ist die französische Fassung des Angebots maßgeblich.',
    zh: '如发生争议，以本报价单的法文版本为准。',
  } as I18nString,
} as const

// ---------- Free services (included in all offers) ----------

export const FREE_SERVICES: I18nString[] = [
  { fr: 'Optimisation SEO du site web', it: 'Ottimizzazione SEO del sito web', es: 'Optimización SEO del sitio web', de: 'SEO-Optimierung der Webseite', zh: 'SEO 网站优化' },
  { fr: 'Stockage illimité d\'images et médias', it: 'Archiviazione illimitata di immagini e media', es: 'Almacenamiento ilimitado de imágenes y medios', de: 'Unbegrenzter Bild- und Medienspeicher', zh: '无限图片和媒体存储' },
  { fr: 'Services d\'envoi d\'e-mails groupés', it: 'Servizi di invio e-mail di massa', es: 'Servicios de envío de correos masivos', de: 'Massen-E-Mail-Versand', zh: '群发邮件服务' },
  { fr: 'Filtrage des avis négatifs par email et valorisation des avis positifs', it: 'Filtro delle recensioni negative via email e valorizzazione di quelle positive', es: 'Filtrado de reseñas negativas por correo y valorización de las positivas', de: 'Filterung negativer Bewertungen per E-Mail und Aufwertung positiver Bewertungen', zh: '谷歌邮件差评拦截好评提升' },
  { fr: 'Réduction de commission Uber via lien dédié jusqu\'à 10 %', it: 'Riduzione commissioni Uber tramite link dedicato fino al 10 %', es: 'Reducción de comisión Uber mediante enlace dedicado hasta el 10 %', de: 'Reduzierung der Uber-Provision über Speziallink auf bis zu 10 %', zh: 'Uber 链接降佣金至 10%' },
  { fr: 'Intégration multi-plateformes (Instagram, TikTok, etc.)', it: 'Integrazione multi-piattaforma (Instagram, TikTok, ecc.)', es: 'Integración multiplataforma (Instagram, TikTok, etc.)', de: 'Multi-Plattform-Integration (Instagram, TikTok usw.)', zh: '多平台集成（Ins、TikTok 等）' },
  { fr: 'Support client en ligne 7/7', it: 'Supporto clienti online 7/7', es: 'Soporte al cliente online 7/7', de: 'Online-Kundensupport 7/7', zh: '7/7 在线客服支持' },
  { fr: 'Collecte des informations clients', it: 'Raccolta delle informazioni clienti', es: 'Recopilación de información del cliente', de: 'Erfassung von Kundendaten', zh: '客户信息收集' },
]

// ---------- Service dictionary (13 services × 5 languages) ----------

export type ServiceKey =
  | 'website'
  | 'reservation'
  | 'online-ordering'
  | 'in-store-ordering'
  | 'wheel-game'
  | 'ai-google'
  | 'e-reputation'
  | 'ai-photo'
  | 'social-media-campaign'
  | 'domain-fee'
  | 'sunmi-terminal'
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
      fr: 'Réservation en ligne',
      it: 'Prenotazione online',
      es: 'Reserva en línea',
      de: 'Online-Reservierung',
      zh: '在线预订',
    },
  },
  'online-ordering': {
    name: { fr: 'Commande en ligne', it: 'Ordini online', es: 'Pedidos en línea', de: 'Online-Bestellung', zh: '线上点单' },
    description: {
      fr: 'Commande à emporter / livraison',
      it: 'Asporto / consegna',
      es: 'Para llevar / entrega',
      de: 'Abholung / Lieferung',
      zh: '外卖 / 自取',
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
      fr: 'Collecte d\'informations clients · stimule le réachat',
      it: 'Raccolta di informazioni cliente · stimola il riacquisto',
      es: 'Recopilación de datos del cliente · impulsa la recompra',
      de: 'Erfassung von Kundendaten · fördert Wiederkäufe',
      zh: '收集客户信息 · 刺激客户再次消费',
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
    name: { fr: 'E-réputation', it: 'E-reputazione', es: 'E-reputación', de: 'Online-Reputation', zh: '线上口碑' },
    description: {
      fr: 'Gestion Google Business + optimisation de la réputation en ligne',
      it: 'Gestione Google Business + ottimizzazione della reputazione online',
      es: 'Gestión de Google Business + optimización de la reputación online',
      de: 'Google-Business-Verwaltung + Optimierung der Online-Reputation',
      zh: 'Google 商家管理 + 线上口碑优化',
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
  'social-media-campaign': {
    name: { fr: 'Forfait réseaux sociaux', it: 'Pacchetto social media', es: 'Pack redes sociales', de: 'Social-Media-Paket', zh: '社媒推广套餐' },
    description: {
      fr: 'Meta, Google Business, TikTok · publication et optimisation',
      it: 'Meta, Google Business, TikTok · pubblicazione e ottimizzazione',
      es: 'Meta, Google Business, TikTok · publicación y optimización',
      de: 'Meta, Google Business, TikTok · Veröffentlichung und Optimierung',
      zh: 'Meta、Google Business、TikTok · 内容发布与账号优化',
    },
  },
  'domain-fee': {
    name: { fr: 'Frais de nom de domaine', it: 'Costo dominio', es: 'Coste de dominio', de: 'Domaingebühr', zh: '域名费' },
    description: {
      fr: 'Perçu annuellement · reversé au fournisseur de nom de domaine',
      it: 'Riscossione annuale · riversata al fornitore del dominio',
      es: 'Cobro anual · transferido al proveedor del dominio',
      de: 'Jährlich erhoben · an den Domainanbieter weitergeleitet',
      zh: '管理配置域名，代收代缴域名费',
    },
  },
  'sunmi-terminal': {
    name: { fr: 'Terminal Sunmi', it: 'Terminale Sunmi', es: 'Terminal Sunmi', de: 'Sunmi-Terminal', zh: 'Sunmi 机器' },
    description: {
      fr: 'Terminal de caisse Sunmi · configuration OKO',
      it: 'Terminale cassa Sunmi · configurazione OKO',
      es: 'Terminal de caja Sunmi · configuración OKO',
      de: 'Sunmi-Kassenterminal · OKO-Konfiguration',
      zh: 'Sunmi 收银设备 · OKO 已配置',
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
      fr: 'Construction du site web',
      it: 'Realizzazione del sito web',
      es: 'Construcción del sitio web',
      de: 'Website-Erstellung',
      zh: '网站建设',
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
