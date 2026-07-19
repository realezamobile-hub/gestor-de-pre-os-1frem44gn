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
