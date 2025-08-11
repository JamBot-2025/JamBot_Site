import { describe, it, expect, vi } from 'vitest';
import { createCheckoutSession } from './lib';

defaultSuite();

function defaultSuite() {
  describe('createCheckoutSession', () => {
    const makeStripe = () => ({
      customers: { create: vi.fn(async ({ email }) => ({ id: 'cus_123' })) },
      checkout: { sessions: { create: vi.fn(async () => ({ url: 'https://checkout.stripe.test/sess_123' })) } },
    });

    const makeSupabase = (opts?: { existingCustomerId?: string | null }) => {
      const data = opts?.existingCustomerId ? { stripe_customer_id: opts.existingCustomerId } : null;
      return {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ single: vi.fn(async () => ({ data })) }))
          })),
          update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: undefined })) }))
        }))
      } as any;
    };

    const opts = {
      priceId: 'price_test_123',
      successUrl: 'http://localhost/success',
      cancelUrl: 'http://localhost/cancel',
    };

    it('creates session when profile already has customer id (no new customer)', async () => {
      const stripe = makeStripe();
      const supabase = makeSupabase({ existingCustomerId: 'cus_existing' });

      const res = await createCheckoutSession({ userId: 'u1', email: 'a@b.com' }, { stripe, supabase }, opts);

      expect(res).toEqual({ ok: true, url: 'https://checkout.stripe.test/sess_123' });
      expect(stripe.customers.create).not.toHaveBeenCalled();
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
        customer: 'cus_existing',
        line_items: [{ price: 'price_test_123', quantity: 1 }],
      }));
    });

    it('creates customer and updates profile when missing, then creates session', async () => {
      const stripe = makeStripe();
      const supabase = makeSupabase({ existingCustomerId: null });

      const res = await createCheckoutSession({ userId: 'u2', email: 'c@d.com' }, { stripe, supabase }, opts);

      expect(res).toEqual({ ok: true, url: 'https://checkout.stripe.test/sess_123' });
      expect(stripe.customers.create).toHaveBeenCalledWith({ email: 'c@d.com', metadata: { supabase_user_id: 'u2' } });
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
    });

    it('returns input error when userId/email missing', async () => {
      const stripe = makeStripe();
      const supabase = makeSupabase();

      const res = await createCheckoutSession({ userId: '', email: '' } as any, { stripe, supabase }, opts);

      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.where).toBe('input');
    });

    it('propagates stripe error when customers.create fails', async () => {
      const stripe = makeStripe();
      (stripe.customers.create as any).mockRejectedValueOnce(new Error('boom'));
      const supabase = makeSupabase({ existingCustomerId: null });

      const res = await createCheckoutSession({ userId: 'u3', email: 'x@y.com' }, { stripe, supabase }, opts);

      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.where).toBe('stripe');
    });

    it('propagates stripe error when checkout.sessions.create fails', async () => {
      const stripe = makeStripe();
      (stripe.checkout.sessions.create as any).mockRejectedValueOnce(new Error('nope'));
      const supabase = makeSupabase({ existingCustomerId: 'cus_existing' });

      const res = await createCheckoutSession({ userId: 'u4', email: 'x@y.com' }, { stripe, supabase }, opts);

      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.where).toBe('stripe');
    });
  });
}
