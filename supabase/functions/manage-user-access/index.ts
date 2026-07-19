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

      case 'renew_access': {
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

        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select('monthly_fee, subscription_type, next_billing_date')
          .eq('id', target_user_id)
          .single()

        if (profileError || !profile) {
          return new Response(JSON.stringify({ error: 'Profile not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        const amount = Number(profile.monthly_fee) || 0

        const baseDate = profile.next_billing_date
          ? new Date(profile.next_billing_date)
          : new Date()
        const newBillingDate = new Date(baseDate)
        newBillingDate.setMonth(newBillingDate.getMonth() + 1)

        if (newBillingDate < new Date()) {
          newBillingDate.setMonth(new Date().getMonth() + 1)
          newBillingDate.setDate(new Date().getDate())
        }

        await adminClient.from('payment_logs').insert({
          profile_id: target_user_id,
          amount,
          payment_date: new Date().toISOString(),
          created_by_admin_id: user.id,
        })

        const { error: updateError } = await adminClient
          .from('profiles')
          .update({
            access_allowed: true,
            subscription_status: 'active',
            access_expires_at: newBillingDate.toISOString(),
            next_billing_date: newBillingDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', target_user_id)

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        return new Response(
          JSON.stringify({
            success: true,
            new_billing_date: newBillingDate.toISOString(),
            amount,
          }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          },
        )
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
            'current_session_id, access_allowed, subscription_status, status, next_billing_date, subscription_type',
          )
          .eq('id', target_user_id)
          .single()

        if (profileError || !profile) {
          return new Response(
            JSON.stringify({ valid: false, reason: 'profile_not_found' }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
          )
        }

        await adminClient.rpc('block_expired_users')

        const sessionValid =
          !profile.current_session_id ||
          profile.current_session_id === session_id

        const billingExpired =
          profile.next_billing_date &&
          new Date(profile.next_billing_date) < new Date()

        return new Response(
          JSON.stringify({
            valid: sessionValid && !billingExpired,
            access_allowed: profile.access_allowed && !billingExpired,
            subscription_status: billingExpired
              ? 'expired'
              : profile.subscription_status,
            status: profile.status,
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        )
      }

      case 'create_user': {
        const {
          target_email,
          target_password,
          target_name,
          target_role,
          target_company_id,
          subscription_type,
          monthly_fee,
          active_modules,
        } = body
        if (!target_email || !target_password || !target_name) {
          return new Response(
            JSON.stringify({
              error:
                'target_email, target_password, and target_name are required',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        const { data: authData, error: authError } =
          await adminClient.auth.admin.createUser({
            email: target_email,
            password: target_password,
            email_confirm: true,
            user_metadata: {
              name: target_name,
              role: target_role || 'VENDEDOR',
              company_id: target_company_id || null,
            },
          })

        if (authError) {
          return new Response(JSON.stringify({ error: authError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        const now = new Date()
        let accessExpiresAt: string
        let nextBillingDate: string

        if (subscription_type === 'trial') {
          const expiry = new Date(now)
          expiry.setDate(expiry.getDate() + 10)
          accessExpiresAt = expiry.toISOString()
          nextBillingDate = expiry.toISOString()
        } else {
          const expiry = new Date(now)
          expiry.setMonth(expiry.getMonth() + 1)
          accessExpiresAt = expiry.toISOString()
          nextBillingDate = expiry.toISOString()
        }

        const { error: profileError } = await adminClient
          .from('profiles')
          .upsert(
            {
              id: authData.user.id,
              email: target_email,
              name: target_name,
              role: target_role || 'VENDEDOR',
              company_id: target_company_id || null,
              status: 'active',
              access_allowed: true,
              subscription_status: 'active',
              subscription_type: subscription_type || 'trial',
              monthly_fee: monthly_fee || 0,
              access_expires_at: accessExpiresAt,
              next_billing_date: nextBillingDate,
              active_modules: active_modules || ['melhor_preco'],
              updated_at: now.toISOString(),
            },
            { onConflict: 'id' },
          )

        if (profileError) {
          return new Response(JSON.stringify({ error: profileError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        return new Response(
          JSON.stringify({ success: true, user_id: authData.user.id }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          },
        )
      }

      case 'change_password': {
        const { target_user_id, new_password } = body
        if (!target_user_id || !new_password) {
          return new Response(
            JSON.stringify({
              error: 'target_user_id and new_password required',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }
        if (new_password.length < 6) {
          return new Response(
            JSON.stringify({ error: 'Password must be at least 6 characters' }),
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

        if (
          targetProfile?.is_super_admin &&
          callerProfile?.id !== target_user_id
        ) {
          return new Response(
            JSON.stringify({ error: 'Cannot change super admin password' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          )
        }

        const { error: updateError } =
          await adminClient.auth.admin.updateUserById(target_user_id, {
            password: new_password,
          })
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
