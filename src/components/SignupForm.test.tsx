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

// Stub modal components to simple content so we can assert visibility
vi.mock('./TermsOfService', () => ({
  TermsOfService: ({ isOpen }: any) => (isOpen ? <div>Terms Content</div> : null),
}));
vi.mock('./PrivacyPolicy', () => ({
  PrivacyPolicy: ({ isOpen }: any) => (isOpen ? <div>Privacy Content</div> : null),
}));

// Mock react-router-dom navigation preserving other exports
let mockNavigate: ReturnType<typeof vi.fn>;
vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { SignupForm } from './SignupForm';
import { supabase } from '../supabaseClient';

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
  });

  afterEach(() => {
    // no-op
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
    const terms = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    fireEvent.click(terms);
    expect(terms.checked).toBe(true);
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Phone Number is required')).toBeInTheDocument();
  });

  test('shows email format validation error', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    const terms = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    fireEvent.click(terms);
    expect(terms.checked).toBe(true);
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByText('Email is invalid')).toBeInTheDocument();
  });

  test('shows password length validation error', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    const terms = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    fireEvent.click(terms);
    expect(terms.checked).toBe(true);
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  test('successful signup displays success message, clears form, and navigates after timeout', async () => {
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
    const terms = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    fireEvent.click(terms);
    expect(terms.checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Wait for success message
    expect(await screen.findByText('Check your email to verify your account.')).toBeInTheDocument();
    // Fields should be cleared
    expect(screen.getByPlaceholderText('Full name')).toHaveValue('');
    expect(screen.getByPlaceholderText('Email address')).toHaveValue('');
    expect(screen.getByPlaceholderText('Password (min. 8 characters)')).toHaveValue('');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('');

    // The component redirects after 1500ms; wait up to 2000ms
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'), { timeout: 2000 });
  });

  test('signup error displays submit error message', async () => {
    (supabase.auth.signUp as any).mockResolvedValue({ error: { message: 'Signup failed' } });
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    const terms2 = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    fireEvent.click(terms2);
    expect(terms2.checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByText('Sign up failed. Please try again.')).toBeInTheDocument();
  });

  test('shows Stripe customer creation warning when signup-hook fails', async () => {
    (supabase.auth.signUp as any).mockResolvedValue({ error: null });
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-456' } } });
    (supabase.functions.invoke as any).mockRejectedValue(new Error('invoke failed'));

    render(<SignupForm />);

    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '9876543210' } });
    const terms3 = screen.getByLabelText(/i agree/i) as HTMLInputElement;
    fireEvent.click(terms3);
    expect(terms3.checked).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(
      await screen.findByText(
        /Account created, but failed to create Stripe customer\. Please contact support if you have issues subscribing\./i
      )
    ).toBeInTheDocument();
  });

  test('footer Log In button navigates to login', async () => {
    render(<SignupForm />);

    const footerLoginBtn = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(footerLoginBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('opens Terms of Service and Privacy Policy modals', async () => {
    render(<SignupForm />);

    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    fireEvent.click(termsLink);
    expect(await screen.findByText(/Terms Content/i)).toBeInTheDocument();

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    fireEvent.click(privacyLink);
    expect(await screen.findByText(/Privacy Content/i)).toBeInTheDocument();
  });
});
