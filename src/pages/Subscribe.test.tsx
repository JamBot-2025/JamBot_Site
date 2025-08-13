import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-router-dom's useNavigate and capture the mock for assertions
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

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
    navigateMock.mockReset();
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

  it('navigates to /account from subscribed view button', async () => {
    const user = { id: 'user-4' } as any;
    mockSupabaseFrom({ subscription_status: 'active', subscription_plan: 'Pro', next_billing_date: null });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => expect(screen.getByText(/you are already subscribed/i)).toBeInTheDocument());
    const goBtn = screen.getByRole('button', { name: /go to account/i });
    fireEvent.click(goBtn);
    expect(navigateMock).toHaveBeenCalledWith('/account');
  });

  it('navigates to /account from unsubscribed view button', async () => {
    const user = { id: 'user-5' } as any;
    mockSupabaseFrom({ subscription_status: 'inactive' });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => expect(screen.getByText(/subscribe to a plan/i)).toBeInTheDocument());
    const goBtn = screen.getByRole('button', { name: /go to account/i });
    fireEvent.click(goBtn);
    expect(navigateMock).toHaveBeenCalledWith('/account');
  });

  it('clicking Subscribe with Stripe redirects when invoke returns url', async () => {
    const user = { id: 'user-6' } as any;
    mockSupabaseFrom({ subscription_status: 'inactive' });
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-6', email: 'u6@example.com' } } });
    (supabase.functions.invoke as any).mockResolvedValue({ data: { url: 'https://checkout.example' }, error: null });
    // Stub window.location to observe href assignment
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { href: '', assign: vi.fn() },
      writable: true,
      configurable: true,
    });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => screen.getByRole('button', { name: /subscribe with stripe/i }));
    const subBtn = screen.getByRole('button', { name: /subscribe with stripe/i });
    fireEvent.click(subBtn);
    // Page switches to global Loading view when loading=true
    await waitFor(() => expect(screen.getByText(/loading/i)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /subscribe with stripe/i })).toBeNull();
    await waitFor(() => {
      expect((window as any).location.href).toBe('https://checkout.example');
    });
    // Restore
    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  it('shows error when invoke returns error', async () => {
    const user = { id: 'user-7' } as any;
    mockSupabaseFrom({ subscription_status: 'inactive' });
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-7', email: 'u7@example.com' } } });
    (supabase.functions.invoke as any).mockResolvedValue({ data: null, error: { message: 'boom' } });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => screen.getByRole('button', { name: /subscribe with stripe/i }));
    fireEvent.click(screen.getByRole('button', { name: /subscribe with stripe/i }));
    await waitFor(() => expect(screen.getByText(/boom/i)).toBeInTheDocument());
  });

  it('shows no-url error when invoke returns no url', async () => {
    const user = { id: 'user-8' } as any;
    mockSupabaseFrom({ subscription_status: 'inactive' });
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-8', email: 'u8@example.com' } } });
    (supabase.functions.invoke as any).mockResolvedValue({ data: {}, error: null });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => screen.getByRole('button', { name: /subscribe with stripe/i }));
    fireEvent.click(screen.getByRole('button', { name: /subscribe with stripe/i }));
    await waitFor(() => expect(screen.getByText(/no checkout url returned/i)).toBeInTheDocument());
  });

  it('shows login-required error when clicking subscribe without auth user', async () => {
    const user = { id: 'user-9' } as any;
    mockSupabaseFrom({ subscription_status: 'inactive' });
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => screen.getByRole('button', { name: /subscribe with stripe/i }));
    fireEvent.click(screen.getByRole('button', { name: /subscribe with stripe/i }));
    await waitFor(() => expect(screen.getByText(/you must be logged in to subscribe/i)).toBeInTheDocument());
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('treats PGRST116 (no row) as unsubscribed', async () => {
    const user = { id: 'user-10' } as any;
    mockSupabaseFrom(null, { code: 'PGRST116' });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => expect(screen.getByText(/subscribe to a plan/i)).toBeInTheDocument());
  });

  it('does not show next billing date when null', async () => {
    const user = { id: 'user-11' } as any;
    mockSupabaseFrom({ subscription_status: 'active', subscription_plan: 'Pro', next_billing_date: null });
    render(<SubscribePage user={user} authChecked={true} />);
    await waitFor(() => expect(screen.getByText(/you are already subscribed/i)).toBeInTheDocument());
    expect(screen.queryByText(/next billing date/i)).toBeNull();
  });
});
