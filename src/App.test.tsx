
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { supabase } from './supabaseClient';

// Mock supabase client
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    functions: { invoke: vi.fn() },
    from: vi.fn(),
  },
}));

// Mock Stripe Elements and stripePromise
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <>{children}</>,
}));
vi.mock('../utils/stripe', () => ({ stripePromise: Promise.resolve({}) }));

// Mock lazy‑loaded pages/components with correct relative paths
vi.mock('./pages/Subscribe', () => ({ __esModule: true, default: () => <div>SubscribePage Mock</div> }));
vi.mock('./components/AccountPage', () => ({ __esModule: true, default: () => <div>AccountPage Mock</div> }));

import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and shows main sections', async () => {
    render(<App />);
    // Wait for async auth check to complete and then verify sections exist (use getAllByText to avoid multiple matches)
    await waitFor(() => expect(screen.getAllByText(/features/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/pricing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/contact/i).length).toBeGreaterThan(0);
  });

  it('invokes signup-hook when user exists and profile is missing', async () => {
    const user = { id: 'user_1', email: 'u@example.com', user_metadata: { full_name: 'User One' } };
    // make getUser return a user
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user } });
    // mock from().select().eq().single() -> { data: undefined } so ensureProfileRow triggers
    (supabase.from as any).mockReturnValue({
      select: (_cols: string) => ({
        eq: (_col: string, _val: any) => ({
          single: async () => ({ data: undefined, error: null }),
        }),
      }),
      update: (_vals: any) => ({
        eq: async () => ({ error: null }),
      }),
    });

    render(<App />);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('signup-hook', expect.objectContaining({
        body: expect.objectContaining({ id: 'user_1', email: 'u@example.com' }),
      }));
    });
  });

  it('navigates to /account when logged in and to /login when logged out (Account route)', async () => {
    // Logged-in: push /account and expect AccountPage to render
    (supabase.from as any).mockReturnValue({
      select: (_cols: string) => ({
        eq: (_col: string, _val: any) => ({
          single: async () => ({ data: { id: 'user_1' }, error: null }),
        }),
      }),
      update: (_vals: any) => ({
        eq: async () => ({ error: null }),
      }),
    });

    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user_1', email: 'u@example.com', user_metadata: {} } } });
    window.history.pushState({}, '', '/account');
    render(<App />);
    expect(await screen.findByText(/AccountPage Mock/i)).toBeInTheDocument();

    // Logged-out: push /account and expect redirect to login form
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });
    window.history.pushState({}, '', '/account');
    render(<App />);
    // LoginForm heading
    expect(await screen.findByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });
});
