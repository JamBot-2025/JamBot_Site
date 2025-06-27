import React, { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PaymentForm } from './PaymentForm';
import { SuccessScreen } from './SuccessScreen';
import { AccountPage } from './AccountPage';
type ModalStep = 'auth' | 'payment' | 'success' | 'account';
type AuthType = 'login' | 'signup';
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  setIsLoggedIn?: (value: boolean) => void;
  userDetails?: {
    name: string;
    email: string;
  } | null;
  setUserDetails?: (details: {
    name: string;
    email: string;
  } | null) => void;
  showAccountPage?: boolean;
}
export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn = false,
  setIsLoggedIn = () => {},
  userDetails: initialUserDetails = null,
  setUserDetails = () => {},
  showAccountPage = false
}) => {
  const [step, setStep] = useState<ModalStep>('auth');
  const [authType, setAuthType] = useState<AuthType>('signup');
  const [userDetails, setUserDetailsLocal] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  // Set initial step based on props
  useEffect(() => {
    if (showAccountPage && isLoggedIn) {
      setStep('account');
    }
  }, [showAccountPage, isLoggedIn]);
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
  const handleAuthSubmit = (data: any) => {
    const updatedUserDetails = {
      ...userDetails,
      ...data
    };
    setUserDetailsLocal(updatedUserDetails);
    // If it's a login, we can consider the user logged in right away
    if (authType === 'login') {
      setIsLoggedIn(true);
      setUserDetails({
        name: updatedUserDetails.name,
        email: updatedUserDetails.email
      });
      setStep('account');
    } else {
      // For signup, proceed to payment
      setStep('payment');
    }
  };
  const handlePaymentSubmit = (details: any) => {
    setPaymentDetails(details);
    setIsLoggedIn(true);
    setUserDetails({
      name: userDetails.name,
      email: userDetails.email
    });
    setStep('success');
  };
  const resetModal = () => {
    setStep('auth');
    setAuthType('signup');
    setUserDetailsLocal({
      email: '',
      password: '',
      name: ''
    });
    setPaymentDetails(null);
    onClose();
  };
  const handleBackFromAccount = () => {
    // If they were already logged in and just viewing account, close modal
    if (isLoggedIn) {
      onClose();
    } else {
      // Otherwise go back to auth
      setStep('auth');
    }
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserDetails(null);
    resetModal();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
      <div className="relative w-full max-w-md md:max-w-lg bg-black rounded-xl border border-white/10 shadow-2xl my-8">
        <div className="absolute top-0 inset-x-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 animate-gradient-flow blur-xl opacity-70"></div>
        </div>
        <button onClick={resetModal} className="absolute top-4 right-4 text-white/70 hover:text-white z-10" aria-label="Close modal">
          <XIcon size={24} />
        </button>
        <div className="relative max-h-[80vh] overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {step === 'auth' && <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                {authType === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>
              <div className="flex mb-6">
                <button className={`flex-1 py-2 text-center transition-colors ${authType === 'signup' ? 'text-white border-b-2 border-purple-500' : 'text-white/50 hover:text-white/80 border-b-2 border-white/10'}`} onClick={() => setAuthType('signup')}>
                  Sign Up
                </button>
                <button className={`flex-1 py-2 text-center transition-colors ${authType === 'login' ? 'text-white border-b-2 border-purple-500' : 'text-white/50 hover:text-white/80 border-b-2 border-white/10'}`} onClick={() => setAuthType('login')}>
                  Login
                </button>
              </div>
              {authType === 'signup' ? <SignupForm onSubmit={handleAuthSubmit} /> : <LoginForm onSubmit={handleAuthSubmit} />}
            </div>}
          {step === 'payment' && <PaymentForm onSubmit={handlePaymentSubmit} userEmail={userDetails.email} />}
          {step === 'success' && <SuccessScreen onClose={resetModal} userDetails={userDetails} subscriptionDetails={{
          email: userDetails.email,
          subscriptionId: paymentDetails?.subscription?.subscriptionId
        }} />}
          {step === 'account' && <AccountPage userDetails={{
          name: userDetails.name || initialUserDetails?.name || 'User',
          email: userDetails.email || initialUserDetails?.email || 'user@example.com'
        }} subscriptionDetails={{
          plan: 'preorder',
          subscriptionId: paymentDetails?.subscription?.subscriptionId,
          status: 'active',
          nextBillingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }} onBack={handleBackFromAccount} onLogout={handleLogout} />}
        </div>
      </div>
    </div>;
};