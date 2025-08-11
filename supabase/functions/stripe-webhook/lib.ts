// supabase/functions/stripe-webhook/lib.ts
// Pure helpers to enable Node/Vitest tests without Deno-specific imports.

export type SupabaseClientLike = {
  from: (table: string) => {
    update: (values: Record<string, any>) => {
      eq: (col: string, val: any) => Promise<{ data?: any; error?: any }>;
    };
    select: (cols: string) => {
      eq: (col: string, val: any) => {
        single: () => Promise<{ data?: any; error?: any }>;
      };
    };
  };
};

export type StripeEvent = {
  type: string;
  data: { object: any };
};

// --- Signature verification (universal: Deno or Node) ---
export function parseStripeSignatureHeader(signature: string) {
  if (!signature) throw new Error('Missing Stripe signature header');
  const parts = signature.split(',').map(s => s.trim());
  const tPart = parts.find(p => p.startsWith('t='));
  const v1Part = parts.find(p => p.startsWith('v1='));
  if (!tPart || !v1Part) throw new Error('Invalid Stripe signature header format');
  const timestamp = tPart.slice(2);
  const v1 = v1Part.slice(3);
  return { timestamp, v1 };
}

async function hmacSha256Hex(payload: string, secret: string): Promise<string> {
  // Prefer Web Crypto if available (Deno and modern Node)
  try {
    if (globalThis.crypto?.subtle) {
      const enc = new TextEncoder();
      const key = await globalThis.crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payload));
      return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (_) {
    // fall through to node crypto
  }
  // Fallback to Node's crypto (Vitest environment)
  const { createHmac } = await import('node:crypto');
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

export async function computeStripeSignatureV1(body: string, secret: string, timestamp: string) {
  const signedPayload = `${timestamp}.${body}`;
  return hmacSha256Hex(signedPayload, secret);
}

export async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<any> {
  const { timestamp, v1 } = parseStripeSignatureHeader(signature);
  const expected = await computeStripeSignatureV1(body, secret, timestamp);
  if (expected !== v1) throw new Error('Invalid Stripe signature');
  return JSON.parse(body);
}

// Handles all event-type-specific DB updates. No network or env access here.
export async function handleStripeEvent(supabase: SupabaseClientLike, event: StripeEvent) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer;
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('stripe_customer_id', customerId);
      return { error: error ?? null };
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;

      if (status === 'incomplete') {
        // Only set to incomplete if not already active
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('stripe_customer_id', customerId)
          .single();
        if (fetchError) return { error: fetchError };
        if (data?.subscription_status !== 'active') {
          const { error } = await supabase
            .from('profiles')
            .update({ subscription_status: status })
            .eq('stripe_customer_id', customerId);
          return { error: error ?? null };
        }
        return { error: null }; // skip update if already active
      } else {
        // Update plan and next billing date from Subscription object
        const subscriptionObj = subscription;
        const item = subscriptionObj.items?.data?.[0];
        const plan = item?.price?.nickname || item?.price?.id || null;
        const currentPeriodEnd = item?.current_period_end ?? subscriptionObj.current_period_end;
        const nextBillingDate = status === 'active' && currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null;
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            subscription_plan: plan,
            next_billing_date: nextBillingDate,
          })
          .eq('stripe_customer_id', customerId);
        return { error: error ?? null };
      }
    }

    // Invoice paid/succeeded: mark status active and set next billing from invoice
    case 'invoice.paid':
    case 'invoice.payment_succeeded': {
      // Invoice object schema differs from Subscription; compute fields safely
      const invoice = event.data.object;
      const customerId = invoice.customer;
      // On paid/succeeded, we can confidently mark status to active
      const status = 'active';
      const line = invoice.lines?.data?.[0];
      const plan = line?.price?.nickname || line?.price?.id || null;
      const periodEnd = line?.period?.end ?? invoice.period_end;
      const nextBillingDate = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: status,
          subscription_plan: plan,
          next_billing_date: nextBillingDate,
        })
        .eq('stripe_customer_id', customerId);
      return { error: error ?? null };
    }

    // Subscription canceled: clear plan and next billing, mark status canceled
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          subscription_plan: null,
          next_billing_date: null,
        })
        .eq('stripe_customer_id', customerId);
      return { error: error ?? null };
    }

    // Subscription expired (no renewal): mark status expired
    case 'customer.subscription.expired': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'expired' })
        .eq('stripe_customer_id', customerId);
      return { error: error ?? null };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      return { error: error ?? null };
    }

    default:
      return { error: null };
  }
}
