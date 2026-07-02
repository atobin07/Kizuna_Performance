import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId =
          typeof session.customer === 'string' ? session.customer : null
        const email = session.customer_details?.email ?? null
        const tier = (session.metadata?.tier as string) ?? null

        if (email) {
          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              tier: tier === 'private' || tier === 'semi_private' ? tier : null,
            })
            .eq('email', email)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId =
          typeof sub.customer === 'string' ? sub.customer : null
        if (customerId) {
          await supabase
            .from('profiles')
            .update({ tier: null })
            .eq('stripe_customer_id', customerId)
        }
        break
      }
      default:
        break
    }
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
