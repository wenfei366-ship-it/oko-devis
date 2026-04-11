// OKO Devis Generator — discount presets
// Users can also create custom discounts via the UI.

import type { Discount, I18nString } from './types'

export const DISCOUNT_NONE: Discount = { kind: 'none' }

export const DISCOUNT_PRESETS: Discount[] = [
  DISCOUNT_NONE,
  {
    kind: 'percent',
    value: 30,
    label: {
      fr: 'Grand pack −30 %',
      it: 'Grande pacchetto −30 %',
      es: 'Gran paquete −30 %',
      de: 'Großes Paket −30 %',
      zh: '大套餐 −30 %',
    } as I18nString,
    scope: 'recurring',
  },
  {
    kind: 'percent',
    value: 40,
    label: {
      fr: 'Grand pack premium −40 %',
      it: 'Pacchetto premium −40 %',
      es: 'Paquete premium −40 %',
      de: 'Premium-Paket −40 %',
      zh: '高级套餐 −40 %',
    } as I18nString,
    scope: 'recurring',
  },
  {
    kind: 'fixed',
    value: 700,
    label: {
      fr: 'Remise personnalisée −700 €',
      it: 'Sconto personalizzato −700 €',
      es: 'Descuento personalizado −700 €',
      de: 'Individueller Rabatt −700 €',
      zh: '定制折扣 −700 €',
    } as I18nString,
    scope: 'all',
  },
]
