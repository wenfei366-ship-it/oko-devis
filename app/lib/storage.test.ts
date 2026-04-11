import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Devis } from './types'
import { uuid } from './numbering'

// Mock localStorage before importing storage module
const store = new Map<string, string>()
const mockLS = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { store.set(key, value) }),
  removeItem: vi.fn((key: string) => { store.delete(key) }),
  clear: vi.fn(() => { store.clear() }),
  get length() { return store.size },
  key: vi.fn((_i: number) => null),
}
Object.defineProperty(globalThis, 'localStorage', { value: mockLS, writable: true })

// Import AFTER mock is in place
const { listHistory, saveToHistory, deleteFromHistory, loadFromHistory, clearHistory, HistoryConflictError } = await import('./storage')

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

describe('storage (localStorage)', () => {
  beforeEach(() => {
    store.clear()
  })

  it('starts empty', () => {
    expect(listHistory()).toEqual([])
  })

  it('saveToHistory + listHistory', () => {
    const d = mkDevis()
    saveToHistory(d)
    const list = listHistory()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(d.id)
    expect(list[0].savedAt).toBeTruthy()
  })

  it('throws HistoryConflictError on duplicate id', () => {
    const d = mkDevis('same-id')
    saveToHistory(d)
    expect(() => saveToHistory(d)).toThrow(HistoryConflictError)
  })

  it('loadFromHistory by id', () => {
    const d = mkDevis()
    saveToHistory(d)
    const loaded = loadFromHistory(d.id)
    expect(loaded).not.toBeNull()
    expect(loaded!.id).toBe(d.id)
  })

  it('loadFromHistory returns null for missing id', () => {
    expect(loadFromHistory('nonexistent')).toBeNull()
  })

  it('deleteFromHistory removes entry', () => {
    const d = mkDevis()
    saveToHistory(d)
    deleteFromHistory(d.id)
    expect(listHistory()).toHaveLength(0)
  })

  it('clearHistory removes all', () => {
    saveToHistory(mkDevis())
    saveToHistory(mkDevis())
    clearHistory()
    expect(listHistory()).toHaveLength(0)
  })

  it('newest first ordering', () => {
    const d1 = mkDevis()
    const d2 = mkDevis()
    saveToHistory(d1)
    saveToHistory(d2)
    const list = listHistory()
    expect(list[0].id).toBe(d2.id)
    expect(list[1].id).toBe(d1.id)
  })
})
