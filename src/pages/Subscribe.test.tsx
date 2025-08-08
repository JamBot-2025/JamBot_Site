import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-router-dom's useNavigate and capture the mock for assertions
let navigateMock: any;
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => {
      navigateMock = vi.fn();
      return navigateMock;
    },
  };
});

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from '../supabaseClient';
import SubscribePage from './Subscribe';

// Helper to mock supabase.from chain for fetchSubscriptionStatus
const mockSupabaseFrom = (data: any, error: any = null) => {
  (supabase.from as any).mockImplementation(() => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data, error }),
      }),
    }),
  }));
};

describe('SubscribePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
  });

  it('shows loading indicator initially', () => {
    render(<SubscribePage user={null} authChecked={false} />);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('redirects to login when authChecked and no user', async () => {
    render(<SubscribePage user={null} authChecked={true} />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });

  it('shows subscribed view when user has active subscription', async () => {
    const user = { id: 'user-1' } as any;
    mockSupabaseFrom({ subscription_status: 'active', subscription_plan: 'Pro', next_billing_date: '2025-09-01' });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => expect(screen.getByText(/you are already subscribed/i)).toBeInTheDocument());
    expect(screen.getByText(/pro/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/next billing date/i)).toBeInTheDocument();
  });

  it('shows subscription offer when user is not subscribed', async () => {
    const user = { id: 'user-2' } as any;
    mockSupabaseFrom({ subscription_status: 'inactive' });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => expect(screen.getByText(/subscribe to a plan/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /subscribe with stripe/i })).toBeInTheDocument();
  });

  it('displays error message when fetching subscription status fails', async () => {
    const user = { id: 'user-3' } as any;
    // Mock supabase.from to throw an error, triggering catch block
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            throw new Error('Network error');
          },
        }),
      }),
    }));
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => expect(screen.getByText(/failed to fetch subscription status/i)).toBeInTheDocument());
  });
});
