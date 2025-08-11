// FUNCTIONALITY: Helper to create a Stripe Billing Portal session for an existing customer.

export type PortalDeps = {
  stripe: {
    billingPortal: { sessions: { create: (args: { customer: string; return_url: string }) => Promise<{ url: string | null }> } };
  };
};

export type CreatePortalInput = { customerId: string };
export type CreatePortalResult = { ok: true; url: string } | { ok: false; error: { where: 'input' | 'stripe'; err: any } };

export async function createCustomerPortalSession(
  input: CreatePortalInput,
  deps: PortalDeps,
  opts: { returnUrl: string }
): Promise<CreatePortalResult> {
  const { customerId } = input;
  const { stripe } = deps;
  const { returnUrl } = opts;

  if (!customerId) {
    return { ok: false, error: { where: 'input', err: new Error('Missing customerId') } };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    if (!session?.url) return { ok: false, error: { where: 'stripe', err: new Error('No session URL') } };
    return { ok: true, url: session.url };
  } catch (err) {
    return { ok: false, error: { where: 'stripe', err } };
  }
}
