import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

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

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

import { supabase } from '../supabaseClient';
import Welcome from './Welcome';

describe('Welcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
  });

  it('shows error when user is not logged in', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: null });
    render(<Welcome />);
    await waitFor(() => expect(screen.getByText(/you must be logged in/i)).toBeInTheDocument());
  });

  it('navigates to account when profile row is created', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u1', email: 'e@e.com', user_metadata: {} } }, error: null });
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    render(<Welcome />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/account'));
  });

  it('navigates to account on duplicate profile row (23505)', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u2', email: 'e@e.com', user_metadata: {} } }, error: null });
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { code: '23505' } }),
    });
    render(<Welcome />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/account'));
  });
});
