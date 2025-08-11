import { describe, it, expect, vi } from 'vitest';
import { createCustomerPortalSession } from './lib';

describe('createCustomerPortalSession', () => {
  const makeStripe = () => ({
    billingPortal: { sessions: { create: vi.fn(async () => ({ url: 'https://portal.stripe.test/sess_abc' })) } },
  });

  const opts = { returnUrl: 'http://localhost/account' };

  it('creates portal session and returns url', async () => {
    const stripe = makeStripe();

    const res = await createCustomerPortalSession({ customerId: 'cus_123' }, { stripe } as any, opts);

    expect(res).toEqual({ ok: true, url: 'https://portal.stripe.test/sess_abc' });
    expect((stripe as any).billingPortal.sessions.create).toHaveBeenCalledWith({ customer: 'cus_123', return_url: 'http://localhost/account' });
  });

  it('returns input error when customerId missing', async () => {
    const stripe = makeStripe();

    const res = await createCustomerPortalSession({ customerId: '' } as any, { stripe } as any, opts);

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.where).toBe('input');
  });

  it('propagates stripe error when create fails', async () => {
    const stripe = makeStripe();
    (stripe as any).billingPortal.sessions.create.mockRejectedValueOnce(new Error('bad'));

    const res = await createCustomerPortalSession({ customerId: 'cus_123' }, { stripe } as any, opts);

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.where).toBe('stripe');
  });
});
