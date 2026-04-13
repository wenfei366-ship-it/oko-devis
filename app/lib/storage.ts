'use client'

import type { Devis } from './types'
import { generateDraftNumber, uuid } from './numbering'
import { getSupabaseBrowserClient } from './supabase/client'

const TABLE_NAME = 'devis_history'
const MAX_HISTORY = 100

interface DevisHistoryRow {
  devis: Devis
}

async function requireUserId(): Promise<string> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    throw new AuthRequiredError()
  }

  return session.user.id
}

export class HistoryConflictError extends Error {
  constructor(id: string) {
    super(`Devis id "${id}" already in history. Fork (new id) before saving.`)
    this.name = 'HistoryConflictError'
  }
}

export class AuthRequiredError extends Error {
  constructor() {
    super('You must sign in before using shared history.')
    this.name = 'AuthRequiredError'
  }
}

export async function listHistory(): Promise<Devis[]> {
  const userId = await requireUserId()
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('devis')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
    .limit(MAX_HISTORY)

  if (error) throw error

  return ((data ?? []) as DevisHistoryRow[]).map((row) => row.devis)
}

export async function saveToHistory(devis: Devis): Promise<void> {
  const userId = await requireUserId()
  const supabase = getSupabaseBrowserClient()
  const stamped: Devis = {
    ...devis,
    savedAt: devis.savedAt || new Date().toISOString(),
  }

  const { error } = await supabase.from(TABLE_NAME).insert({
    user_id: userId,
    devis_id: stamped.id,
    devis: stamped,
    saved_at: stamped.savedAt,
  })

  if (!error) return
  if (error.code === '23505') throw new HistoryConflictError(devis.id)
  throw error
}

export async function deleteFromHistory(id: string): Promise<void> {
  const userId = await requireUserId()
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .match({ user_id: userId, devis_id: id })

  if (error) throw error
}

export async function loadFromHistory(id: string): Promise<Devis | null> {
  const userId = await requireUserId()
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('devis')
    .eq('user_id', userId)
    .eq('devis_id', id)
    .maybeSingle()

  if (error) throw error

  return data ? (data as DevisHistoryRow).devis : null
}

export async function cloneForEdit(id: string): Promise<Devis> {
  const source = await loadFromHistory(id)
  if (!source) throw new Error(`Devis id "${id}" not found in history.`)

  return {
    ...source,
    id: uuid(),
    meta: {
      ...source.meta,
      number: generateDraftNumber(),
    },
    savedAt: undefined,
    updatedAt: new Date().toISOString(),
  }
}

export async function clearHistory(): Promise<void> {
  const userId = await requireUserId()
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from(TABLE_NAME).delete().match({ user_id: userId })
  if (error) throw error
}
