import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const { method } = req

  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('is_super_admin, role')
      .eq('id', user.id)
      .single()

    const isAdmin =
      callerProfile?.is_super_admin ||
      callerProfile?.role?.toUpperCase() === 'ADMIN'

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        },
      )
    }

    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'delete_user': {
        const { target_user_id } = body
        if (!target_user_id) {
          return new Response(
            JSON.stringify({ error: 'target_user_id required' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        const { data: targetProfile } = await adminClient
          .from('profiles')
          .select('is_super_admin')
          .eq('id', target_user_id)
          .single()

        if (targetProfile?.is_super_admin) {
          return new Response(
            JSON.stringify({ error: 'Cannot delete super admin' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        const { error: authDeleteError } =
          await adminClient.auth.admin.deleteUser(target_user_id)
        if (authDeleteError) {
          await adminClient.from('profiles').delete().eq('id', target_user_id)
          return new Response(
            JSON.stringify({ error: authDeleteError.message }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        await adminClient.from('profiles').delete().eq('id', target_user_id)

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      case 'release_access': {
        const { target_user_id, access_allowed, subscription_status } = body
        if (!target_user_id) {
          return new Response(
            JSON.stringify({ error: 'target_user_id required' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }
        if (access_allowed !== undefined)
          updates.access_allowed = access_allowed
        if (subscription_status !== undefined)
          updates.subscription_status = subscription_status

        const { error: updateError } = await adminClient
          .from('profiles')
          .update(updates)
          .eq('id', target_user_id)

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      case 'validate_session': {
        const { target_user_id, session_id } = body
        if (!target_user_id || !session_id) {
          return new Response(
            JSON.stringify({ error: 'target_user_id and session_id required' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select(
            'current_session_id, access_allowed, subscription_status, status',
          )
          .eq('id', target_user_id)
          .single()

        if (profileError || !profile) {
          return new Response(
            JSON.stringify({ valid: false, reason: 'profile_not_found' }),
            {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        const sessionValid =
          !profile.current_session_id ||
          profile.current_session_id === session_id

        return new Response(
          JSON.stringify({
            valid: sessionValid,
            access_allowed: profile.access_allowed,
            subscription_status: profile.subscription_status,
            status: profile.status,
          }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          },
        )
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  }
})
