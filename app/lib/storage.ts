import type { Devis } from './types'

const HISTORY_KEY = 'oko-devis-history-v1'
const LEGACY_HISTORY_KEY = 'oko-devis-local-history-v1'
const COUNTER_KEY = 'oko-devis-counter-v1'
const MAX_HISTORY = 100

// One-time migration from legacy key (v1 plan → v3 plan)
function migrateLegacyHistory() {
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

// Safe localStorage access (works in browser only)
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  migrateLegacyHistory()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded — silently drop
  }
}

export function getLocalHistory(): Devis[] {
  return safeGet<Devis[]>(HISTORY_KEY, [])
}

export function saveToLocalHistory(devis: Devis): void {
  const history = getLocalHistory()
  const existingIdx = history.findIndex((d) => d.id === devis.id)
  if (existingIdx >= 0) {
    history[existingIdx] = devis
  } else {
    history.unshift(devis)
  }
  // Trim to max history
  const trimmed = history.slice(0, MAX_HISTORY)
  safeSet(HISTORY_KEY, trimmed)
}

export function deleteFromLocalHistory(id: string): void {
  const history = getLocalHistory().filter((d) => d.id !== id)
  safeSet(HISTORY_KEY, history)
}

export function loadFromLocalHistory(id: string): Devis | null {
  return getLocalHistory().find((d) => d.id === id) ?? null
}

export function clearLocalHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(HISTORY_KEY)
  }
}

// Draft number generation — NOT authoritative
// Format: DRAFT-YYYY-NNN-XXXX (year + local counter + 4-char random suffix)
export function generateDraftNumber(): string {
  const year = new Date().getFullYear()
  const counter = incrementCounter()
  const suffix = Array.from({ length: 4 }, () =>
    '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
  ).join('')
  return `DRAFT-${year}-${String(counter).padStart(3, '0')}-${suffix}`
}

function incrementCounter(): number {
  const year = new Date().getFullYear()
  const state = safeGet<{ year: number; seq: number }>(COUNTER_KEY, {
    year,
    seq: 0,
  })
  const nextSeq = state.year === year ? state.seq + 1 : 1
  safeSet(COUNTER_KEY, { year, seq: nextSeq })
  return nextSeq
}
