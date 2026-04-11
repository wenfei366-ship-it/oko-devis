'use client'

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react'
import type {
  Devis,
  DevisItem,
  LineItem,
  PackageLine,
  Customer,
  DevisMeta,
  Discount,
  Lang,
  Country,
} from '@/app/lib/types'
import { generateDraftNumber, uuid } from '@/app/lib/numbering'
import { DEFAULT_OBJET } from '@/app/lib/i18n'
import { DISCOUNT_NONE } from '@/app/lib/discounts'

// ---------- Actions ----------

export type DevisAction =
  | { type: 'LOAD_DEVIS'; devis: Devis }
  | { type: 'NEW_DEVIS' }
  | { type: 'UPDATE_META'; meta: Partial<DevisMeta> }
  | { type: 'UPDATE_CUSTOMER'; customer: Partial<Customer> }
  | { type: 'ADD_SERVICE'; item: LineItem }
  | { type: 'ADD_CUSTOM_LINE'; item: LineItem }
  | { type: 'ADD_PACKAGE'; pack: PackageLine }
  | { type: 'UPDATE_ITEM'; id: string; changes: Partial<LineItem> | Partial<PackageLine> }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'SET_DISCOUNT'; discount: Discount }
  | { type: 'UPDATE_NOTES'; notes: string }
  | { type: 'SET_LANG'; lang: Lang }

// ---------- Factory ----------

function createEmptyDevis(): Devis {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    meta: {
      number: generateDraftNumber(),
      date: now.slice(0, 10),
      validityDays: 30,
      objet: { ...DEFAULT_OBJET },
      startDate: '',
    },
    customer: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      country: 'FR' as Country,
      contactName: '',
      email: '',
      phone: '',
    },
    items: [],
    discount: DISCOUNT_NONE,
    notes: '',
    lang: 'fr' as Lang,
    createdAt: now,
    updatedAt: now,
  }
}

// ---------- Reducer ----------

function devisReducer(state: Devis, action: DevisAction): Devis {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'LOAD_DEVIS':
      return { ...action.devis }

    case 'NEW_DEVIS':
      return createEmptyDevis()

    case 'UPDATE_META':
      return {
        ...state,
        meta: { ...state.meta, ...action.meta },
        updatedAt: now,
      }

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customer: { ...state.customer, ...action.customer },
        updatedAt: now,
      }

    case 'ADD_SERVICE':
      return {
        ...state,
        items: [...state.items, action.item],
        updatedAt: now,
      }

    case 'ADD_CUSTOM_LINE':
      return {
        ...state,
        items: [...state.items, action.item],
        updatedAt: now,
      }

    case 'ADD_PACKAGE':
      return {
        ...state,
        items: [...state.items, action.pack],
        updatedAt: now,
      }

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.id) return item
          if (item.kind === 'package') {
            return { ...item, ...(action.changes as Partial<PackageLine>) }
          }
          return { ...item, ...(action.changes as Partial<LineItem>) }
        }),
        updatedAt: now,
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
        updatedAt: now,
      }

    case 'SET_DISCOUNT':
      return {
        ...state,
        discount: action.discount,
        updatedAt: now,
      }

    case 'UPDATE_NOTES':
      return {
        ...state,
        notes: action.notes,
        updatedAt: now,
      }

    case 'SET_LANG':
      return {
        ...state,
        lang: action.lang,
        updatedAt: now,
      }

    default:
      return state
  }
}

// ---------- Context ----------

interface DevisContextValue {
  devis: Devis
  dispatch: Dispatch<DevisAction>
}

const DevisCtx = createContext<DevisContextValue | null>(null)

export function useDevis(): DevisContextValue {
  const ctx = useContext(DevisCtx)
  if (!ctx) throw new Error('useDevis must be used inside DevisProvider')
  return ctx
}

// ---------- Provider ----------

export function DevisProvider({ children }: { children: ReactNode }) {
  const [devis, dispatch] = useReducer(devisReducer, null, createEmptyDevis)

  return (
    <DevisCtx.Provider value={{ devis, dispatch }}>
      {children}
    </DevisCtx.Provider>
  )
}
