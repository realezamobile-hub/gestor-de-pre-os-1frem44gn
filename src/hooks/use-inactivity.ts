import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const TIMEOUT_MS = 60 * 60 * 1000 // 60 minutes
const WARNING_MS = 55 * 60 * 1000 // 55 minutes

export function useInactivity() {
  const { currentUser, updateActivity, logout, checkSession } = useAuthStore()
  const navigate = useNavigate()

  const handleActivity = useCallback(() => {
    if (currentUser) {
      updateActivity()
    }
  }, [currentUser, updateActivity])

  useEffect(() => {
    if (!currentUser) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

    // Throttle activity updates
    let timeout: NodeJS.Timeout
    const onEvent = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          handleActivity()
          // @ts-expect-error
          timeout = null
        }, 5000) // Update at most every 5 seconds
      }
    }

    events.forEach((event) => window.addEventListener(event, onEvent))

    // Check session validity periodically
    const sessionCheckInterval = setInterval(() => {
      checkSession()

      // Check locally for inactivity based on lastActive
      const lastActive = new Date(
        useAuthStore.getState().currentUser?.lastActive || '',
      ).getTime()
      const now = new Date().getTime()

      if (now - lastActive > TIMEOUT_MS) {
        logout()
        toast.error('Sessão expirada por inatividade.')
        navigate('/')
      } else if (
        now - lastActive > WARNING_MS &&
        now - lastActive < WARNING_MS + 60000
      ) {
        toast.warning('Sua sessão irá expirar em 5 minutos.')
      }
    }, 30000) // Check every 30s

    return () => {
      events.forEach((event) => window.removeEventListener(event, onEvent))
      clearInterval(sessionCheckInterval)
      if (timeout) clearTimeout(timeout)
    }
  }, [currentUser, handleActivity, checkSession, logout, navigate])
}
