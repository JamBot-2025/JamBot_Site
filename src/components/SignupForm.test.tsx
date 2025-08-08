// SignupForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import { SignupForm } from './SignupForm';
import { supabase } from '../supabaseClient';

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('renders all input fields and submit button', () => {
    render(<SignupForm />);
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password (min. 8 characters)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  test('shows validation errors when required fields are empty', async () => {
    render(<SignupForm />);
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Phone Number is required')).toBeInTheDocument();
    });
  });

  test('shows email format validation error', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
  });

  test('shows password length validation error', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  test('successful signup displays success message and navigates after timeout', async () => {
    // Mock successful signUp
    (supabase.auth.signUp as any).mockResolvedValue({ error: null });
    // Mock getUser to return a user id
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } });
    // Mock functions.invoke to resolve
    (supabase.functions.invoke as any).mockResolvedValue({});

    render(<SignupForm />);

    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Check your email to verify your account.')).toBeInTheDocument();
    });

    // Fast-forward timer to trigger navigation
    vi.runAllTimers();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('signup error displays submit error message', async () => {
    (supabase.auth.signUp as any).mockResolvedValue({ error: { message: 'Signup failed' } });
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    await waitFor(() => {
      expect(screen.getByText('Sign up failed. Please try again.')).toBeInTheDocument();
    });
  });
});
