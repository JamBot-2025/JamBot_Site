import { describe, it, expect } from 'vitest';
import {
  handleStripeEvent,
  parseStripeSignatureHeader,
  computeStripeSignatureV1,
  verifyStripeSignature,
  type SupabaseClientLike,
  type StripeEvent,
} from './lib';

function makeSupabaseMock() {
  const calls: any[] = [];
  let nextSelectResult: { data?: any; error?: any } = { data: undefined, error: undefined };
  let nextUpdateError: any = undefined;

  const supabase: SupabaseClientLike = {
    from: (table: string) => ({
      update: (values: Record<string, any>) => ({
        eq: async (col: string, val: any) => {
          calls.push({ type: 'update', table, values, col, val });
          return { error: nextUpdateError } as any;
        },
      }),
      select: (_cols: string) => ({
        eq: (_col: string, _val: any) => ({
          single: async () => nextSelectResult,
        }),
      }),
    }),
  };

  return {
    supabase,
    calls,
    setNextSelectResult: (res: { data?: any; error?: any }) => (nextSelectResult = res),
    setNextUpdateError: (err: any) => (nextUpdateError = err),
  };
}

describe('handleStripeEvent', () => {
  it('activates profile on checkout.session.completed', async () => {
    const { supabase, calls } = makeSupabaseMock();
    const event: StripeEvent = {
      type: 'checkout.session.completed',
      data: { object: { customer: 'cus_123' } },
    };
    const res = await handleStripeEvent(supabase, event);
    expect(res.error).toBeNull();
    expect(calls).toEqual([
      {
        type: 'update',
        table: 'profiles',
        values: { subscription_status: 'active' },
        col: 'stripe_customer_id',
        val: 'cus_123',
      },
    ]);
  });

  it('sets incomplete when not already active', async () => {
    const { supabase, calls, setNextSelectResult } = makeSupabaseMock();
    setNextSelectResult({ data: { subscription_status: 'trialing' } });
    const event: StripeEvent = {
      type: 'customer.subscription.created',
      data: { object: { customer: 'cus_456', status: 'incomplete' } },
    };
    const res = await handleStripeEvent(supabase, event);
    expect(res.error).toBeNull();
    // One select + one update
    expect(calls).toContainEqual({
      type: 'update',
      table: 'profiles',
      values: { subscription_status: 'incomplete' },
      col: 'stripe_customer_id',
      val: 'cus_456',
    });
  });

  it('skips setting incomplete when already active', async () => {
    const { supabase, calls, setNextSelectResult } = makeSupabaseMock();
    setNextSelectResult({ data: { subscription_status: 'active' } });
    const event: StripeEvent = {
      type: 'customer.subscription.updated',
      data: { object: { customer: 'cus_789', status: 'incomplete' } },
    };
    const res = await handleStripeEvent(supabase, event);
    expect(res.error).toBeNull();
    // No update call should have been made
    expect(calls.filter(c => c.type === 'update')).toHaveLength(0);
  });

  it('updates plan and next billing date on active subscription', async () => {
    const { supabase, calls } = makeSupabaseMock();
    const event: StripeEvent = {
      type: 'invoice.paid',
      data: {
        object: {
          customer: 'cus_999',
          status: 'active',
          items: { data: [{ price: { nickname: 'Pro', id: 'price_123' }, current_period_end: 1700000000 }] },
        },
      },
    };
    const res = await handleStripeEvent(supabase, event);
    expect(res.error).toBeNull();
    const updateCall = calls.find(c => c.type === 'update');
    expect(updateCall.values.subscription_status).toBe('active');
    expect(updateCall.values.subscription_plan).toBe('Pro');
    expect(typeof updateCall.values.next_billing_date).toBe('string');
    expect(updateCall.col).toBe('stripe_customer_id');
    expect(updateCall.val).toBe('cus_999');
  });

  it('sets canceled status on subscription deleted', async () => {
    const { supabase, calls } = makeSupabaseMock();
    const event: StripeEvent = {
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_del' } },
    };
    const res = await handleStripeEvent(supabase, event);
    expect(res.error).toBeNull();
    const updateCall = calls.find(c => c.type === 'update');
    expect(updateCall.values).toEqual({
      subscription_status: 'canceled',
      subscription_plan: null,
      next_billing_date: null,
    });
  });
});

describe('signature verification helpers', () => {
  it('parses a valid signature header', () => {
    const hdr = 't=1700000000, v1=abcdef';
    const { timestamp, v1 } = parseStripeSignatureHeader(hdr);
    expect(timestamp).toBe('1700000000');
    expect(v1).toBe('abcdef');
  });

  it('throws on malformed signature header', () => {
    expect(() => parseStripeSignatureHeader('t=1700000000')).toThrow();
    expect(() => parseStripeSignatureHeader('v1=abc')).toThrow();
    expect(() => parseStripeSignatureHeader('')).toThrow();
    // @ts-expect-error deliberately passing undefined
    expect(() => parseStripeSignatureHeader(undefined)).toThrow();
  });

  it('verifies a valid signature and returns parsed body', async () => {
    const secret = 'whsec_test_secret';
    const body = JSON.stringify({ hello: 'world' });
    const timestamp = '1700000000';
    const v1 = await computeStripeSignatureV1(body, secret, timestamp);
    const header = `t=${timestamp}, v1=${v1}`;
    const parsed = await verifyStripeSignature(body, header, secret);
    expect(parsed).toEqual({ hello: 'world' });
  });

  it('rejects an invalid signature', async () => {
    const secret = 'whsec_test_secret';
    const body = JSON.stringify({ ok: true });
    const header = 't=1700000000, v1=deadbeef';
    await expect(verifyStripeSignature(body, header, secret)).rejects.toThrow(/Invalid Stripe signature/);
  });
});
