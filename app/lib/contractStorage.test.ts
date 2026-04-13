import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Contract, Devis } from './types'
import { uuid } from './numbering'

type Row = {
  workspace_id: string
  contract_id: string
  devis_id: string | null
  contract: Contract
  saved_at: string
  created_at: string
}

const rows: Row[] = []

const i18n = (s: string) => ({ fr: s, it: s, es: s, de: s, zh: s })

function mkDevis(id?: string): Devis {
  return {
    id: id ?? uuid(),
    meta: { number: 'DRAFT-2026-001-TEST', date: '2026-01-01', validityDays: 30, objet: i18n('test'), startDate: '2026-02-01' },
    customer: { name: 'Test', address: '1 rue test', postalCode: '75001', city: 'Paris', country: 'FR', contactName: 'Martin', email: 'm@test.com', phone: '0600000000' },
    items: [],
    discount: { kind: 'none' },
    notes: 'demo',
    lang: 'fr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function buildDeleteQuery() {
  return {
    match(filters: { workspace_id?: string; contract_id?: string }) {
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        const matchesWorkspace = !filters.workspace_id || rows[index].workspace_id === filters.workspace_id
        const matchesContract = !filters.contract_id || rows[index].contract_id === filters.contract_id
        if (matchesWorkspace && matchesContract) rows.splice(index, 1)
      }

      return Promise.resolve({ error: null })
    },
  }
}

function buildSelectQuery() {
  let workspaceId: string | null = null
  let contractId: string | null = null
  let limitValue = Number.POSITIVE_INFINITY

  const exec = () => {
    let result = rows.filter((row) => (!workspaceId || row.workspace_id === workspaceId) && (!contractId || row.contract_id === contractId))
    result = [...result].sort((left, right) => right.saved_at.localeCompare(left.saved_at)).slice(0, limitValue)
    return result.map((row) => ({ contract: row.contract }))
  }

  return {
    eq(column: string, value: string) {
      if (column === 'workspace_id') workspaceId = value
      if (column === 'contract_id') contractId = value
      return this
    },
    order() {
      return this
    },
    limit(value: number) {
      limitValue = value
      return Promise.resolve({ data: exec(), error: null })
    },
    maybeSingle() {
      const data = exec()[0] ?? null
      return Promise.resolve({ data, error: null })
    },
  }
}

vi.mock('./supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    from: () => ({
      select: () => buildSelectQuery(),
      upsert: async (payload: Row) => {
        const existingIndex = rows.findIndex(
          (row) => row.workspace_id === payload.workspace_id && row.contract_id === payload.contract_id,
        )

        if (existingIndex >= 0) rows.splice(existingIndex, 1, payload)
        else rows.push(payload)

        return { error: null }
      },
      delete: () => buildDeleteQuery(),
    }),
  }),
}))

const {
  createContractFromDevis,
  createEmptyContract,
  listContracts,
  loadContract,
  saveContract,
  deleteContract,
  cloneContractForEdit,
  updateContractStatus,
} = await import('./contractStorage')

describe('contractStorage', () => {
  beforeEach(() => {
    rows.length = 0
  })

  it('creates an empty contract draft', () => {
    const contract = createEmptyContract()
    expect(contract.kind).toBe('contract')
    expect(contract.status).toBe('draft')
  })

  it('creates contract from devis', () => {
    const devis = mkDevis()
    const contract = createContractFromDevis(devis)
    expect(contract.customer.name).toBe(devis.customer.name)
    expect(contract.meta.devisNumber).toBe(devis.meta.number)
    expect(contract.devisId).toBe(devis.id)
  })

  it('saves and lists contracts', async () => {
    const contract = createEmptyContract()
    await saveContract(contract)
    const list = await listContracts()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(contract.id)
    expect(list[0].savedAt).toBeTruthy()
  })

  it('loadContract returns saved contract', async () => {
    const contract = createEmptyContract()
    await saveContract(contract)
    const loaded = await loadContract(contract.id)
    expect(loaded?.id).toBe(contract.id)
  })

  it('saveContract updates existing contract via upsert', async () => {
    const contract = createEmptyContract()
    await saveContract(contract)
    await saveContract({ ...contract, finalTotal: 999 })
    const list = await listContracts()
    expect(list).toHaveLength(1)
    expect(list[0].finalTotal).toBe(999)
  })

  it('deleteContract removes contract', async () => {
    const contract = createEmptyContract()
    await saveContract(contract)
    await deleteContract(contract.id)
    await expect(listContracts()).resolves.toHaveLength(0)
  })

  it('cloneContractForEdit forks a new draft id', async () => {
    const contract = createEmptyContract()
    await saveContract(contract)
    const cloned = await cloneContractForEdit(contract.id)
    expect(cloned.id).not.toBe(contract.id)
    expect(cloned.status).toBe('draft')
    expect(cloned.meta.number).not.toBe(contract.meta.number)
  })

  it('updateContractStatus stamps sent metadata', () => {
    const contract = createEmptyContract()
    const sent = updateContractStatus(contract, 'sent', 'email')
    expect(sent.status).toBe('sent')
    expect(sent.sentChannel).toBe('email')
    expect(sent.sentAt).toBeTruthy()
  })
})
