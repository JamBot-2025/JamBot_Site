import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock window.location
const originalLocation = window.location;
beforeAll(() => {
  // @ts-ignore
  delete window.location;
  // @ts-ignore
  window.location = { href: '' } as any;
});
afterAll(() => {
  window.location = originalLocation;
});

import ManageSubscription from './ManageSubscription';
import { supabase } from '../supabaseClient';

describe('ManageSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock location href
    // @ts-ignore
    window.location.href = '';
  });

  it('renders the manage billing button', () => {
    render(<ManageSubscription />);
    expect(screen.getByRole('button', { name: /manage billing in stripe portal/i })).toBeInTheDocument();
  });

  it('redirects to Stripe portal on successful flow', async () => {
    // Mock getUser
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-1' } } });
    // Mock profile fetch
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { stripe_customer_id: 'cus_123' }, error: null }),
        }),
      }),
    });
    // Mock invoke
    (supabase.functions.invoke as any).mockResolvedValue({ data: { url: 'https://portal.example.com' }, error: null });

    render(<ManageSubscription />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing in stripe portal/i }));
    // Wait for redirect
    await waitFor(() => expect(window.location.href).toBe('https://portal.example.com'));
  });

  it('shows error when getUser fails', async () => {
    (supabase.auth.getUser as any).mockRejectedValue(new Error('Not logged in'));
    render(<ManageSubscription />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing in stripe portal/i }));
    await waitFor(() => expect(screen.getByText(/not logged in/i)).toBeInTheDocument());
  });

  it('shows error when profile fetch fails', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-2' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Profile error' } }),
        }),
      }),
    });
    render(<ManageSubscription />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing in stripe portal/i }));
    await waitFor(() => expect(screen.getByText(/no stripe customer id found/i)).toBeInTheDocument());
  });

  it('shows error when invoke returns an error', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-3' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { stripe_customer_id: 'cus_456' }, error: null }),
        }),
      }),
    });
    (supabase.functions.invoke as any).mockResolvedValue({ data: null, error: { message: 'Invoke error' } });
    render(<ManageSubscription />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing in stripe portal/i }));
    await waitFor(() => expect(screen.getByText(/invoke error/i)).toBeInTheDocument());
  });

  it('shows error when no portal URL is returned', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-4' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { stripe_customer_id: 'cus_789' }, error: null }),
        }),
      }),
    });
    (supabase.functions.invoke as any).mockResolvedValue({ data: {}, error: null });
    render(<ManageSubscription />);
    fireEvent.click(screen.getByRole('button', { name: /manage billing in stripe portal/i }));
    await waitFor(() => expect(screen.getByText(/no portal url returned/i)).toBeInTheDocument());
  });
});
