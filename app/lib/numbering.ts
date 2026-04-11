// OKO Devis Generator — draft number generation
// Format: DRAFT-YYYY-nnn-XXXX
//   YYYY = current year
//   nnn  = zero-padded 3-digit local counter (per browser, resets per year)
//   XXXX = 4 random hex chars (collision mitigation)

const COUNTER_KEY = 'oko-devis-counter-v1'

type CounterState = { year: number; seq: number }

function safeGet(): CounterState {
  if (typeof window === 'undefined') return { year: new Date().getFullYear(), seq: 0 }
  try {
    const raw = localStorage.getItem(COUNTER_KEY)
    if (!raw) return { year: new Date().getFullYear(), seq: 0 }
    return JSON.parse(raw) as CounterState
  } catch {
    return { year: new Date().getFullYear(), seq: 0 }
  }
}

function safeSet(state: CounterState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COUNTER_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded — silently drop
  }
}

function incrementCounter(): number {
  const year = new Date().getFullYear()
  const state = safeGet()
  const nextSeq = state.year === year ? state.seq + 1 : 1
  safeSet({ year, seq: nextSeq })
  return nextSeq
}

function fourHex(): string {
  const chars = '0123456789ABCDEF'
  let out = ''
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * 16)]
  return out
}

export function generateDraftNumber(): string {
  const year = new Date().getFullYear()
  const seq = incrementCounter()
  const suffix = fourHex()
  return `DRAFT-${year}-${String(seq).padStart(3, '0')}-${suffix}`
}

/** crypto.randomUUID() with a fallback for older runtimes */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // RFC4122-ish fallback using Math.random (only used when crypto absent)
  const hex = '0123456789abcdef'
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const h = bytes.map((b) => hex[(b >> 4) & 0xf] + hex[b & 0xf]).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}
