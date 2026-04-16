'use client'

import type { ReactNode } from 'react'
import AuthGate from './AuthGate'
import { AuthProvider } from './AuthContext'

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  )
}
