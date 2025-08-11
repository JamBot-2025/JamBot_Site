import { render, screen, fireEvent, within } from '@testing-library/react';
import { Header } from './Header';
import { vi } from 'vitest';

// Mock react-router navigate
let mockNavigate: ReturnType<typeof vi.fn>;
vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header', () => {
  beforeEach(() => {
    mockNavigate = vi.fn();
  });

  it('renders desktop nav links with correct hrefs', () => {
    render(<Header user={null} />);

    const features = screen.getAllByRole('link', { name: /features/i })[0];
    const pricing = screen.getAllByRole('link', { name: /pricing/i })[0];
    const contact = screen.getAllByRole('link', { name: /contact/i })[0];

    expect(features).toHaveAttribute('href', '/#features');
    expect(pricing).toHaveAttribute('href', '/#pricing');
    expect(contact).toHaveAttribute('href', '/#contact');
  });

  it('shows Sign Up / Login when user is not authenticated (desktop) and navigates on click', () => {
    render(<Header user={null} />);

    const loginBtn = screen.getByRole('button', { name: /sign up \/ login/i });
    fireEvent.click(loginBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows My Account when user is authenticated (desktop) and navigates on click', () => {
    render(<Header user={{ id: 'user-1' }} />);

    const accountBtn = screen.getByRole('button', { name: /my account/i });
    fireEvent.click(accountBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/account');
  });

  it('toggles mobile menu and navigates to account when user is authenticated (mobile)', () => {
    render(<Header user={{ id: 'user-2' }} />);

    // Mobile menu should be closed initially (container with # links absent)
    expect(document.querySelector('a[href="#pricing"]')).not.toBeInTheDocument();

    // Click the hamburger button (button without visible text)
    const toggleBtn = screen.getAllByRole('button').find(
      (b) => !(b.textContent || '').match(/my account|sign up\s*\/\s*login/i)
    );
    expect(toggleBtn).toBeTruthy();
    fireEvent.click(toggleBtn!);

    // Now mobile links should be present
    expect(document.querySelector('a[href="#features"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="#pricing"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="#contact"]')).toBeInTheDocument();

    // Scope queries to the mobile container to avoid duplicates with desktop nav
    const mobileContainer = document.querySelector('.md\\:hidden.bg-black') as HTMLElement;
    expect(mobileContainer).toBeInTheDocument();

    // Mobile My Account button should be present and navigate
    const mobileAccountBtn = within(mobileContainer).getByRole('button', { name: /my account/i });
    fireEvent.click(mobileAccountBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/account');
    // Menu should close after click
    expect(document.querySelector('a[href="#pricing"]')).not.toBeInTheDocument();
  });

  it('toggles mobile menu and navigates to login when user is not authenticated (mobile)', () => {
    render(<Header user={null} />);

    // Open mobile menu
    const toggleBtn = screen.getAllByRole('button').find(
      (b) => !(b.textContent || '').match(/my account|sign up\s*\/\s*login/i)
    );
    expect(toggleBtn).toBeTruthy();
    fireEvent.click(toggleBtn!);

    // Ensure mobile links appear
    expect(document.querySelector('a[href="#features"]')).toBeInTheDocument();

    // Scope to mobile container and click Sign Up/Login in mobile
    const mobileContainer = document.querySelector('.md\\:hidden.bg-black') as HTMLElement;
    expect(mobileContainer).toBeInTheDocument();
    const mobileLoginBtn = within(mobileContainer).getByRole('button', { name: /sign up \/ login/i });
    fireEvent.click(mobileLoginBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    // Menu should close after click
    expect(document.querySelector('a[href="#features"]')).not.toBeInTheDocument();
  });
});
