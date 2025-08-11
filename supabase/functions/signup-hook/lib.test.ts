import { describe, it, expect } from 'vitest';
import { processSignup, type SignupPayload } from './lib';

function makeStripeMock() {
  let shouldThrow = false;
  let lastArgs: any = null;
  return {
    stripe: {
      customers: {
        create: async (args: any) => {
          lastArgs = args;
          if (shouldThrow) throw new Error('stripe fail');
          return { id: 'cus_test_123' };
        },
      },
    },
    setThrow: (v: boolean) => (shouldThrow = v),
    getLastArgs: () => lastArgs,
  };
}

function makeSupabaseMock() {
  const calls: any[] = [];
  let nextInsertResult: { error?: any } = { error: null };
  return {
    supabase: {
      from: (table: string) => ({
        insert: async (rows: any[]) => {
          calls.push({ type: 'insert', table, rows });
          return nextInsertResult;
        },
      }),
    },
    setInsertResult: (res: { error?: any }) => (nextInsertResult = res),
    calls,
  };
}

describe('processSignup', () => {
  it('creates stripe customer and inserts profile row (success)', async () => {
    const { stripe, getLastArgs } = makeStripeMock();
    const { supabase, calls } = makeSupabaseMock();
    const payload: SignupPayload = { id: 'user_1', email: 'a@b.com', name: 'Alice' };
    const res = await processSignup(payload, { stripe: stripe as any, supabase: supabase as any });
    expect(res).toEqual({ ok: true, customerId: 'cus_test_123' });
    // stripe call args
    expect(getLastArgs()).toEqual({ email: 'a@b.com', name: 'Alice', metadata: { user_id: 'user_1' } });
    // supabase insert
    expect(calls).toEqual([
      {
        type: 'insert',
        table: 'profiles',
        rows: [{ id: 'user_1', name: 'Alice', stripe_customer_id: 'cus_test_123' }],
      },
    ]);
  });

  it('returns error when stripe creation fails', async () => {
    const sm = makeStripeMock();
    sm.setThrow(true);
    const { supabase } = makeSupabaseMock();
    const payload: SignupPayload = { id: 'user_2', email: 'e@x.com', name: 'Eve' };
    const res = await processSignup(payload, { stripe: sm.stripe as any, supabase: supabase as any });
    expect(res.ok).toBe(false);
    // @ts-expect-error - narrowing runtime structure
    expect(res.error.where).toBe('stripe');
  });

  it('treats unique violation as success', async () => {
    const { stripe } = makeStripeMock();
    const sb = makeSupabaseMock();
    sb.setInsertResult({ error: { code: '23505' } });
    const payload: SignupPayload = { id: 'user_3', email: 'u@q.com', name: 'Uma' };
    const res = await processSignup(payload, { stripe: stripe as any, supabase: sb.supabase as any });
    expect(res.ok).toBe(true);
  });

  it('returns error for non-unique insert error', async () => {
    const { stripe } = makeStripeMock();
    const sb = makeSupabaseMock();
    sb.setInsertResult({ error: { code: '50000', message: 'db down' } });
    const payload: SignupPayload = { id: 'user_4', email: 'z@y.com', name: 'Zed' };
    const res = await processSignup(payload, { stripe: stripe as any, supabase: sb.supabase as any });
    expect(res.ok).toBe(false);
    // @ts-expect-error - narrowing runtime structure
    expect(res.error.where).toBe('supabase');
  });
});
