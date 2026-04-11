'use client'

import BuilderShell from './components/BuilderShell'
import { useMounted } from './lib/useMounted'

export default function Home() {
  const mounted = useMounted()

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse text-[var(--ink-muted)] text-sm">Chargement...</div>
      </main>
    )
  }

  return <BuilderShell />
}
