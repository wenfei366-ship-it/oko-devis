'use client'

import { useDevis } from './DevisContext'
import type { Country } from '@/app/lib/types'

const COUNTRIES: { value: Country; label: string }[] = [
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italie' },
  { value: 'ES', label: 'Espagne' },
  { value: 'DE', label: 'Allemagne' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'OTHER', label: 'Autre' },
]

export default function CustomerForm() {
  const { devis, dispatch } = useDevis()
  const { customer } = devis

  const update = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_CUSTOMER', customer: { [field]: value } })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wider">
        客户信息
      </p>

      <div className="space-y-2">
        <Field
          label="餐厅名"
          value={customer.name}
          onChange={(v) => update('name', v)}
          placeholder="Restaurant XYZ"
        />
        <Field
          label="地址"
          value={customer.address}
          onChange={(v) => update('address', v)}
          placeholder="12 rue de la Paix"
        />
        <div className="flex gap-2">
          <Field
            label="邮编"
            value={customer.postalCode}
            onChange={(v) => update('postalCode', v)}
            placeholder="75001"
            className="w-[100px]"
          />
          <Field
            label="城市"
            value={customer.city}
            onChange={(v) => update('city', v)}
            placeholder="Paris"
            className="flex-1"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--ink-muted)] mb-1">国家</label>
          <select
            value={customer.country}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_CUSTOMER',
                customer: { country: e.target.value as Country },
              })
            }
            className="w-full text-sm px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white focus:outline-none focus:border-[var(--gold)] transition-colors"
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="联系人"
          value={customer.contactName}
          onChange={(v) => update('contactName', v)}
          placeholder="Martin L."
        />
        <Field
          label="邮箱"
          value={customer.email}
          onChange={(v) => update('email', v)}
          placeholder="contact@restaurant.fr"
          type="email"
        />
        <Field
          label="电话"
          value={customer.phone}
          onChange={(v) => update('phone', v)}
          placeholder="+33 1 23 45 67 89"
          type="tel"
        />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-[var(--ink-muted)] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-white focus:outline-none focus:border-[var(--gold)] transition-colors"
      />
    </div>
  )
}
