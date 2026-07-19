import { supabase } from '@/lib/supabase/client'

export const deleteUserPermanently = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: { action: 'delete_user', target_user_id: userId },
    },
  )
  return { data, error }
}

export const releaseUserAccess = async (
  userId: string,
  accessAllowed: boolean,
  subscriptionStatus: string,
) => {
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'release_access',
        target_user_id: userId,
        access_allowed: accessAllowed,
        subscription_status: subscriptionStatus,
      },
    },
  )
  return { data, error }
}

export const renewUserAccess = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: { action: 'renew_access', target_user_id: userId },
    },
  )
  return { data, error }
}

export const validateSession = async (userId: string, sessionId: string) => {
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'validate_session',
        target_user_id: userId,
        session_id: sessionId,
      },
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
  const { data: result, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'create_user',
        target_email: data.email,
        target_password: data.password,
        target_name: data.name,
        target_role: data.role,
        target_company_id: data.companyId,
        subscription_type: data.subscriptionType,
        monthly_fee: data.monthlyFee,
        active_modules: data.activeModules,
      },
    },
  )
  return { data: result, error }
}

export const adminChangePassword = async (
  userId: string,
  newPassword: string,
) => {
  const { data, error } = await supabase.functions.invoke(
    'manage-user-access',
    {
      body: {
        action: 'change_password',
        target_user_id: userId,
        new_password: newPassword,
      },
    },
  )
  return { data, error }
}
