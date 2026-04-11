'use client'

import { useDevis } from './DevisContext'

export default function DatePickerCard() {
  const { devis, dispatch } = useDevis()

  return (
    <div>
      <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>日期</div>
      <div className="text-[9px] font-semibold tracking-[1.6px] mt-1" style={{ color: '#9B8550' }}>
        DATE  ·  auto, éditable
      </div>
      <div className="mt-3 mb-3" style={{ height: 1, backgroundColor: '#D4C58E', opacity: 0.5 }} />
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
