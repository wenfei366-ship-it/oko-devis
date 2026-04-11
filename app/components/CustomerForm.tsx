'use client'

import { useDevis } from './DevisContext'
import type { Country } from '@/app/lib/types'

export default function CustomerForm() {
  const { devis, dispatch } = useDevis()
  const c = devis.customer
  const update = (patch: Partial<typeof c>) => dispatch({ type: 'UPDATE_CUSTOMER', customer: patch })

  const fieldStyle = {
    height: 40, backgroundColor: '#F6EFDC', borderRadius: 8, border: 'none',
    paddingLeft: 14, paddingRight: 14, fontSize: 13, fontWeight: 600 as const,
    color: '#1C1611', width: '100%', outline: 'none',
  }
  const labelStyle = { fontSize: 9, fontWeight: 500 as const, letterSpacing: 0.6, color: '#9B8550', marginBottom: 4 }

  return (
    <div>
      <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>客户信息</div>
      <div className="text-[9px] font-semibold tracking-[1.6px] mt-1" style={{ color: '#9B8550' }}>
        DESTINATAIRE  ·  à remplir
      </div>
      <div className="mt-3 mb-4" style={{ height: 1, backgroundColor: '#D4C58E', opacity: 0.5 }} />

      <div style={labelStyle}>餐厅名  ·  RAISON SOCIALE</div>
      <input type="text" value={c.name} onChange={(e) => update({ name: e.target.value })} placeholder="Restaurant Koï" style={fieldStyle} />

      <div className="mt-3" style={labelStyle}>地址  ·  ADRESSE</div>
      <input type="text" value={c.address} onChange={(e) => update({ address: e.target.value })} placeholder="12 rue Saint-Dominique" style={fieldStyle} />

      <div className="mt-3" style={labelStyle}>邮编 + 城市  ·  CP / VILLE</div>
      <div className="flex gap-2">
        <input type="text" value={c.postalCode} onChange={(e) => update({ postalCode: e.target.value })} placeholder="75007" style={{ ...fieldStyle, width: 100 }} />
        <input type="text" value={c.city} onChange={(e) => update({ city: e.target.value })} placeholder="Paris" style={{ ...fieldStyle, flex: 1, width: 'auto' }} />
      </div>

      <div className="mt-3" style={labelStyle}>联系人  ·  CONTACT</div>
      <input type="text" value={c.contactName} onChange={(e) => update({ contactName: e.target.value })} placeholder="Martin L." style={fieldStyle} />

      <div className="mt-3" style={labelStyle}>邮箱  ·  EMAIL</div>
      <input type="email" value={c.email} onChange={(e) => update({ email: e.target.value })} placeholder="contact@koi-paris.fr" style={fieldStyle} />

      <div className="mt-3" style={labelStyle}>电话  ·  TÉLÉPHONE</div>
      <input type="tel" value={c.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+33 1 45 55 66 77" style={fieldStyle} />

      <div className="mt-3" style={labelStyle}>国家</div>
      <select
        value={c.country}
        onChange={(e) => update({ country: e.target.value as Country })}
        style={{ ...fieldStyle, appearance: 'none' as const, cursor: 'pointer' }}
      >
        <option value="FR">🇫🇷 France</option>
        <option value="IT">🇮🇹 Italie</option>
        <option value="ES">🇪🇸 Espagne</option>
        <option value="DE">🇩🇪 Allemagne</option>
        <option value="BE">🇧🇪 Belgique</option>
        <option value="CH">🇨🇭 Suisse</option>
        <option value="LU">🇱🇺 Luxembourg</option>
        <option value="OTHER">Autre</option>
      </select>
    </div>
  )
}
