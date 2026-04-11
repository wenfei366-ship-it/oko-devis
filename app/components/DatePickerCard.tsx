'use client'

import { useDevis } from './DevisContext'
import { LABELS } from '@/app/lib/i18n'

export default function DatePickerCard() {
  const { devis, dispatch } = useDevis()
  const updateTitle = (value: string) => {
    dispatch({
      type: 'UPDATE_META',
      meta: {
        title: {
          fr: value,
          it: value,
          es: value,
          de: value,
          zh: value,
        },
      },
    })
  }

  const updateObjet = (value: string) => {
    dispatch({
      type: 'UPDATE_META',
      meta: {
        objet: {
          fr: value,
          it: value,
          es: value,
          de: value,
          zh: value,
        },
      },
    })
  }

  return (
    <div>
      <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>报价主题与日期</div>
      <div className="text-[9px] font-semibold tracking-[1.6px] mt-1" style={{ color: '#9B8550' }}>
        OBJET / DATE  ·  auto, éditable
      </div>
      <div className="mt-3 mb-3" style={{ height: 1, backgroundColor: '#D4C58E', opacity: 0.5 }} />

      <div className="text-[9px] font-medium tracking-[0.6px] mb-1" style={{ color: '#9B8550' }}>
        标题  ·  TITRE
      </div>
      <input
        type="text"
        value={devis.meta.title?.[devis.lang] ?? LABELS.devisTitle[devis.lang]}
        onChange={(e) => updateTitle(e.target.value)}
        className="w-full border-none outline-none rounded-[10px] px-4 text-[14px] font-bold"
        style={{ height: 44, backgroundColor: '#F6EFDC', color: '#1C1611' }}
        aria-label="Devis 标题"
      />

      <div className="mt-3 text-[9px] font-medium tracking-[0.6px] mb-1" style={{ color: '#9B8550' }}>
        主题  ·  OBJET
      </div>
      <textarea
        value={devis.meta.objet[devis.lang]}
        onChange={(e) => updateObjet(e.target.value)}
        className="w-full border-none outline-none rounded-[10px] px-4 py-3 text-[13px] font-semibold resize-none"
        style={{ minHeight: 76, backgroundColor: '#F6EFDC', color: '#1C1611' }}
        aria-label="Devis OBJET"
      />

      <div className="mt-3 text-[9px] font-medium tracking-[0.6px] mb-1" style={{ color: '#9B8550' }}>
        日期  ·  DATE
      </div>
      <div
        className="flex items-center gap-2 rounded-[10px] px-4"
        style={{ height: 44, backgroundColor: '#F6EFDC' }}
      >
        <span className="text-[14px]" style={{ color: '#B8922F' }}>▤</span>
        <input
          type="date"
          value={devis.meta.date}
          onChange={(e) => dispatch({ type: 'UPDATE_META', meta: { date: e.target.value } })}
          className="flex-1 bg-transparent border-none outline-none text-[14px] font-bold"
          style={{ color: '#1C1611' }}
          aria-label="Devis 日期"
        />
        <span className="text-[12px]" style={{ color: '#9B8550' }}>▾</span>
      </div>
    </div>
  )
}
