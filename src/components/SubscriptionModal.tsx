import React, { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
// import { PaymentForm } from './PaymentForm'; // No longer used for subscriptions
import { SuccessScreen } from './SuccessScreen';
import { AccountPage } from './AccountPage';
type ModalStep = 'auth' | 'payment' | 'success' | 'account';
type AuthType = 'login' | 'signup';
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
  showAccountPage?: boolean;
}
export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  showAccountPage = false
}) => {
  const [step, setStep] = useState<ModalStep>('auth');
  const [authType, setAuthType] = useState<AuthType>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set initial step based on props and user
  useEffect(() => {
    if (showAccountPage && user) {
      setStep('account');
    } else if (user) {
      setStep('account');
    } else {
      setStep('auth');
    }
  }, [showAccountPage, user]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Stripe price ID for your subscription plan (update as needed)
  const STRIPE_PRICE_ID = 'price_1RkWlkB4eW6h7F0TzqtG61CI';

  // After login/signup success, trigger Stripe Checkout
  const handleLoginSuccess = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Ensure user is available
      if (!user) {
        setError('No user found.');
        setLoading(false);
        return;
      }
      // 2. Create or fetch Stripe customer
      const customerRes = await fetch(
        'https://mcsqxmsvyckabbgefixy.functions.supabase.co/create-stripe-customer',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            user_id: user.id
          })
        }
      );
      const customerData = await customerRes.json();
      if (!customerRes.ok || !customerData.customer_id) {
        setError(customerData.error || 'Failed to create Stripe customer.');
        setLoading(false);
        return;
      }
      // 3. Create Stripe Checkout session
      const checkoutRes = await fetch(
        'https://mcsqxmsvyckabbgefixy.functions.supabase.co/create-checkout-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customerData.customer_id,
            price_id: STRIPE_PRICE_ID,
            success_url: window.location.origin + '/success',
            cancel_url: window.location.origin + '/cancel',
          })
        }
      );
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        setError('Failed to create Stripe Checkout session.');
      }
    } catch (err) {
      setError('An error occurred during subscription.');
    }
    setLoading(false);
  };

  const handleSignupSuccess = handleLoginSuccess;

  const resetModal = () => {
    setStep('auth');
    setAuthType('signup');
    onClose();
  };

  const handleBackFromAccount = () => {
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
      <div className="relative w-full max-w-md md:max-w-lg bg-black rounded-xl border border-white/10 shadow-2xl my-8">
        <div className="absolute top-0 inset-x-0">
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
              <span className="text-white text-lg">Redirecting to payment...</span>
            </div>
          )}
          {error && (
            <div className="absolute top-2 left-2 right-2 bg-red-700 text-white text-center rounded p-2 z-50">
              {error}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 animate-gradient-flow blur-xl opacity-70"></div>
        </div>
        <button onClick={resetModal} className="absolute top-4 right-4 text-white/70 hover:text-white z-10" aria-label="Close modal">
          <XIcon size={24} />
        </button>
        <div className="relative max-h-[80vh] overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {step === 'auth' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{authType === 'signup' ? 'Sign Up' : 'Log In'}</h2>
                <button onClick={resetModal} className="text-white hover:text-gray-300">
                  <XIcon size={20} />
                </button>
              </div>
              {authType === 'signup' ? (
                <SignupForm onLoginSuccess={handleSignupSuccess} />
              ) : (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              )}
              <div className="mt-4 text-center">
                <button
                  className="text-purple-400 hover:underline"
                  onClick={() => setAuthType(authType === 'signup' ? 'login' : 'signup')}
                >
                  {authType === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
          )}
          {step === 'account' && user && (
            <AccountPage 
              userDetails={{
                name: user?.user_metadata?.name || user?.user_metadata?.full_name || 'User',
                email: user?.email || 'user@example.com'
              }}
              subscriptionDetails={{
                plan: 'preorder',
                status: 'active',
                nextBillingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()
              }}
              onBack={handleBackFromAccount}
              onLogout={onLogout}
            />
          )}
          {step === 'payment' && user && (
            <div className="p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-white mb-4">Subscribe to JamBot</h2>
              <div className="mb-6 text-center">
                <div className="text-xl text-white font-bold mb-2">Standard Plan</div>
                <div className="text-lg text-white/80 mb-2">$14.99 / 3 months</div>
                <ul className="text-white/60 text-left mb-4 list-disc list-inside">
                  <li>5 projects</li>
                  <li>10GB storage</li>
                  <li>Basic analytics</li>
                  <li>Email support</li>
                  <li>Access to all core features</li>
                  <li>Regular updates</li>
                </ul>
              </div>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-lg font-semibold"
                onClick={handleLoginSuccess}
                disabled={loading}
              >
                Subscribe with Stripe
              </button>
            </div>
          )}
          {step === 'success' && user && (
            <SuccessScreen 
              onClose={resetModal}
              userDetails={{
                name: user?.user_metadata?.name || user?.user_metadata?.full_name || 'User',
                email: user?.email || 'user@example.com'
              }}
              subscriptionDetails={{
                email: user?.email || 'user@example.com',
                subscriptionId: undefined
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};