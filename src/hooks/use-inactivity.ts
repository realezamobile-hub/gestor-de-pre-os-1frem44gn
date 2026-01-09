import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

export function useInactivity() {
  // Disabled simple inactivity check as we now rely on Supabase Auth session management
  // and real-time activity updates are handled in stores/useAuthStore.ts via onAuthStateChange
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])
}
