export interface TeamMember {
  displayName: string
  initial: string
  avatarColor: string
}

export const TEAM_DIRECTORY: Record<string, TeamMember> = {
  Kelley: { displayName: 'Kelley', initial: 'K', avatarColor: '#B8922F' },
  Lucy: { displayName: 'Lucy', initial: 'L', avatarColor: '#6B8E4E' },
  Lili: { displayName: 'Lili', initial: 'L', avatarColor: '#C9A35B' },
  Stephan: { displayName: 'Stephan', initial: 'S', avatarColor: '#9B2A2A' },
  Hailey: { displayName: 'Hailey', initial: 'H', avatarColor: '#5C5142' },
  Account: { displayName: 'Account', initial: 'A', avatarColor: '#8B7A3E' },
}

const FALLBACK_COLORS = ['#B8922F', '#6B8E4E', '#C9A35B', '#9B2A2A', '#5C5142', '#8B7A3E']

export function resolveTeamMember(name: string | undefined | null): TeamMember {
  const trimmed = (name || '').trim()
  if (!trimmed) return { displayName: 'OKO', initial: 'O', avatarColor: '#1C1611' }
  const known = TEAM_DIRECTORY[trimmed]
  if (known) return known
  const initial = trimmed.charAt(0).toUpperCase()
  const hash = trimmed.charCodeAt(0) + (trimmed.charCodeAt(1) || 0)
  return { displayName: trimmed, initial, avatarColor: FALLBACK_COLORS[hash % FALLBACK_COLORS.length] }
}
