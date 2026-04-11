// OKO Devis Generator — localStorage history (v3)
// Immutable snapshots: saveToHistory throws on id collision — caller must fork.
// Legacy key migration from 'oko-devis-local-history-v1' → 'oko-devis-history-v1'.

import type { Devis } from './types'
import { generateDraftNumber, uuid } from './numbering'

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

/**
 * Clone an existing history entry for editing.
 * Generates a new id + new draft number, clears savedAt so the clone
 * is treated as an unsaved draft. Throws if the source id is not found.
 */
export function cloneForEdit(id: string): Devis {
  const source = loadFromHistory(id)
  if (!source) throw new Error(`Devis id "${id}" not found in history.`)
  const clone: Devis = {
    ...source,
    id: uuid(),
    meta: {
      ...source.meta,
      number: generateDraftNumber(),
    },
    savedAt: undefined,
    updatedAt: new Date().toISOString(),
  }
  return clone
}

export function clearHistory(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch {
      // fallback: write empty array
      writeAll([])
    }
  }
}
