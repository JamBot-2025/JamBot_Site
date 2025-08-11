// supabase/functions/signup-hook/lib.ts

// FUNCTIONALITY: Helpers to create a Stripe customer and insert a Supabase profile row during signup.

// NOTE: Helper enables Node/Vitest tests without Deno-specific imports.

export type StripeLike = {
  customers: {
    create: (args: { email: string; name: string; metadata: { user_id: string } }) => Promise<{ id: string }>;
  };
};

export type SupabaseClientLike = {
  from: (table: string) => {
    insert: (rows: any[]) => Promise<{ data?: any; error?: { code?: string } | null }>;
  };
};

export type SignupPayload = { id: string; email: string; name: string };

export async function processSignup(
  payload: SignupPayload,
  deps: { stripe: StripeLike; supabase: SupabaseClientLike }
): Promise<{ ok: true; customerId: string } | { ok: false; error: any }> {
  const { id, email, name } = payload;
  const { stripe, supabase } = deps;

  // 1) Create Stripe customer
  let customerId: string;
  try {
    const customer = await stripe.customers.create({ email, name, metadata: { user_id: id } });
    customerId = customer.id;
  } catch (err) {
    return { ok: false, error: { where: 'stripe', err } };
  }

  // 2) Insert profile row
  const { error: insertError } = await supabase
    .from('profiles')
    .insert([{ id, name, stripe_customer_id: customerId }]);

  // Treat unique violation (23505) as non-fatal
  if (insertError && insertError.code !== '23505') {
    return { ok: false, error: { where: 'supabase', err: insertError } };
  }

  return { ok: true, customerId };
}
