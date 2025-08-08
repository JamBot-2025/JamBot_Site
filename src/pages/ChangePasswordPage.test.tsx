import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

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
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

// Get references to the mocked functions after import
import { supabase } from '../supabaseClient';
const mockGetUser = supabase.auth.getUser as any;
const mockSignIn = supabase.auth.signInWithPassword as any;
const mockUpdateUser = supabase.auth.updateUser as any;

// Import component after mocks
import ChangePasswordPage from './ChangePasswordPage';

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks form if no valid session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<ChangePasswordPage />);
    await waitFor(() => {
      expect(screen.getByText(/You must be logged in to change your password/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows form if session exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } });
    render(<ChangePasswordPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('Old Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('validates password confirmation', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } });
    render(<ChangePasswordPage />);
    await waitFor(() => screen.getByLabelText('Old Password'), { timeout: 3000 });
    fireEvent.change(screen.getByLabelText('Old Password'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('shows error if old password verification fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } });
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    render(<ChangePasswordPage />);
    await waitFor(() => screen.getByLabelText('Old Password'), { timeout: 3000 });
    fireEvent.change(screen.getByLabelText('Old Password'), { target: { value: 'wrongold' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    expect(await screen.findByText(/Old password is incorrect/i)).toBeInTheDocument();
  });

  it('shows error if updateUser fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } });
    mockSignIn.mockResolvedValue({ data: { user: {} }, error: null });
    mockUpdateUser.mockResolvedValue({ error: { message: 'Update failed' } });
    render(<ChangePasswordPage />);
    await waitFor(() => screen.getByLabelText('Old Password'), { timeout: 3000 });
    fireEvent.change(screen.getByLabelText('Old Password'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    expect(await screen.findByText(/Error updating password/i)).toBeInTheDocument();
  });

  it('calls updateUser and redirects on success', async () => {

    
    mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } });
    mockSignIn.mockResolvedValue({ data: { user: {} }, error: null });
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<ChangePasswordPage />);
    await waitFor(() => screen.getByLabelText('Old Password'), { timeout: 3000 });
    fireEvent.change(screen.getByLabelText('Old Password'), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpass' }), { timeout: 3000 });
  });
});
