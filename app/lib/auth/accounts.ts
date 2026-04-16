import 'server-only'

import type { AllowedAuthEmail, AuthUser } from './shared'

type AccountRecord = AuthUser & {
  password: string
}

export const AUTH_ACCOUNTS: Record<AllowedAuthEmail, AccountRecord> = {
  'kelley@joinoko.com': {
    email: 'kelley@joinoko.com',
    password: 'OkoKelley26!',
    displayName: 'Kelley',
    initial: 'K',
    avatarColor: '#B8922F',
  },
  'lucy@joinoko.com': {
    email: 'lucy@joinoko.com',
    password: 'OkoLucy26!',
    displayName: 'Lucy',
    initial: 'L',
    avatarColor: '#6B8E4E',
  },
  'lili@joinoko.com': {
    email: 'lili@joinoko.com',
    password: 'OkoLili26!',
    displayName: 'Lili',
    initial: 'L',
    avatarColor: '#C9A35B',
  },
  'stephan@joinoko.com': {
    email: 'stephan@joinoko.com',
    password: 'OkoStephan26!',
    displayName: 'Stephan',
    initial: 'S',
    avatarColor: '#9B2A2A',
  },
  'hailey@joinoko.com': {
    email: 'hailey@joinoko.com',
    password: 'OkoHailey26!',
    displayName: 'Hailey',
    initial: 'H',
    avatarColor: '#5C5142',
  },
  'account@joinoko.com': {
    email: 'account@joinoko.com',
    password: 'OkoAccount26!',
    displayName: 'Account',
    initial: 'A',
    avatarColor: '#8B7A3E',
  },
}

export function findAuthAccount(email: string) {
  const normalizedEmail = email.trim().toLowerCase() as AllowedAuthEmail
  return AUTH_ACCOUNTS[normalizedEmail] ?? null
}

export function toAuthUser(account: AccountRecord): AuthUser {
  return {
    email: account.email,
    displayName: account.displayName,
    initial: account.initial,
    avatarColor: account.avatarColor,
  }
}
