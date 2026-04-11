'use client'

import { useDevis } from './DevisContext'
import type { Lang } from '@/app/lib/types'

const LANG_OPTIONS: { lang: Lang; flag: string; label: string }[] = [
  { lang: 'fr', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'FR' },
  { lang: 'it', flag: '\ud83c\uddee\ud83c\uddf9', label: 'IT' },
  { lang: 'es', flag: '\ud83c\uddea\ud83c\uddf8', label: 'ES' },
  { lang: 'de', flag: '\ud83c\udde9\ud83c\uddea', label: 'DE' },
  { lang: 'zh', flag: '\ud83c\udde8\ud83c\uddf3', label: 'ZH' },
]

export default function LanguagePicker() {
  const { devis, dispatch } = useDevis()

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider">
        输出语言
      </p>
      <div className="flex gap-2">
        {LANG_OPTIONS.map((opt) => {
          const isActive = devis.lang === opt.lang
          return (
            <button
              key={opt.lang}
              type="button"
              onClick={() => dispatch({ type: 'SET_LANG', lang: opt.lang })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all ${
                isActive
                  ? 'bg-[var(--ink)] text-white font-medium'
                  : 'bg-[var(--surface-alt)] text-[var(--ink-soft)] hover:bg-[var(--divider-soft)]'
              }`}
              aria-label={`切换到 ${opt.label}`}
              aria-pressed={isActive}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
