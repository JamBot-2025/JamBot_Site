import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stripePromise, createSubscription } from './stripe';

describe('utils/stripe', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stripePromise resolves to an object with elements()', async () => {
    const stripe = await stripePromise;
    expect(stripe).toBeDefined();
    expect(typeof stripe.elements).toBe('function');
    const elements = stripe.elements();
    expect(elements).toBeDefined();
    expect(typeof elements.create).toBe('function');
  });

  it('createSubscription returns success with IDs after delay', async () => {
    const p = createSubscription('user@example.com', 'pm_test');
    // advance the 1s simulated delay
    await vi.advanceTimersByTimeAsync(1000);
    const res = await p;
    expect(res.success).toBe(true);
    expect(res.subscriptionId).toMatch(/^sub_/);
    expect(res.customerId).toMatch(/^cus_/);
  });

  it('createPaymentMethod returns id and last4', async () => {
    const stripe = await stripePromise;
    const result = await (stripe as any).createPaymentMethod();
    expect(result).toBeDefined();
    expect(result.paymentMethod.id).toMatch(/^pm_/);
    expect(result.paymentMethod.card.last4).toBe('4242');
  });

  it('elements().create() exposes mount/unmount without throwing', async () => {
    const stripe = await stripePromise;
    const elements = (stripe as any).elements();
    const card = elements.create('card');
    expect(typeof card.mount).toBe('function');
    expect(typeof card.unmount).toBe('function');
    expect(() => card.mount()).not.toThrow();
    expect(() => card.unmount()).not.toThrow();
  });
});
