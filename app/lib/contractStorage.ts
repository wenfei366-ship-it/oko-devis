'use client'

import type { Contract, ContractActivity, ContractSentChannel, ContractStatus, Devis } from './types'
import { computeTotals } from './calculations'
import { generateContractNumber, uuid } from './numbering'
import { getSupabaseBrowserClient } from './supabase/client'

const TABLE_NAME = 'contract_history'
const WORKSPACE_ID = 'oko-shared'
const MAX_HISTORY = 100

interface ContractHistoryRow {
  contract: Contract
}

export class ContractConflictError extends Error {
  constructor(id: string) {
    super(`Contract id "${id}" already in history. Fork (new id) before saving.`)
    this.name = 'ContractConflictError'
  }
}

function makeActivity(event: string, meta?: string): ContractActivity {
  return {
    at: new Date().toISOString(),
    actor: 'OKO',
    event,
    meta,
  }
}

export function createEmptyContract(): Contract {
  const now = new Date().toISOString()
  return {
    kind: 'contract',
    id: uuid(),
    meta: {
      number: generateContractNumber(),
      date: now.slice(0, 10),
      signingPlace: 'Paris',
      serviceStartDate: '',
    },
    customer: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      country: 'FR',
      contactName: '',
      email: '',
      phone: '',
    },
    lang: 'fr',
    selectedServices: [],
    paymentMode: 'annual',
    subtotalDisplay: 0,
    finalTotal: 0,
    totalUnit: 'annual',
    specialConditions: '',
    status: 'draft',
    evidenceFiles: [],
    attachments: [],
    activityLog: [makeActivity('Contract draft created')],
    createdAt: now,
    updatedAt: now,
  }
}

export function createContractFromDevis(devis: Devis): Contract {
  const now = new Date().toISOString()
  const totals = computeTotals(devis)
  return {
    kind: 'contract',
    id: uuid(),
    devisId: devis.id,
    meta: {
      number: generateContractNumber(),
      devisNumber: devis.meta.number,
      date: now.slice(0, 10),
      signingPlace: 'Paris',
      serviceStartDate: devis.meta.startDate,
    },
    customer: { ...devis.customer },
    lang: devis.lang,
    selectedServices: devis.items.map((item) => ({ ...item })),
    paymentMode: totals.recurringAnnualFinal > 0 ? 'annual' : 'monthly',
    subtotalDisplay: totals.total,
    finalTotal: totals.total,
    totalUnit: totals.recurringAnnualFinal > 0 ? 'annual' : 'monthly',
    specialConditions: devis.notes,
    status: 'draft',
    evidenceFiles: [],
    attachments: [],
    activityLog: [
      makeActivity('Contract created from devis', devis.meta.number),
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export async function listContracts(): Promise<Contract[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('contract')
    .eq('workspace_id', WORKSPACE_ID)
    .order('saved_at', { ascending: false })
    .limit(MAX_HISTORY)

  if (error) throw error
  return ((data ?? []) as ContractHistoryRow[]).map((row) => row.contract)
}

export async function loadContract(id: string): Promise<Contract | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('contract')
    .eq('workspace_id', WORKSPACE_ID)
    .eq('contract_id', id)
    .maybeSingle()

  if (error) throw error
  return data ? (data as ContractHistoryRow).contract : null
}

export async function saveContract(contract: Contract): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const stamped: Contract = {
    ...contract,
    savedAt: new Date().toISOString(),
  }
  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      workspace_id: WORKSPACE_ID,
      contract_id: stamped.id,
      devis_id: stamped.devisId ?? null,
      contract: stamped,
      saved_at: stamped.savedAt,
      created_at: contract.createdAt,
    },
    { onConflict: 'workspace_id,contract_id' },
  )

  if (!error) return
  throw error
}

export async function deleteContract(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .match({ workspace_id: WORKSPACE_ID, contract_id: id })

  if (error) throw error
}

export async function cloneContractForEdit(id: string): Promise<Contract> {
  const source = await loadContract(id)
  if (!source) throw new Error(`Contract id "${id}" not found in history.`)

  return {
    ...source,
    id: uuid(),
    meta: {
      ...source.meta,
      number: generateContractNumber(),
    },
    status: 'draft',
    savedAt: undefined,
    updatedAt: new Date().toISOString(),
    activityLog: [
      ...source.activityLog,
      makeActivity('Contract duplicated for edit', source.meta.number),
    ],
  }
}

export function updateContractStatus(
  contract: Contract,
  status: ContractStatus,
  sentChannel?: ContractSentChannel,
): Contract {
  const now = new Date().toISOString()
  return {
    ...contract,
    status,
    sentAt: status === 'sent' ? now : contract.sentAt,
    sentChannel: status === 'sent' ? (sentChannel ?? contract.sentChannel) : contract.sentChannel,
    confirmedAt: status === 'confirmed' ? now : contract.confirmedAt,
    updatedAt: now,
    activityLog: [...contract.activityLog, makeActivity(`Status changed to ${status}`)],
  }
}
