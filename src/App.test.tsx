
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock supabase client
vi.mock('../supabaseClient', () => ({
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
});
