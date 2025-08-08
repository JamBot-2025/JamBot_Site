import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// ResetPasswordPage will be imported after mocks (see below)
import { vi } from 'vitest';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

// Get references to the mocked functions after import
import { supabase } from '../supabaseClient';
const mockUpdateUser = supabase.auth.updateUser as any;
const mockGetSession = supabase.auth.getSession as any;

// Import component after mocks
import ResetPasswordPage from './ResetPasswordPage';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks form if no valid session', async () => {
    mockGetSession.mockResolvedValue({ data: { user: null, session: null } });
    render(<ResetPasswordPage />);
    await waitFor(() => {
      expect(screen.getByText(/Invalid or expired reset link/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows form if session and user exist', async () => {
    mockGetSession.mockResolvedValue({
  data: {
    session: {
      access_token: 'abc',
      user: { id: '123', email: 'reset@example.com' },
    },
    user: { id: '123', email: 'reset@example.com' },
  },
});
    render(<ResetPasswordPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('New password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('validates password confirmation', async () => {
    mockGetSession.mockResolvedValue({
  data: {
    session: {
      access_token: 'abc',
      user: { id: '123', email: 'reset@example.com' },
    },
    user: { id: '123', email: 'reset@example.com' },
  },
});
    render(<ResetPasswordPage />);
    await waitFor(() => screen.getByLabelText('New password'), { timeout: 3000 });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('shows error if updateUser fails', async () => {
    mockGetSession.mockResolvedValue({
  data: {
    session: {
      access_token: 'abc',
      user: { id: '123', email: 'reset@example.com' },
    },
    user: { id: '123', email: 'reset@example.com' },
  },
});
    mockUpdateUser.mockResolvedValue({ error: { message: 'Update failed' } });
    render(<ResetPasswordPage />);
    await waitFor(() => screen.getByLabelText('New password'), { timeout: 3000 });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    expect(await screen.findByText(/Error updating password/i)).toBeInTheDocument();
  });

  it('calls updateUser and resets on success', async () => {
    mockGetSession.mockResolvedValue({
  data: {
    session: {
      access_token: 'abc',
      user: { id: '123', email: 'reset@example.com' },
    },
    user: { id: '123', email: 'reset@example.com' },
  },
});
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<ResetPasswordPage />);
    await waitFor(() => screen.getByLabelText('New password'), { timeout: 3000 });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpass' }), { timeout: 3000 });
  });
});
