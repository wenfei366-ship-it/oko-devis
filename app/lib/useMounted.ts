'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Hydration-safe mounted gate. Returns `false` on the server and during
 * initial hydration, `true` once the client has taken over.
 * Uses useSyncExternalStore to avoid the "setState in useEffect" lint warning.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
