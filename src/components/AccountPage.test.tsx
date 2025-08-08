import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
      refreshSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import AccountPage from './AccountPage';
import { supabase } from '../supabaseClient';

describe('AccountPage', () => {
  const userDetails = { name: 'John Doe', email: 'john@example.com' };
  const setUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user information and active subscription details', async () => {
    // Mock authenticated user
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-1' } } });
    // Mock profile fetch with active subscription
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              subscription_status: 'active',
              subscription_plan: 'basic',
              next_billing_date: '2025-09-01',
            },
            error: null,
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    // Wait for loading to finish and subscription info to appear
    await waitFor(() => expect(screen.getByText(/Current Plan/i)).toBeInTheDocument());
    // Verify user name and email are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    // Verify plan name and price are shown
    expect(screen.getByText('Jambot')).toBeInTheDocument();
    expect(screen.getByText('$7.99/month')).toBeInTheDocument();
    // Verify status badge "Active"
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows subscribe button when no active subscription', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-2' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              subscription_status: 'canceled',
              subscription_plan: null,
              next_billing_date: null,
            },
            error: null,
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    await waitFor(() => expect(screen.getByText(/You have never subscribed/i)).toBeInTheDocument());
    // Subscribe button should be present
    expect(screen.getByRole('link', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('displays error message when profile fetch fails', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-3' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Profile fetch error' } }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    await waitFor(() => expect(screen.getByText(/Profile fetch error/i)).toBeInTheDocument());
  });

  it('signs out and navigates to login', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-4' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { subscription_status: 'active' }, error: null }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    // Wait for component to finish loading
    await waitFor(() => expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(setUser).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
