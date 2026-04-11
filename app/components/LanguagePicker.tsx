'use client'

import { useDevis } from './DevisContext'
import type { Lang } from '@/app/lib/types'

const LANGS: { lang: Lang; flag: string; label: string }[] = [
  { lang: 'fr', flag: '🇫🇷', label: 'FR' },
  { lang: 'it', flag: '🇮🇹', label: 'IT' },
  { lang: 'es', flag: '🇪🇸', label: 'ES' },
  { lang: 'de', flag: '🇩🇪', label: 'DE' },
  { lang: 'zh', flag: '🇨🇳', label: 'ZH' },
]

export default function LanguagePicker() {
  const { devis, dispatch } = useDevis()

  return (
    <div>
      <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>devis 语言</div>
      <div className="text-[9px] font-semibold tracking-[1.4px] mt-1 mb-3" style={{ color: '#9B8550' }}>
        LANGUE DU DEVIS  ·  切换语言后预览自动翻译
      </div>
      <div className="mt-3 mb-3" style={{ height: 1, backgroundColor: '#D4C58E', opacity: 0.5 }} />

      <div className="flex gap-[8px]">
        {LANGS.map((opt) => {
          const isActive = devis.lang === opt.lang
          return (
            <button
              key={opt.lang}
              type="button"
              onClick={() => dispatch({ type: 'SET_LANG', lang: opt.lang })}
              className="flex flex-col items-center justify-center rounded-[10px] transition-all"
              style={{
                width: 74,
                height: 52,
                backgroundColor: isActive ? '#1C1611' : '#F6EFDC',
              }}
              aria-label={`切换到 ${opt.label}`}
              aria-pressed={isActive}
            >
              <span className="text-[18px] leading-none">{opt.flag}</span>
              <span
                className="text-[10px] font-bold mt-1"
                style={{ color: isActive ? '#F5D48A' : '#8B7A3E' }}
              >
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
