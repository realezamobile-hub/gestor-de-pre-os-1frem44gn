import { supabase } from '@/lib/supabase/client'

async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    return null
  }
  return { Authorization: `Bearer ${session.access_token}` }
}

function sessionExpiredError() {
  return {
    data: null,
    error: {
      message:
        'Sessão expirada. Faça login novamente antes de realizar esta ação.',
    },
  }
}

function extractErrorMessage(error: any, fallback: string): string {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (error.error && typeof error.error === 'string') return error.error
  if (error.data?.error && typeof error.data.error === 'string')
    return error.data.error
  if (error.context?.error && typeof error.context.error === 'string')
    return error.context.error
  if (error.message && typeof error.message === 'string') {
    if (
      error.message.includes('non-2xx') ||
      error.message.includes('An error occurred') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Edge Function') ||
      error.message.includes('NetworkError')
    ) {
      return fallback
    }
    return error.message
  }
  return fallback
}

export const deleteUserPermanently = async (userId: string) => {
  const headers = await getAuthHeaders()
  if (!headers) return sessionExpiredError()
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: { action: 'delete_user', target_user_id: userId },
      headers,
    },
  )
  return { data, error }
}

export const releaseUserAccess = async (
  userId: string,
  accessAllowed: boolean,
  subscriptionStatus: string,
) => {
  const headers = await getAuthHeaders()
  if (!headers) return sessionExpiredError()
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'release_access',
        target_user_id: userId,
        access_allowed: accessAllowed,
        subscription_status: subscriptionStatus,
      },
      headers,
    },
  )
  return { data, error }
}

export const renewUserAccess = async (userId: string) => {
  const headers = await getAuthHeaders()
  if (!headers) return sessionExpiredError()
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: { action: 'renew_access', target_user_id: userId },
      headers,
    },
  )
  return { data, error }
}

export const validateSession = async (userId: string, sessionId: string) => {
  const headers = await getAuthHeaders()
  if (!headers) return sessionExpiredError()
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'validate_session',
        target_user_id: userId,
        session_id: sessionId,
      },
      headers,
    },
  )
  return { data, error }
}

export const createUser = async (data: {
  email: string
  password: string
  name: string
  role: string
  companyId?: string
  subscriptionType: string
  monthlyFee?: number
  activeModules: string[]
}) => {
  const headers = await getAuthHeaders()
  if (!headers) return sessionExpiredError()

  const { data: result, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'create_user',
        target_email: data.email,
        target_password: data.password,
        target_name: data.name,
        target_role: data.role,
        target_company_id: data.companyId || null,
        subscription_type: data.subscriptionType,
        monthly_fee: data.monthlyFee ?? 0,
        active_modules: data.activeModules,
      },
      headers,
    },
  )

  if (error) {
    let message = extractErrorMessage(result, '')
    if (!message) {
      message = extractErrorMessage(error, 'Erro ao criar usuário')
    }
    if (!message || message === 'Erro ao criar usuário') {
      try {
        const ctx = error as any
        if (ctx?.context) {
          const body =
            typeof ctx.context === 'string'
              ? JSON.parse(ctx.context)
              : ctx.context
          message = extractErrorMessage(body, 'Erro ao criar usuário')
        }
      } catch {
        // keep default message
      }
    }
    return { data: null, error: { message } }
  }

  if (result?.error) {
    return { data: null, error: { message: String(result.error) } }
  }

  return { data: result, error: null }
}

export const adminChangePassword = async (
  userId: string,
  newPassword: string,
) => {
  const headers = await getAuthHeaders()
  if (!headers) return sessionExpiredError()

  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'change_password',
        target_user_id: userId,
        new_password: newPassword,
      },
      headers,
    },
  )

  if (error) {
    let message = extractErrorMessage(data, '')
    if (!message) {
      message = extractErrorMessage(error, 'Erro ao alterar senha')
    }
    return { data: null, error: { message } }
  }

  return { data, error: null }
}
