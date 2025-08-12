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
      resetPasswordForEmail: vi.fn(),
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
    // Switch to the Subscription tab before checking subscription details
    const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
    fireEvent.click(subscriptionTab);
    // Wait for loading to finish and subscription info to appear
    await screen.findByText(/Current Plan/i);
    // Verify user name and email are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    // Verify plan name and price are shown
    expect(screen.getByRole('heading', { level: 4, name: 'Jambot' })).toBeInTheDocument();
    expect(screen.getAllByText('$7.99/month').length).toBeGreaterThan(0);
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
    // Open the Subscription tab
    const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
    fireEvent.click(subscriptionTab);
    // Wait for subscription section
    await screen.findByText(/Current Plan/i);
    // Text and subscribe button should be present
    expect(screen.getByText(/You have never subscribed/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('displays error message when profile fetch fails', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-3' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: { message: 'Profile fetch error' },
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    // Open the Subscription tab to reveal subscription content
    const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
    fireEvent.click(subscriptionTab);
    // Expect backend error message to be surfaced
    await screen.findByText(/Profile fetch error/i);
  });

  it('updates user name successfully', async () => {
    (supabase.auth.getUser as any)
      .mockResolvedValueOnce({ data: { user: { id: 'user-4' } } })
      .mockResolvedValueOnce({ data: { user: { id: 'user-4', user_metadata: { full_name: 'New Name' } } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { subscription_status: 'active' },
            error: null,
          }),
        }),
      }),
    });

    (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    
    // Find and update the name input
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    // Click the save button
    const saveButton = screen.getByRole('button', { name: /save name/i });
    fireEvent.click(saveButton);
    
    // Verify the update was called with the new name
    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: { full_name: 'New Name' }
      });
      // The app updates global user with the fresh Supabase User object
      // after refreshing the session, so validate user_metadata.full_name.
      expect(setUser).toHaveBeenCalledWith(
        expect.objectContaining({
          user_metadata: expect.objectContaining({ full_name: 'New Name' })
        })
      );
    });
    
    // Check for success message
    expect(await screen.findByText('Name updated successfully')).toBeInTheDocument();
  });

  it('shows error when name update fails', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-5' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { subscription_status: 'active' },
            error: null,
          }),
        }),
      }),
    });

    const errorMessage = 'Failed to update name';
    (supabase.auth.updateUser as any).mockResolvedValue({ 
      error: { message: errorMessage } 
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    
    // Update name and submit
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: /save name/i }));
    
    // Check for error message
    expect(await screen.findByText(`Error updating name: ${errorMessage}`)).toBeInTheDocument();
  });

  it('displays correct status badges for different subscription states', async () => {
    const testCases = [
      { status: 'active', expectedText: 'Active', expectedClass: 'bg-green-500/20' },
      { status: 'inactive', expectedText: 'Inactive', expectedClass: 'bg-red-500/20' },
      { status: 'canceled', expectedText: 'Canceled', expectedClass: 'bg-yellow-500/20' },
      { status: 'expired', expectedText: 'Expired', expectedClass: 'bg-orange-500/20' },
      { status: 'past_due', expectedText: 'Past Due', expectedClass: 'bg-red-500/20' },
      { status: 'unknown', expectedText: 'Not Subscribed', expectedClass: 'bg-gray-500/20' },
    ];

    for (const { status, expectedText, expectedClass } of testCases) {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: `user-${status}` } } });
      (supabase.from as any).mockReturnValue({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                subscription_status: status,
                subscription_plan: 'basic',
                next_billing_date: '2025-09-01',
              },
              error: null,
            }),
          }),
        }),
      });

      const { unmount } = render(<AccountPage userDetails={userDetails} setUser={setUser} />);
      // Switch to Subscription tab so badge is rendered
      const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
      fireEvent.click(subscriptionTab);
      // Wait for the status badge to appear
      const badge = await screen.findByText(expectedText);
      expect(badge).toBeInTheDocument();
      
      // Check the badge has the correct styling
      const badgeElement = badge.closest('span');
      expect(badgeElement).toHaveClass(expectedClass);
      
      // Clean up for next test case
      unmount();
    }
  });

  it('disables save button when no changes are made', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-6' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { subscription_status: 'active' },
            error: null,
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    
    // Save button should be disabled initially (no changes)
    const saveButton = screen.getByRole('button', { name: /save name/i });
    expect(saveButton).toBeDisabled();
    
    // Make a change to enable the button
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(saveButton).not.toBeDisabled();
    
    // Revert the change to disable it again
    fireEvent.change(nameInput, { target: { value: userDetails.name } });
    expect(saveButton).toBeDisabled();
  });

  it('switches between account and subscription tabs', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-tab-test' } } });
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
    
    // Initially on account tab
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.queryByText('Current Plan')).not.toBeInTheDocument();
    
    // Click subscription tab
    const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
    fireEvent.click(subscriptionTab);
    
    // Should show subscription content
    expect(await screen.findByText('Current Plan')).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    
    // Click account tab
    const accountTab = screen.getByRole('tab', { name: /account/i });
    fireEvent.click(accountTab);
    
    // Should show account content again
    expect(await screen.findByLabelText('Name')).toBeInTheDocument();
    expect(screen.queryByText('Current Plan')).not.toBeInTheDocument();
  });

  it('handles sign out functionality', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-4' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              subscription_status: 'active',
              subscription_plan: 'basic',
              next_billing_date: '2025-12-31'
            },
            error: null
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    
    // Wait for the component to finish loading
    await waitFor(() => {
      // Find and click the sign out button
      const signOutButton = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(signOutButton);
      
      // Verify the sign out was called and user was updated
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(setUser).toHaveBeenCalledWith(null);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays the account form with user details', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-4' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({ 
            data: { 
              subscription_status: 'active',
              subscription_plan: 'basic',
              next_billing_date: '2025-12-31'
            }, 
            error: null 
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    
    // Wait for the form to load (Account tab is default)
    const nameInput = await screen.findByLabelText('Name');
    // Check user details are displayed
    expect(nameInput).toHaveValue(userDetails.name);
    // Email is shown as text in header, not an input
    expect(screen.getByText(userDetails.email)).toBeInTheDocument();
    // Check the save button is present in Account tab
    expect(screen.getByRole('button', { name: /save name/i })).toBeInTheDocument();

    // Switch to Subscription tab to check subscription info
    const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
    fireEvent.click(subscriptionTab);
    await screen.findByText(/Current Plan/i);
    expect(screen.getByRole('heading', { level: 4, name: 'Jambot' })).toBeInTheDocument();
    expect(screen.getAllByText('$7.99/month').length).toBeGreaterThan(0);
    
  });

  it('handles tab switching between account and subscription', async () => {
    // Mock the initial data fetch
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-5' } } });
    
    // Mock the subscription data
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { 
              subscription_status: 'active',
              subscription_plan: 'basic',
              next_billing_date: '2025-12-31'
            },
            error: null
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);

    // Wait for initial render on Account tab
    await screen.findByText(/Account Information/i);
    
    // Find the subscription tab and click it
    const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
    fireEvent.click(subscriptionTab);
    
    // Verify the subscription tab content is shown
    await screen.findByText(/Current Plan/i);
    
    // Find and click the account tab
    const accountTab = screen.getByRole('tab', { name: /account/i });
    fireEvent.click(accountTab);
    
    // Verify the account tab content is shown
    await screen.findByText(/Account Information/i);
  });

  it('handles API errors gracefully', async () => {
    // Mock an error when getting user data
    (supabase.auth.getUser as any).mockRejectedValueOnce(new Error('API Error'));
    
    // Mock the console.error to prevent test logs from being cluttered
    const consoleError = console.error;
    console.error = vi.fn();
    
    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    
    // Open Subscription tab where the error message is rendered
    const subscriptionTab = screen.getByRole('tab', { name: /subscription/i });
    fireEvent.click(subscriptionTab);
    
    // The component should handle the error gracefully
    await screen.findByText(/Error loading subscription information\./i);
    
    // Restore console.error
    console.error = consoleError;
  });

  it('enables save button when name is changed', async () => {
    // Mock the initial data
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-6' } } });
    (supabase.from as any).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { 
              subscription_status: 'active',
              subscription_plan: 'basic',
              next_billing_date: '2025-12-31'
            },
            error: null
          }),
        }),
      }),
    });

    render(<AccountPage userDetails={userDetails} setUser={setUser} />);
    
    // Wait for the form to load
    const nameInput = await screen.findByLabelText('Name');
    const saveButton = screen.getByRole('button', { name: /save name/i });
    
    // Initially, the save button should be disabled if the name hasn't changed
    expect(saveButton).toBeDisabled();
    
    // Change the name
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    // The save button should now be enabled
    expect(saveButton).not.toBeDisabled();
    
    // Change it back to the original name
    fireEvent.change(nameInput, { target: { value: userDetails.name } });
    
    // The save button should be disabled again
    expect(saveButton).toBeDisabled();
  });
});
