import type { Service } from './types'

// Real OKO service catalog — extracted from 6 sample devis PDFs
// (Koï, amiro, DELICE D'ASIE, NAMIYA RAMEN, Wu Taiyo Fusion, Akama tibet)
export const CATALOG: Service[] = [
  // --- CORE subscription modules (forfait section) ---
  {
    id: 'website',
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    nameFr: 'Site web',
    nameCn: '商家主页',
    description: 'Site vitrine multilingue · SEO optimisé · responsive mobile · menu en ligne',
    defaultPrice: 30,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  },
  {
    id: 'reservation',
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    nameFr: 'Système de réservation',
    nameCn: '订位系统',
    description: 'Prise de réservation en ligne · confirmation email automatique · multilingue',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  },
  {
    id: 'online-ordering',
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    nameFr: 'Commande en ligne (emballage + livraison)',
    nameCn: '线上点单（打包+外卖）',
    description: 'Click & collect et livraison · zones par code postal · paiement en ligne',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  },
  {
    id: 'in-store-ordering',
    category: 'core',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    nameFr: 'Commande sur place',
    nameCn: '店内点单',
    description: 'QR code à table + système de commande serveur · intégré avec la caisse',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  },

  // --- MARKETING modules ---
  {
    id: 'wheel-game',
    category: 'marketing',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    nameFr: 'Jeu de la roue (grand jeu marketing)',
    nameCn: '抽奖大转盘游戏',
    description: 'Roue de la fortune personnalisable · prix et règles modifiables · 100 % gagnant',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  },
  {
    id: 'ia-google',
    category: 'marketing',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    nameFr: 'Réponses intelligentes IA aux avis Google',
    nameCn: '谷歌AI智能回复',
    description: 'Réponses automatiques personnalisées 24/7 · multilingue · ton de marque',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  },
  {
    id: 'e-reputation',
    category: 'marketing',
    billingCadence: 'monthly',
    pdfSection: 'forfait',
    nameFr: "Gestion de l'image et e-réputation en ligne",
    nameCn: '图片管理 / 线上口碑',
    description: 'Photos Google · monitoring avis · publication mensuelle · blocage avis négatifs',
    defaultPrice: 50,
    unit: 'mois',
    defaultQty: 12,
    recurringEligible: true,
  },
  {
    id: 'social-media',
    category: 'marketing',
    billingCadence: 'monthly',
    pdfSection: 'complement',
    nameFr: 'Forfait Réseaux sociaux (Meta · Google · TikTok)',
    nameCn: '社交媒体推广套餐',
    description: 'Création de contenu + optimisation comptes professionnels · publications planifiées',
    defaultPrice: 300,
    unit: 'mois',
    defaultQty: 1,
    recurringEligible: true,
  },

  // --- CONTENT services (per unit) ---
  {
    id: 'ai-photo',
    category: 'content',
    billingCadence: 'perUnit',
    pdfSection: 'complement',
    nameFr: 'Photographie de plats par IA',
    nameCn: 'AI拍菜品',
    description: 'Photo professionnelle de plats générée par IA · tarif promotionnel devis (au lieu de 10 €)',
    defaultPrice: 5,
    unit: 'photo',
    defaultQty: 10,
    recurringEligible: false,
  },

  // --- FEES (annual / one-off) ---
  {
    id: 'domain',
    category: 'fees',
    billingCadence: 'annual',
    pdfSection: 'complement',
    nameFr: 'Frais de nom de domaine',
    nameCn: '域名费',
    description: "Perçu annuellement (reversé à l'entreprise de nom de domaine)",
    defaultPrice: 20,
    unit: 'an',
    defaultQty: 1,
    recurringEligible: true,
  },
  {
    id: 'website-setup',
    category: 'fees',
    billingCadence: 'oneOff',
    pdfSection: 'complement',
    nameFr: 'Frais de création de site web',
    nameCn: '建站费',
    description: "Facturé lors de la soumission de la démo du site · remise devis applicable (5 ou 8 / 10)",
    defaultPrice: 100,
    unit: 'unique',
    defaultQty: 1,
    recurringEligible: false,
  },

  // --- HARDWARE ---
  {
    id: 'printer-wifi',
    category: 'hardware',
    billingCadence: 'oneOff',
    pdfSection: 'hardware',
    nameFr: 'Imprimante WiFi',
    nameCn: 'WiFi 打印机',
    description: 'Imprimante ticket WiFi compatible avec le système OKO',
    defaultPrice: 120,
    unit: 'unit',
    defaultQty: 1,
    recurringEligible: false,
  },
  {
    id: 'printer-sunmi',
    category: 'hardware',
    billingCadence: 'oneOff',
    pdfSection: 'hardware',
    nameFr: 'Imprimante Sunmi 2 (auto-ticket)',
    nameCn: 'Sunmi 2 自动出单打印机',
    description: 'Imprimante autonome Sunmi 2 · sortie automatique de tickets',
    defaultPrice: 240,
    unit: 'unit',
    defaultQty: 1,
    recurringEligible: false,
  },
]

export const CATEGORY_LABELS: Record<Service['category'], string> = {
  core: 'Modules essentiels',
  marketing: 'Marketing & visibilité',
  content: 'Contenu à la demande',
  fees: 'Frais de mise en place',
  hardware: 'Matériel',
}

export function getServiceById(id: string): Service | undefined {
  return CATALOG.find((s) => s.id === id)
}

export function getDefaultQtyLabel(service: Service): string {
  switch (service.unit) {
    case 'mois':
      return `${service.defaultQty} mois`
    case 'an':
      return `${service.defaultQty} an${service.defaultQty > 1 ? 's' : ''}`
    case 'photo':
      return 'À la carte'
    case 'unique':
      return 'Forfait unique'
    case 'unit':
      return `${service.defaultQty} unité${service.defaultQty > 1 ? 's' : ''}`
  }
}
