// OKO Devis Generator — localStorage history (v3)
// Immutable snapshots: saveToHistory throws on id collision — caller must fork.
// Legacy key migration from 'oko-devis-local-history-v1' → 'oko-devis-history-v1'.

import type { Devis } from './types'

const HISTORY_KEY = 'oko-devis-history-v1'
const LEGACY_HISTORY_KEY = 'oko-devis-local-history-v1'
const MAX_HISTORY = 100

function migrateLegacy(): void {
  if (typeof window === 'undefined') return
  try {
    const legacy = localStorage.getItem(LEGACY_HISTORY_KEY)
    const current = localStorage.getItem(HISTORY_KEY)
    if (legacy && !current) {
      localStorage.setItem(HISTORY_KEY, legacy)
      localStorage.removeItem(LEGACY_HISTORY_KEY)
    }
  } catch {
    // ignore
  }
}

function readAll(): Devis[] {
  if (typeof window === 'undefined') return []
  migrateLegacy()
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Devis[]
  } catch {
    return []
  }
}

function writeAll(list: Devis[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)))
  } catch {
    // quota exceeded — silently drop
  }
}

export function listHistory(): Devis[] {
  return readAll()
}

export class HistoryConflictError extends Error {
  constructor(id: string) {
    super(`Devis id "${id}" already in history. Fork (new id) before saving.`)
    this.name = 'HistoryConflictError'
  }
}

/**
 * Insert a devis into the local history. Throws HistoryConflictError if an
 * entry with the same id already exists. Caller is responsible for forking
 * (new id) when they want to persist edits on an already-saved devis.
 *
 * History entries are IMMUTABLE. There is no update / upsert — only insert.
 */
export function saveToHistory(devis: Devis): void {
  const all = readAll()
  if (all.some((d) => d.id === devis.id)) {
    throw new HistoryConflictError(devis.id)
  }
  const stamped: Devis = {
    ...devis,
    savedAt: devis.savedAt || new Date().toISOString(),
  }
  writeAll([stamped, ...all])
}

export function deleteFromHistory(id: string): void {
  writeAll(readAll().filter((d) => d.id !== id))
}

export function loadFromHistory(id: string): Devis | null {
  return readAll().find((d) => d.id === id) ?? null
}

export function clearHistory(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(HISTORY_KEY)
}
