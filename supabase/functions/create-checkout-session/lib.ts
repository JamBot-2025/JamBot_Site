// FUNCTIONALITY: Helpers to create a Stripe Checkout session and handle customer lookup/creation.

export type CheckoutDeps = {
  stripe: {
    customers: { create: (args: { email: string; metadata?: Record<string, string> }) => Promise<{ id: string }> };
    checkout: { sessions: { create: (args: any) => Promise<{ url: string | null }> } };
  };
  supabase: {
    from: (table: string) => {
      select: (cols: string) => any;
      update: (values: any) => { eq: (col: string, val: any) => Promise<{ error?: any }> };
    };
  };
};

export type CreateCheckoutInput = {
  userId: string;
  email: string;
};

export type CreateCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: { where: 'input' | 'supabase' | 'stripe'; err: any } };

export async function createCheckoutSession(
  input: CreateCheckoutInput,
  deps: CheckoutDeps,
  opts: { priceId: string; successUrl: string; cancelUrl: string }
): Promise<CreateCheckoutResult> {
  const { userId, email } = input;
  const { stripe, supabase } = deps;
  const { priceId, successUrl, cancelUrl } = opts;

  if (!userId || !email) {
    return { ok: false, error: { where: 'input', err: new Error('Missing userId or email') } };
  }

  // 1) Get profile to check for existing customer
  let customerId: string | undefined;
  try {
    const sel = (supabase as any)
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single?.();
    const { data } = (await sel) || { data: undefined };
    customerId = data?.stripe_customer_id;
  } catch (err) {
    // If select fails, proceed to create a new customer (mirrors entrypoint behavior)
    customerId = undefined;
  }

  // 2) If missing, create Stripe customer and update profile (update result is non-fatal)
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } });
      customerId = customer.id;
    } catch (err) {
      return { ok: false, error: { where: 'stripe', err } };
    }

    try {
      await (supabase as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    } catch (err) {
      // Ignore update failure to mirror entrypoint resilience
    }
  }

  // 3) Create checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    if (!session?.url) {
      return { ok: false, error: { where: 'stripe', err: new Error('No session URL') } };
    }
    return { ok: true, url: session.url };
  } catch (err) {
    return { ok: false, error: { where: 'stripe', err } };
  }
}
