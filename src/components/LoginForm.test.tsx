import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-router-dom's useNavigate
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
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

// Get reference to the mocked functions after import
import { supabase } from '../supabaseClient';
const mockSignIn = supabase.auth.signInWithPassword as any;
const mockResetPassword = supabase.auth.resetPasswordForEmail as any;

// Import component after mocks
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'somepass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await screen.findByText(/email is invalid/i, undefined, { timeout: 5000 });
  });

  it('shows error when supabase returns an error (wrong credentials)', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument();
  });

  it('calls onLoginSuccess and navigates on successful login', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const onLoginSuccess = vi.fn();
    render(<LoginForm onLoginSuccess={onLoginSuccess} />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'correctpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });

  it('shows loading indicator while logging in', async () => {
    // Mock signIn to resolve immediately
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'correctpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    // Button text should change to loading state
    await waitFor(() => expect(screen.getByText(/logging in/i)).toBeInTheDocument());
    // After async resolves, button should return to normal state
    await waitFor(() => expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument());
  });

  it('shows success message after forgot password request', async () => {
    mockResetPassword.mockResolvedValue({ error: null });
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /forgot password\?/i }));
    // Loading state
    await waitFor(() => expect(screen.getByText(/sending\.{3}/i)).toBeInTheDocument());
    // Success message
    await waitFor(() => expect(screen.getByText(/password reset email sent!/i)).toBeInTheDocument());
  });

  it('shows error message when forgot password fails', async () => {
    mockResetPassword.mockResolvedValue({ error: { message: 'Reset error' } });
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /forgot password\?/i }));
    // Loading state
    await waitFor(() => expect(screen.getByText(/sending\.{3}/i)).toBeInTheDocument());
    // Error message
    await waitFor(() => expect(screen.getByText(/error: reset error/i)).toBeInTheDocument());
  });
});
