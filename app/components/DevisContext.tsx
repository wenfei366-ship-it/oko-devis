'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Customer, Devis, LineItem, Discount, Service } from '../lib/types'
import { createEmptyDevis, cryptoRandomId, serviceToLineItem } from '../lib/factory'
import { computeTotals } from '../lib/calculations'
import type { DevisTotals } from '../lib/types'
import { saveToLocalHistory } from '../lib/storage'

type Action =
  | { type: 'LOAD_DEVIS'; devis: Devis }
  | { type: 'NEW_DEVIS' }
  | { type: 'UPDATE_META'; patch: Partial<Devis['meta']> }
  | { type: 'UPDATE_CUSTOMER'; patch: Partial<Customer> }
  | { type: 'ADD_SERVICE'; service: Service }
  | { type: 'ADD_CUSTOM_LINE' }
  | { type: 'UPDATE_ITEM'; id: string; patch: Partial<LineItem> }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'MOVE_ITEM'; id: string; direction: 'up' | 'down' }
  | { type: 'SET_DISCOUNT'; discount: Discount }
  | { type: 'UPDATE_NOTES'; notes: string }

function touch<T extends { updatedAt: string }>(state: T): T {
  return { ...state, updatedAt: new Date().toISOString() }
}

function reducer(state: Devis, action: Action): Devis {
  switch (action.type) {
    case 'LOAD_DEVIS':
      return action.devis
    case 'NEW_DEVIS':
      return createEmptyDevis()
    case 'UPDATE_META':
      return touch({ ...state, meta: { ...state.meta, ...action.patch } })
    case 'UPDATE_CUSTOMER':
      return touch({ ...state, customer: { ...state.customer, ...action.patch } })
    case 'ADD_SERVICE': {
      const newItem = serviceToLineItem(action.service)
      return touch({ ...state, items: [...state.items, newItem] })
    }
    case 'ADD_CUSTOM_LINE': {
      const newItem: LineItem = {
        id: cryptoRandomId(),
        serviceId: 'custom',
        designation: '',
        description: '',
        qty: 1,
        unit: 'unique',
        qtyLabel: '1 unique',
        unitPrice: 0,
        billingCadence: 'oneOff',
        pdfSection: 'complement',
        recurringEligible: false,
      }
      return touch({ ...state, items: [...state.items, newItem] })
    }
    case 'UPDATE_ITEM':
      return touch({
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, ...action.patch } : i
        ),
      })
    case 'REMOVE_ITEM':
      return touch({ ...state, items: state.items.filter((i) => i.id !== action.id) })
    case 'MOVE_ITEM': {
      const idx = state.items.findIndex((i) => i.id === action.id)
      if (idx < 0) return state
      const target = action.direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= state.items.length) return state
      const items = [...state.items]
      ;[items[idx], items[target]] = [items[target], items[idx]]
      return touch({ ...state, items })
    }
    case 'SET_DISCOUNT':
      return touch({ ...state, discount: action.discount })
    case 'UPDATE_NOTES':
      return touch({ ...state, notes: action.notes })
  }
}

interface DevisContextValue {
  devis: Devis
  totals: DevisTotals
  loadDevis: (devis: Devis) => void
  newDevis: () => void
  updateMeta: (patch: Partial<Devis['meta']>) => void
  updateCustomer: (patch: Partial<Customer>) => void
  addService: (service: Service) => void
  addCustomLine: () => void
  updateItem: (id: string, patch: Partial<LineItem>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, direction: 'up' | 'down') => void
  setDiscount: (discount: Discount) => void
  updateNotes: (notes: string) => void
  saveToHistory: () => void
}

const DevisCtx = createContext<DevisContextValue | null>(null)

export function DevisProvider({ children }: { children: ReactNode }) {
  // Initial state is empty devis — number is generated client-side on mount
  const [state, dispatch] = useReducer(reducer, null, () => createEmptyDevis())

  const totals = useMemo(() => computeTotals(state), [state])

  const saveToHistory = useCallback(() => {
    saveToLocalHistory(state)
  }, [state])

  // Check for pending devis to load (from history page)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const pending = sessionStorage.getItem('oko-devis-load')
    if (pending) {
      try {
        const parsed = JSON.parse(pending) as Devis
        dispatch({ type: 'LOAD_DEVIS', devis: parsed })
        sessionStorage.removeItem('oko-devis-load')
      } catch {
        // ignore
      }
    }
  }, [])

  // Auto-save to history on every change
  useEffect(() => {
    // only save if there's something meaningful
    if (state.items.length > 0 || state.customer.name) {
      saveToLocalHistory(state)
    }
  }, [state])

  const value: DevisContextValue = {
    devis: state,
    totals,
    loadDevis: (devis) => dispatch({ type: 'LOAD_DEVIS', devis }),
    newDevis: () => dispatch({ type: 'NEW_DEVIS' }),
    updateMeta: (patch) => dispatch({ type: 'UPDATE_META', patch }),
    updateCustomer: (patch) => dispatch({ type: 'UPDATE_CUSTOMER', patch }),
    addService: (service) => dispatch({ type: 'ADD_SERVICE', service }),
    addCustomLine: () => dispatch({ type: 'ADD_CUSTOM_LINE' }),
    updateItem: (id, patch) => dispatch({ type: 'UPDATE_ITEM', id, patch }),
    removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
    moveItem: (id, direction) => dispatch({ type: 'MOVE_ITEM', id, direction }),
    setDiscount: (discount) => dispatch({ type: 'SET_DISCOUNT', discount }),
    updateNotes: (notes) => dispatch({ type: 'UPDATE_NOTES', notes }),
    saveToHistory,
  }

  return <DevisCtx.Provider value={value}>{children}</DevisCtx.Provider>
}

export function useDevis(): DevisContextValue {
  const ctx = useContext(DevisCtx)
  if (!ctx) throw new Error('useDevis must be used within DevisProvider')
  return ctx
}
