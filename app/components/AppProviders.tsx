'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'

export default function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
