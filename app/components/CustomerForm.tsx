'use client'

import { useDevis } from './DevisContext'

export function CustomerForm() {
  const { devis, updateCustomer } = useDevis()
  const c = devis.customer

  const input =
    'w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition'
  const label = 'text-[10px] font-semibold tracking-[0.14em] text-[var(--ink-soft)] uppercase mb-1 block'

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-[10px] font-semibold tracking-[0.2em] text-[var(--gold)] uppercase mb-4">
        Destinataire (Restaurant)
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={label}>Nom du restaurant *</label>
          <input
            className={input}
            placeholder="Restaurant Koï"
            value={c.name}
            onChange={(e) => updateCustomer({ name: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Contact</label>
          <input
            className={input}
            placeholder="M. / Mme Martin"
            value={c.contactName}
            onChange={(e) => updateCustomer({ contactName: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Forme juridique</label>
          <input
            className={input}
            placeholder="SARL, SAS, EI..."
            value={c.legalForm ?? ''}
            onChange={(e) => updateCustomer({ legalForm: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Adresse</label>
          <input
            className={input}
            placeholder="12 rue de Rivoli"
            value={c.address}
            onChange={(e) => updateCustomer({ address: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Code postal</label>
          <input
            className={input}
            placeholder="75007"
            value={c.postalCode}
            onChange={(e) => updateCustomer({ postalCode: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Ville</label>
          <input
            className={input}
            placeholder="Paris"
            value={c.city}
            onChange={(e) => updateCustomer({ city: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            className={input}
            placeholder="contact@restaurant.fr"
            value={c.email}
            onChange={(e) => updateCustomer({ email: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Téléphone</label>
          <input
            className={input}
            placeholder="+33 1 23 45 67 89"
            value={c.phone}
            onChange={(e) => updateCustomer({ phone: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>SIREN</label>
          <input
            className={input}
            placeholder="123 456 789"
            value={c.siren ?? ''}
            onChange={(e) => updateCustomer({ siren: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>N° TVA intra.</label>
          <input
            className={input}
            placeholder="FR00 123 456 789"
            value={c.tva ?? ''}
            onChange={(e) => updateCustomer({ tva: e.target.value })}
          />
        </div>
      </div>
    </section>
  )
}
