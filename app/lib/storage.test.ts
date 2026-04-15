import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Devis } from './types'
import { uuid } from './numbering'

type Row = {
  workspace_id: string
  user_id: string | null
  devis_id: string
  devis: Devis
  saved_at: string
}

const rows: Row[] = []

const i18n = (s: string) => ({ fr: s, it: s, es: s, de: s, zh: s })

function mkDevis(id?: string): Devis {
  return {
    id: id ?? uuid(),
    meta: { number: 'DRAFT-2026-001-TEST', date: '2026-01-01', validityDays: 30, objet: i18n('test'), startDate: '' },
    customer: { name: 'Test', address: '', postalCode: '', city: '', country: 'FR', contactName: '', email: '', phone: '' },
    items: [],
    discount: { kind: 'none' },
    notes: '',
    lang: 'fr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function buildDeleteQuery() {
  return {
    match(filters: { workspace_id?: string; devis_id?: string }) {
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        const matchesWorkspace = !filters.workspace_id || rows[index].workspace_id === filters.workspace_id
        const matchesDevis = !filters.devis_id || rows[index].devis_id === filters.devis_id
        if (matchesWorkspace && matchesDevis) rows.splice(index, 1)
      }

      return Promise.resolve({ error: null })
    },
  }
}

function buildSelectQuery() {
  let workspaceId: string | null = null
  let devisId: string | null = null
  let limitValue = Number.POSITIVE_INFINITY

  const exec = () => {
    let result = rows.filter((row) => (!workspaceId || row.workspace_id === workspaceId) && (!devisId || row.devis_id === devisId))
    result = [...result].sort((left, right) => right.saved_at.localeCompare(left.saved_at)).slice(0, limitValue)
    return result.map((row) => ({ devis: row.devis }))
  }

  return {
    eq(column: string, value: string) {
      if (column === 'workspace_id') workspaceId = value
      if (column === 'devis_id') devisId = value
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
      insert: async (payload: Row) => {
        const exists = rows.some((row) => row.workspace_id === payload.workspace_id && row.devis_id === payload.devis_id)
        if (exists) return { error: { code: '23505' } }
        rows.push(payload)
        return { error: null }
      },
      upsert: async (payload: Row) => {
        const existingIndex = rows.findIndex((row) => (
          row.workspace_id === payload.workspace_id && row.devis_id === payload.devis_id
        ))
        if (existingIndex >= 0) rows.splice(existingIndex, 1, payload)
        else rows.push(payload)
        return { error: null }
      },
      delete: () => buildDeleteQuery(),
    }),
  }),
}))

const {
  listHistory,
  saveToHistory,
  deleteFromHistory,
  loadFromHistory,
  clearHistory,
  cloneForEdit,
  syncToHistory,
  HistoryConflictError,
} = await import('./storage')

describe('storage (supabase)', () => {
  beforeEach(() => {
    rows.length = 0
  })

  it('starts empty', async () => {
    await expect(listHistory()).resolves.toEqual([])
  })

  it('saveToHistory + listHistory', async () => {
    const d = mkDevis()
    await saveToHistory(d)
    const list = await listHistory()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(d.id)
    expect(list[0].savedAt).toBeTruthy()
  })

  it('throws HistoryConflictError on duplicate id', async () => {
    const d = mkDevis('same-id')
    await saveToHistory(d)
    await expect(saveToHistory(d)).rejects.toBeInstanceOf(HistoryConflictError)
  })

  it('loadFromHistory by id', async () => {
    const d = mkDevis()
    await saveToHistory(d)
    const loaded = await loadFromHistory(d.id)
    expect(loaded).not.toBeNull()
    expect(loaded!.id).toBe(d.id)
  })

  it('loadFromHistory returns null for missing id', async () => {
    await expect(loadFromHistory('nonexistent')).resolves.toBeNull()
  })

  it('deleteFromHistory removes entry', async () => {
    const d = mkDevis()
    await saveToHistory(d)
    await deleteFromHistory(d.id)
    await expect(listHistory()).resolves.toHaveLength(0)
  })

  it('clearHistory removes all', async () => {
    await saveToHistory(mkDevis())
    await saveToHistory(mkDevis())
    await clearHistory()
    await expect(listHistory()).resolves.toHaveLength(0)
  })

  it('newest first ordering', async () => {
    const d1 = { ...mkDevis(), savedAt: '2026-01-01T00:00:00.000Z' }
    const d2 = { ...mkDevis(), savedAt: '2026-01-02T00:00:00.000Z' }
    await saveToHistory(d1)
    await saveToHistory(d2)
    const list = await listHistory()
    expect(list[0].id).toBe(d2.id)
    expect(list[1].id).toBe(d1.id)
  })

  it('cloneForEdit forks a new draft id and clears savedAt', async () => {
    const d = mkDevis()
    await saveToHistory(d)
    const cloned = await cloneForEdit(d.id)
    expect(cloned.id).not.toBe(d.id)
    expect(cloned.savedAt).toBeUndefined()
    expect(cloned.meta.number).not.toBe(d.meta.number)
  })

  it('syncToHistory updates an existing devis snapshot', async () => {
    const d = mkDevis('same-id')
    await saveToHistory(d)
    await syncToHistory({
      ...d,
      customer: { ...d.customer, name: 'Akit Sushi' },
    })
    const loaded = await loadFromHistory(d.id)
    expect(loaded?.customer.name).toBe('Akit Sushi')
    expect(rows).toHaveLength(1)
  })
})
