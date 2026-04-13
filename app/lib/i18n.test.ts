import { describe, it, expect } from 'vitest'
import {
  ALL_LANGS,
} from './types'
import {
  LABELS,
  SERVICE_DICT,
  PACK_NAMES,
  DEFAULT_OBJET,
  tr,
  serviceName,
  serviceDesc,
  packName,
  packNameWithCount,
  findMissingTranslations,
  type ServiceKey,
} from './i18n'
import { CGV, CGV_ORDER } from './legal'

describe('i18n dictionary coverage', () => {
  it('has exactly 5 supported languages', () => {
    expect(ALL_LANGS).toEqual(['fr', 'it', 'es', 'de', 'zh'])
  })

  it('LABELS: every entry has all 5 languages non-empty (except legalFootnote.fr)', () => {
    const missing = findMissingTranslations()
    expect(missing).toEqual([])
  })

  it('SERVICE_DICT has exactly 13 entries', () => {
    expect(Object.keys(SERVICE_DICT)).toHaveLength(13)
  })

  it('SERVICE_DICT: each service name and description in all 5 languages', () => {
    for (const key of Object.keys(SERVICE_DICT) as ServiceKey[]) {
      const svc = SERVICE_DICT[key]
      for (const lang of ALL_LANGS) {
        expect(svc.name[lang], `${key}.name.${lang}`).toBeTruthy()
        expect(svc.description[lang], `${key}.description.${lang}`).toBeTruthy()
      }
    }
  })

  it('CGV has 8 active clauses, each in 5 languages', () => {
    expect(CGV_ORDER).toHaveLength(8)
    for (const key of CGV_ORDER) {
      const clause = CGV[key]
      for (const lang of ALL_LANGS) {
        expect(clause[lang], `CGV.${key}.${lang}`).toBeTruthy()
        expect(clause[lang].length, `CGV.${key}.${lang} length`).toBeGreaterThan(5)
      }
    }
  })

  it('PACK_NAMES has translations for all pack types', () => {
    for (const [k, v] of Object.entries(PACK_NAMES)) {
      for (const lang of ALL_LANGS) {
        expect(v[lang], `PACK_NAMES.${k}.${lang}`).toBeTruthy()
      }
    }
  })

  it('DEFAULT_OBJET has all 5 languages', () => {
    for (const lang of ALL_LANGS) {
      expect(DEFAULT_OBJET[lang], `DEFAULT_OBJET.${lang}`).toBeTruthy()
    }
  })
})

describe('i18n helpers', () => {
  it('tr() returns the requested language string', () => {
    expect(tr(LABELS.designation, 'fr')).toBe('DÉSIGNATION')
    expect(tr(LABELS.designation, 'zh')).toBe('服务项目')
    expect(tr(LABELS.designation, 'it')).toBe('DESCRIZIONE')
  })

  it('tr() falls back to fr when lang missing', () => {
    // TypeScript prevents it, but runtime test for robustness
    const broken = { fr: 'Foo', it: '', es: 'Foo-ES', de: 'Foo-DE', zh: 'Foo-ZH' } as const
    expect(tr(broken as never, 'it')).toBe('Foo') // empty → fallback
  })

  it('serviceName() returns localized service names', () => {
    expect(serviceName('website', 'fr')).toBe('Site web')
    expect(serviceName('website', 'zh')).toBe('商家主页')
    expect(serviceName('ai-photo', 'de')).toBe('KI-Fotos')
  })

  it('serviceDesc() returns localized descriptions', () => {
    expect(serviceDesc('reservation', 'fr')).toContain('Réservation en ligne')
    expect(serviceDesc('reservation', 'zh')).toContain('在线预订')
  })

  it('packName() returns the sur-mesure pack name per language', () => {
    expect(packName('surMesure', 'fr')).toBe('Pack sur mesure')
    expect(packName('surMesure', 'it')).toBe('Pacchetto su misura')
    expect(packName('surMesure', 'zh')).toBe('定制套餐')
  })

  it('packNameWithCount() appends localized service count', () => {
    expect(packNameWithCount(5, 'fr')).toContain('5 services')
    expect(packNameWithCount(5, 'zh')).toContain('5 个服务')
    expect(packNameWithCount(5, 'it')).toContain('5 servizi')
  })
})
