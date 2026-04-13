import type { BillingCadence, Contract, ContractSentChannel, ContractStatus, DevisItem, Lang } from './types'
import { OKO_SENDER } from './legal'
import { formatEuroCompact } from './calculations'

type ContractCopy = {
  title: string
  subtitlePrefix: string
  partiesTitle: string
  providerLabel: string
  clientLabel: string
  intro: string
  article1Title: string
  article1Intro: string
  article2Title: string
  article2Content: string
  article3Title: string
  article3Intro: string
  article3Point1Title: string
  article3Point1Content: string
  article3Point2Title: string
  article3Point2Content: string
  article4Title: string
  article4Content1: string
  article4Content2: string
  article5Title: string
  article5Intro: string
  article5a: string
  article5b: string
  article5c: string
  article6Title: string
  article6Content: string
  article7Title: string
  article7Intro: string
  article7CatalogLabel: string
  article7CatalogNote: string
  article7ClientChoice: string
  article7FinalPrice: string
  article7Note: string
  article8Title: string
  article8Placeholder: string
  madeIn: string
  madeOn: string
  inParis: string
  providerSignatureLabel: string
  clientSignatureLabel: string
  clientSignatureHint: string
  frenchLegalNote: string
  paymentMonthly: string
  paymentAnnual: string
  noServices: string
  total: string
  totalMonthly: string
  totalAnnual: string
}

export const CONTRACT_LANGUAGE_LABELS: Record<Lang, string> = {
  fr: 'FR',
  zh: '中',
  it: 'IT',
  de: 'DE',
  es: 'ES',
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: '草稿',
  generated: '已生成',
  sent: '已发送',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
}

export const CONTRACT_SENT_CHANNEL_LABELS: Record<ContractSentChannel, string> = {
  email: '邮件',
  feishu: '飞书',
  wechat: '微信',
  whatsapp: 'WhatsApp',
  in_person: '当面确认',
}

export const CONTRACT_COPY: Record<Lang, ContractCopy> = {
  fr: {
    title: 'Contrat de prestations de services',
    subtitlePrefix: 'Entre SAS OKO et le Client',
    partiesTitle: 'Parties contractantes',
    providerLabel: 'Le Prestataire',
    clientLabel: 'Le Client',
    intro: 'Il a été arrêté et convenu ce qui suit :',
    article1Title: 'Article 1 · Objet du contrat',
    article1Intro: 'La prestation comprend les services standards suivants :',
    article2Title: 'Article 2 · Durée',
    article2Content: "Ce contrat est passé, à priori, pour une durée indéterminée.",
    article3Title: 'Article 3 · Exécution de la prestation',
    article3Intro: "Le prestataire s'engage à mener à bien la tâche précisée à l'article premier, conformément aux règles de l'art et de la meilleure manière.",
    article3Point1Title: '3.1 Obligation de collaborer',
    article3Point1Content: "Le Client tiendra à la disposition du Prestataire toutes les informations pouvant contribuer à la bonne réalisation de l'objet du présent contrat. A cette fin, le Client désigne un interlocuteur privilégié.",
    article3Point2Title: '3.2 Obligation de validation',
    article3Point2Content: 'La réalisation du premier prélèvement sera effectuée lors de la réception et la validation du site internet par le Client.',
    article4Title: 'Article 4 · Résiliation et sanctions',
    article4Content1: "Ce contrat n'inclut pas de clause d'engagement. Le Client peut résilier le service à tout moment.",
    article4Content2: "Pour résilier l'abonnement, le Client doit envoyer un e-mail un mois avant l'échéance du contrat à support@joinoko.com.",
    article5Title: 'Article 5 · Restitution des données',
    article5Intro: "En fin de contrat, à la demande expresse du Client, le Prestataire peut restituer les données et informations suivantes :",
    article5a: 'Le code de transfert du domaine (AUTH code)',
    article5b: 'Les fiches clients (noms, prénoms, emails, téléphones, commandes et réservations)',
    article5c: 'Les images et textes publiés sur le site internet du Client',
    article6Title: 'Article 6 · Référencement',
    article6Content: 'Le Client accepte que le Prestataire puisse faire figurer parmi ses références les travaux accomplis dans le cadre du présent contrat.',
    article7Title: 'Article 7 · Facturation et prix',
    article7Intro: "Les prestations définies à l'article 1 ci-dessus seront facturées au Client selon la grille de référence suivante :",
    article7CatalogLabel: 'Catalogue OKO partagé',
    article7CatalogNote: 'Le présent contrat reprend directement les services retenus dans le devis, ou à défaut la sélection effectuée dans le catalogue partagé OKO.',
    article7ClientChoice: 'Forfait retenu pour le client',
    article7FinalPrice: 'Prix final convenu',
    article7Note: "Le Client peut choisir de payer mensuellement ou annuellement. En cas de paiement annuel, aucune restitution des frais ne sera effectuée en cas de résiliation anticipée.",
    article8Title: 'Article 8 · Conditions spécifiques et remarques',
    article8Placeholder: 'Aucune condition spécifique ajoutée.',
    madeIn: 'Le présent contrat est établi en deux (2) exemplaires originaux, un pour chaque partie.',
    madeOn: 'Fait le',
    inParis: 'à Paris',
    providerSignatureLabel: 'Pour le Prestataire',
    clientSignatureLabel: 'Pour le Client',
    clientSignatureHint: 'Précédé de la mention manuscrite « Bon pour accord »',
    frenchLegalNote: 'La version française du présent contrat fait foi en cas de litige.',
    paymentMonthly: 'Paiement mensuel',
    paymentAnnual: 'Paiement annuel',
    noServices: 'Aucun service sélectionné',
    total: 'Total',
    totalMonthly: '€ HT / mois',
    totalAnnual: '€ HT / an',
  },
  zh: {
    title: '服务合同',
    subtitlePrefix: 'SAS OKO 与客户之间',
    partiesTitle: '签约双方',
    providerLabel: '服务提供方',
    clientLabel: '客户',
    intro: '双方达成以下协议：',
    article1Title: '第一条 · 合同目的',
    article1Intro: '本合同覆盖以下标准服务内容：',
    article2Title: '第二条 · 期限',
    article2Content: '本合同原则上为无固定期限合同。',
    article3Title: '第三条 · 服务执行',
    article3Intro: '服务提供商承诺按照行业规范和最佳方式完成第一条规定的任务。',
    article3Point1Title: '3.1 合作义务',
    article3Point1Content: '客户应向服务提供商提供有助于本合同目标顺利实现的所有信息，并指定一名主要联系人负责沟通。',
    article3Point2Title: '3.2 验收义务',
    article3Point2Content: '首次扣款将在客户接收并验收网站后进行。',
    article4Title: '第四条 · 解约和违约',
    article4Content1: '本合同不包含强制履约条款。客户可随时终止服务。',
    article4Content2: '如需取消订阅，客户须在合同到期前一个月发送电子邮件至 support@joinoko.com。',
    article5Title: '第五条 · 数据返还',
    article5Intro: '合同终止时，应客户明确要求，服务提供商可返还以下数据和信息：',
    article5a: '域名转移码（AUTH 码）',
    article5b: '客户资料（姓名、邮箱、电话、订单和预订记录）',
    article5c: '客户网站上发布的图片和文字',
    article6Title: '第六条 · 参考案例',
    article6Content: '客户同意服务提供商可将本合同框架内完成的工作列入其参考案例。',
    article7Title: '第七条 · 计费与价格',
    article7Intro: '第一条所列服务将根据以下标准价格体系向客户收费：',
    article7CatalogLabel: '共享 OKO 产品目录',
    article7CatalogNote: '本合同直接引用报价单已选服务；如独立创建合同，则引用同一份 OKO 共享产品目录。',
    article7ClientChoice: '客户选定套餐',
    article7FinalPrice: '最终成交价',
    article7Note: '客户可选择按月或按年付款。如选择按年付款，提前解约将不予退款。',
    article8Title: '第八条 · 特殊条款和备注',
    article8Placeholder: '暂无特殊条款。',
    madeIn: '本合同一式两份，双方各执一份。',
    madeOn: '签署日期',
    inParis: '签署地点：巴黎',
    providerSignatureLabel: '服务提供方',
    clientSignatureLabel: '客户签字',
    clientSignatureHint: '请手写“确认接受”后签字',
    frenchLegalNote: '如发生争议，以本合同法文版本为准。',
    paymentMonthly: '月付',
    paymentAnnual: '年付',
    noServices: '未选择服务',
    total: '总计',
    totalMonthly: '欧元 / 月',
    totalAnnual: '欧元 / 年',
  },
  it: {
    title: 'Contratto di prestazione di servizi',
    subtitlePrefix: 'Tra SAS OKO e il Cliente',
    partiesTitle: 'Parti contraenti',
    providerLabel: 'Il Fornitore',
    clientLabel: 'Il Cliente',
    intro: 'Si è convenuto quanto segue:',
    article1Title: 'Articolo 1 · Oggetto del contratto',
    article1Intro: 'La prestazione comprende i seguenti servizi standard:',
    article2Title: 'Articolo 2 · Durata',
    article2Content: 'Il presente contratto è stipulato, in linea di principio, a tempo indeterminato.',
    article3Title: 'Articolo 3 · Esecuzione della prestazione',
    article3Intro: "Il fornitore si impegna a svolgere il compito specificato nell'articolo 1 conformemente alle regole dell'arte e nel miglior modo possibile.",
    article3Point1Title: '3.1 Obbligo di collaborazione',
    article3Point1Content: 'Il Cliente metterà a disposizione del Fornitore tutte le informazioni utili e designerà un interlocutore privilegiato per garantire il dialogo.',
    article3Point2Title: '3.2 Obbligo di validazione',
    article3Point2Content: 'Il primo addebito sarà effettuato al momento della ricezione e della validazione del sito internet da parte del Cliente.',
    article4Title: 'Articolo 4 · Risoluzione e sanzioni',
    article4Content1: 'Il presente contratto non include clausole di impegno. Il Cliente può recedere dal servizio in qualsiasi momento.',
    article4Content2: "Per annullare l'abbonamento, il Cliente deve inviare un'email un mese prima della scadenza del contratto a support@joinoko.com.",
    article5Title: 'Articolo 5 · Restituzione dei dati',
    article5Intro: 'Al termine del contratto, su espressa richiesta del Cliente, il Fornitore può restituire i seguenti dati e informazioni:',
    article5a: 'Il codice di trasferimento del dominio (AUTH code)',
    article5b: 'Le schede clienti (nomi, email, telefoni, ordini e prenotazioni)',
    article5c: 'Le immagini e i testi pubblicati sul sito internet del Cliente',
    article6Title: 'Articolo 6 · Referenze',
    article6Content: 'Il Cliente accetta che il Fornitore possa includere tra le sue referenze i lavori realizzati nell’ambito del presente contratto.',
    article7Title: 'Articolo 7 · Fatturazione e prezzo',
    article7Intro: "Le prestazioni definite nell'articolo 1 saranno fatturate al Cliente secondo la seguente griglia di riferimento:",
    article7CatalogLabel: 'Catalogo OKO condiviso',
    article7CatalogNote: 'Il presente contratto riprende direttamente i servizi selezionati nel devis oppure, in creazione diretta, la stessa selezione del catalogo condiviso OKO.',
    article7ClientChoice: 'Pacchetto scelto dal cliente',
    article7FinalPrice: 'Prezzo finale concordato',
    article7Note: 'Il Cliente può scegliere di pagare mensilmente o annualmente. In caso di pagamento annuale, non è previsto rimborso in caso di risoluzione anticipata.',
    article8Title: 'Articolo 8 · Condizioni specifiche e osservazioni',
    article8Placeholder: 'Nessuna condizione specifica aggiunta.',
    madeIn: 'Il presente contratto è redatto in due copie originali, una per ciascuna parte.',
    madeOn: 'Fatto il',
    inParis: 'a Parigi',
    providerSignatureLabel: 'Per il Fornitore',
    clientSignatureLabel: 'Per il Cliente',
    clientSignatureHint: 'Preceduto dalla menzione manoscritta « Per accettazione »',
    frenchLegalNote: 'In caso di controversia, fa fede la versione francese del presente contratto.',
    paymentMonthly: 'Pagamento mensile',
    paymentAnnual: 'Pagamento annuale',
    noServices: 'Nessun servizio selezionato',
    total: 'Totale',
    totalMonthly: '€ / mese',
    totalAnnual: '€ / anno',
  },
  de: {
    title: 'Dienstleistungsvertrag',
    subtitlePrefix: 'Zwischen SAS OKO und dem Kunden',
    partiesTitle: 'Vertragsparteien',
    providerLabel: 'Der Dienstleister',
    clientLabel: 'Der Kunde',
    intro: 'Es wurde Folgendes vereinbart:',
    article1Title: 'Artikel 1 · Vertragsgegenstand',
    article1Intro: 'Die Dienstleistung umfasst die folgenden Standardleistungen:',
    article2Title: 'Artikel 2 · Laufzeit',
    article2Content: 'Dieser Vertrag wird grundsätzlich auf unbestimmte Zeit geschlossen.',
    article3Title: 'Artikel 3 · Ausführung der Dienstleistung',
    article3Intro: 'Der Dienstleister verpflichtet sich, die in Artikel 1 genannte Aufgabe nach den Regeln der Kunst und bestmöglich auszuführen.',
    article3Point1Title: '3.1 Mitwirkungspflicht',
    article3Point1Content: 'Der Kunde stellt dem Dienstleister alle notwendigen Informationen zur Verfügung und benennt einen Ansprechpartner für den laufenden Austausch.',
    article3Point2Title: '3.2 Abnahmepflicht',
    article3Point2Content: 'Die erste Abbuchung erfolgt bei Erhalt und Abnahme der Website durch den Kunden.',
    article4Title: 'Artikel 4 · Kündigung und Sanktionen',
    article4Content1: 'Dieser Vertrag enthält keine Bindungsklausel. Der Kunde kann den Dienst jederzeit kündigen.',
    article4Content2: 'Um das Abonnement zu kündigen, muss der Kunde einen Monat vor Vertragsablauf eine E-Mail an support@joinoko.com senden.',
    article5Title: 'Artikel 5 · Datenrückgabe',
    article5Intro: 'Bei Vertragsende kann der Dienstleister auf ausdrücklichen Wunsch des Kunden folgende Daten und Informationen zurückgeben:',
    article5a: 'Der Domain-Transfercode (AUTH-Code)',
    article5b: 'Kundendaten (Namen, E-Mails, Telefonnummern, Bestellungen und Reservierungen)',
    article5c: 'Die auf der Website des Kunden veröffentlichten Bilder und Texte',
    article6Title: 'Artikel 6 · Referenzen',
    article6Content: 'Der Kunde erklärt sich damit einverstanden, dass der Dienstleister die im Rahmen dieses Vertrags durchgeführten Arbeiten als Referenz verwenden darf.',
    article7Title: 'Artikel 7 · Abrechnung und Preise',
    article7Intro: 'Die in Artikel 1 definierten Leistungen werden dem Kunden nach folgender Referenzpreisliste in Rechnung gestellt:',
    article7CatalogLabel: 'Geteilter OKO-Katalog',
    article7CatalogNote: 'Dieser Vertrag übernimmt direkt die im Devis ausgewählten Leistungen oder bei direkter Erstellung dieselbe Auswahl aus dem gemeinsamen OKO-Katalog.',
    article7ClientChoice: 'Für den Kunden ausgewähltes Paket',
    article7FinalPrice: 'Vereinbarter Endpreis',
    article7Note: 'Der Kunde kann monatlich oder jährlich zahlen. Bei jährlicher Zahlung erfolgt keine Erstattung bei vorzeitiger Vertragskündigung.',
    article8Title: 'Artikel 8 · Besondere Bedingungen und Hinweise',
    article8Placeholder: 'Keine besonderen Bedingungen hinzugefügt.',
    madeIn: 'Dieser Vertrag wird in zwei Originalausfertigungen erstellt, eine für jede Partei.',
    madeOn: 'Erstellt am',
    inParis: 'in Paris',
    providerSignatureLabel: 'Für den Dienstleister',
    clientSignatureLabel: 'Für den Kunden',
    clientSignatureHint: 'Mit handschriftlichem Vermerk „Einverstanden“',
    frenchLegalNote: 'Im Streitfall ist die französische Fassung dieses Vertrags maßgeblich.',
    paymentMonthly: 'Monatliche Zahlung',
    paymentAnnual: 'Jährliche Zahlung',
    noServices: 'Kein Service ausgewählt',
    total: 'Gesamt',
    totalMonthly: '€ / Monat',
    totalAnnual: '€ / Jahr',
  },
  es: {
    title: 'Contrato de prestación de servicios',
    subtitlePrefix: 'Entre SAS OKO y el Cliente',
    partiesTitle: 'Partes contratantes',
    providerLabel: 'El Prestador',
    clientLabel: 'El Cliente',
    intro: 'Se ha acordado lo siguiente:',
    article1Title: 'Artículo 1 · Objeto del contrato',
    article1Intro: 'La prestación incluye los siguientes servicios estándar:',
    article2Title: 'Artículo 2 · Duración',
    article2Content: 'Este contrato se celebra, en principio, por tiempo indefinido.',
    article3Title: 'Artículo 3 · Ejecución de la prestación',
    article3Intro: 'El prestador se compromete a llevar a cabo la tarea especificada en el artículo 1 conforme a las reglas del arte y de la mejor manera.',
    article3Point1Title: '3.1 Obligación de colaborar',
    article3Point1Content: 'El Cliente pondrá a disposición del Prestador toda la información útil y designará un interlocutor principal para asegurar el diálogo.',
    article3Point2Title: '3.2 Obligación de validación',
    article3Point2Content: 'El primer cargo se realizará en el momento de la recepción y validación del sitio web por parte del Cliente.',
    article4Title: 'Artículo 4 · Resolución y sanciones',
    article4Content1: 'Este contrato no incluye cláusula de compromiso. El Cliente puede rescindir el servicio en cualquier momento.',
    article4Content2: 'Para cancelar la suscripción, el Cliente debe enviar un correo electrónico un mes antes del vencimiento del contrato a support@joinoko.com.',
    article5Title: 'Artículo 5 · Devolución de datos',
    article5Intro: 'Al finalizar el contrato, a petición expresa del Cliente, el Prestador puede devolver los siguientes datos e información:',
    article5a: 'El código de transferencia del dominio (código AUTH)',
    article5b: 'Las fichas de clientes (nombres, correos, teléfonos, pedidos y reservas)',
    article5c: 'Las imágenes y textos publicados en el sitio web del Cliente',
    article6Title: 'Artículo 6 · Referencias',
    article6Content: 'El Cliente acepta que el Prestador pueda incluir entre sus referencias los trabajos realizados en el marco del presente contrato.',
    article7Title: 'Artículo 7 · Facturación y precio',
    article7Intro: 'Los servicios definidos en el artículo 1 se facturarán al Cliente según la siguiente tarifa de referencia:',
    article7CatalogLabel: 'Catálogo compartido de OKO',
    article7CatalogNote: 'Este contrato retoma directamente los servicios elegidos en el devis o, si se crea sin devis, la misma selección del catálogo compartido de OKO.',
    article7ClientChoice: 'Paquete elegido por el cliente',
    article7FinalPrice: 'Precio final acordado',
    article7Note: 'El Cliente puede elegir pagar mensualmente o anualmente. En caso de pago anual, no se realizará ningún reembolso en caso de resolución anticipada.',
    article8Title: 'Artículo 8 · Condiciones específicas y observaciones',
    article8Placeholder: 'No se añadieron condiciones específicas.',
    madeIn: 'El presente contrato se establece en dos ejemplares originales, uno para cada parte.',
    madeOn: 'Hecho el',
    inParis: 'en París',
    providerSignatureLabel: 'Por el Prestador',
    clientSignatureLabel: 'Por el Cliente',
    clientSignatureHint: 'Precedido de la mención manuscrita « Aprobado »',
    frenchLegalNote: 'En caso de litigio, prevalece la versión francesa del presente contrato.',
    paymentMonthly: 'Pago mensual',
    paymentAnnual: 'Pago anual',
    noServices: 'Ningún servicio seleccionado',
    total: 'Total',
    totalMonthly: '€ / mes',
    totalAnnual: '€ / año',
  },
}

const STANDARD_SERVICE_LINES: Record<Lang, string[]> = {
  fr: [
    "Création et gestion d'un site internet",
    'Services de réservation en ligne, commande à emporter et livraison sur le site internet (sans commission)',
    'Création des pages du restaurant sur Google, TripAdvisor, Yelp, Facebook',
    'Application mobile OKO Pro pour la gestion des réservations, commandes, QR codes et impressions',
    'Design de QR codes pour les tables',
    'Kit marketing (autocollants, poster)',
    'Image en ligne / Réputation : Optimisation Google',
    'Jeu de roulette',
  ],
  zh: [
    '网站的创建和管理',
    '网站在线预订、外卖和配送服务（无佣金）',
    '在 Google、TripAdvisor、Yelp、Facebook 上创建餐厅页面',
    'OKO Pro 移动应用，用于管理预订、订单、桌面二维码和打印',
    '餐桌二维码设计',
    '营销套件（贴纸、海报）',
    '网络形象 / 声誉：Google 优化',
    '转盘游戏',
  ],
  it: [
    'Creazione e gestione di un sito internet',
    'Servizi di prenotazione online, ordini da asporto e consegna sul sito internet',
    'Creazione delle pagine del ristorante su Google, TripAdvisor, Yelp, Facebook',
    'Applicazione mobile OKO Pro per prenotazioni, ordini, QR code e stampe',
    'Design dei QR code per i tavoli',
    'Kit marketing (adesivi, poster)',
    'Immagine online / Reputazione: Ottimizzazione Google',
    'Gioco della roulette',
  ],
  de: [
    'Erstellung und Verwaltung einer Website',
    'Online-Reservierung, Abholung und Lieferung über die Website',
    'Erstellung der Restaurantseiten auf Google, TripAdvisor, Yelp, Facebook',
    'Mobile App OKO Pro für Reservierungen, Bestellungen, QR-Codes und Druck',
    'Design von QR-Codes für die Tische',
    'Marketing-Kit (Aufkleber, Poster)',
    'Online-Image / Reputation: Google-Optimierung',
    'Glücksrad-Spiel',
  ],
  es: [
    'Creación y gestión de un sitio web',
    'Servicios de reserva en línea, pedidos para llevar y entrega en el sitio web',
    'Creación de las páginas del restaurante en Google, TripAdvisor, Yelp, Facebook',
    'Aplicación móvil OKO Pro para reservas, pedidos, códigos QR e impresiones',
    'Diseño de códigos QR para las mesas',
    'Kit de marketing (pegatinas, póster)',
    'Imagen en línea / Reputación: Optimización de Google',
    'Juego de ruleta',
  ],
}

export function getContractCopy(lang: Lang): ContractCopy {
  return CONTRACT_COPY[lang]
}

export function getStandardServiceLines(lang: Lang): string[] {
  return STANDARD_SERVICE_LINES[lang]
}

export function formatContractDate(dateString: string, lang: Lang): string {
  if (!dateString) return '_______________'
  const date = new Date(dateString)
  const locales: Record<Lang, string> = {
    fr: 'fr-FR',
    zh: 'zh-CN',
    it: 'it-IT',
    de: 'de-DE',
    es: 'es-ES',
  }

  return new Intl.DateTimeFormat(locales[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function getSelectedServiceSummaries(contract: Contract): string[] {
  const copy = getContractCopy(contract.lang)

  if (!contract.selectedServices.length) {
    return [copy.noServices]
  }

  return contract.selectedServices.map((item) => {
    const name = getDevisItemName(item, contract.lang)
    const amount = formatEuroCompact(getContractServicePrice(item, contract.paymentMode))
    return `${name} · ${amount}`
  })
}

export function getContractReferenceTotal(items: DevisItem[], paymentMode: Contract['paymentMode']): number {
  return items.reduce((sum, item) => sum + getContractServicePrice(item, paymentMode), 0)
}

function getDevisItemName(item: DevisItem, lang: Lang): string {
  if (item.kind === 'package') return item.nameSnapshot[lang] || item.nameSnapshot.fr
  return item.nameSnapshot[lang] || item.nameSnapshot.fr
}

function getItemPrice(item: DevisItem): number {
  if (item.kind === 'package') {
    return item.preferredMode === 'monthly' ? item.monthlyPrice : item.annualPrice
  }

  if (typeof item.lineTotalOverride === 'number') return item.lineTotalOverride
  return item.qty * item.unitPrice
}

function getRecurringLinePrice(item: Extract<DevisItem, { kind: 'line' }>, paymentMode: Contract['paymentMode']): number {
  if (item.billingCadence === 'monthly') return paymentMode === 'monthly' ? item.unitPrice : item.unitPrice * 12
  if (item.billingCadence === 'annual') return item.unitPrice
  return getItemPrice(item)
}

export function getContractServicePrice(item: DevisItem, paymentMode: Contract['paymentMode']): number {
  if (item.kind === 'package') {
    return paymentMode === 'monthly' ? item.monthlyPrice : item.annualPrice
  }

  return getRecurringLinePrice(item, paymentMode)
}

export function getContractPriceHint(item: DevisItem, lang: Lang, paymentMode: Contract['paymentMode']): string {
  const amount = formatEuroCompact(getContractServicePrice(item, paymentMode))

  if (item.kind === 'package') {
    return `${amount} · ${paymentMode === 'monthly' ? getBillingLabel('monthly', lang) : getBillingLabel('annual', lang)}`
  }

  if (item.billingCadence === 'monthly' || item.billingCadence === 'annual') {
    return `${amount} · ${getBillingLabel(paymentMode, lang)}`
  }

  return `${amount} · ${getBillingLabel(item.billingCadence, lang)}`
}

function getBillingLabel(cadence: BillingCadence, lang: Lang): string {
  const labels: Record<BillingCadence, Record<Lang, string>> = {
    monthly: {
      fr: 'catalogue mensuel',
      zh: '按月目录价',
      it: 'catalogo mensile',
      de: 'Monatstarif',
      es: 'tarifa mensual',
    },
    annual: {
      fr: 'catalogue annuel',
      zh: '按年目录价',
      it: 'catalogo annuale',
      de: 'Jahrestarif',
      es: 'tarifa anual',
    },
    oneOff: {
      fr: 'frais uniques',
      zh: '一次性费用',
      it: 'costo una tantum',
      de: 'einmalige Gebühr',
      es: 'cargo único',
    },
    perUnit: {
      fr: 'à l’unité',
      zh: '按件计费',
      it: 'a unità',
      de: 'pro Einheit',
      es: 'por unidad',
    },
  }

  return labels[cadence][lang]
}

export function getPaymentModeLabel(contract: Contract): string {
  const copy = getContractCopy(contract.lang)
  return contract.paymentMode === 'monthly' ? copy.paymentMonthly : copy.paymentAnnual
}

export function getTotalUnitLabel(contract: Contract): string {
  const copy = getContractCopy(contract.lang)
  return contract.totalUnit === 'monthly' ? copy.totalMonthly : copy.totalAnnual
}

export function buildProviderLines(): string[] {
  return [
    'SAS OKO',
    `${OKO_SENDER.address}, ${OKO_SENDER.postalCode} ${OKO_SENDER.city}`,
    `RCS Paris ${OKO_SENDER.siren} 00015`,
    'Représentée par M. Shengmao KE, Président',
    OKO_SENDER.email,
  ]
}
