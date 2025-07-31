import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn()
    }
  }
}));

// Mock useNavigate from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import { supabase } from '../supabaseClient';

const setup = (props = {}) => {
  return render(<LoginForm {...props} />);
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    setup();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    setup();
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'notanemail' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
  });

  it('shows error if supabase returns error (wrong password)', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    setup();
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument();
  });

  it('calls onLoginSuccess and navigates on successful login', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null });
    const onLoginSuccess = vi.fn();
    setup({ onLoginSuccess });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });

  it('shows loading indicator while logging in', async () => {
    let resolvePromise: any;
    (supabase.auth.signInWithPassword as any).mockImplementation(() => new Promise((resolve) => { resolvePromise = resolve; }));
    setup();
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    resolvePromise({ error: null });
  });
});
