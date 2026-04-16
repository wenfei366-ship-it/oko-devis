export interface AuthUser {
  email: string
  displayName: string
  initial: string
  avatarColor: string
}

export const AUTH_COOKIE_NAME = 'oko_auth_email'

export const AUTH_ALLOWED_EMAILS = [
  'kelley@joinoko.com',
  'lucy@joinoko.com',
  'lili@joinoko.com',
  'stephan@joinoko.com',
  'hailey@joinoko.com',
  'account@joinoko.com',
] as const

export type AllowedAuthEmail = (typeof AUTH_ALLOWED_EMAILS)[number]
