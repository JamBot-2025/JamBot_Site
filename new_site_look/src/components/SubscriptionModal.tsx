import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { SubscriptionPlans } from './SubscriptionPlans';
import { PaymentForm } from './PaymentForm';
import { SuccessScreen } from './SuccessScreen';
type ModalStep = 'auth' | 'plans' | 'payment' | 'success';
type AuthType = 'login' | 'signup';
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState<ModalStep>('auth');
  const [authType, setAuthType] = useState<AuthType>('signup');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const handleAuthSubmit = (data: any) => {
    setUserDetails({
      ...userDetails,
      ...data
    });
    setStep('plans');
  };
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('payment');
  };
  const handlePaymentSubmit = (details: any) => {
    setPaymentDetails(details);
    setStep('success');
  };
  const resetModal = () => {
    setStep('auth');
    setAuthType('signup');
    setSelectedPlan(null);
    setUserDetails({
      email: '',
      password: '',
      name: ''
    });
    setPaymentDetails(null);
    onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-md md:max-w-lg bg-black rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 inset-x-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 animate-gradient-flow blur-xl opacity-70"></div>
        </div>
        <button onClick={resetModal} className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
          <XIcon size={24} />
        </button>
        <div className="relative p-6 md:p-8">
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
          {step === 'plans' && <SubscriptionPlans onSelect={handlePlanSelect} />}
          {step === 'payment' && <PaymentForm onSubmit={handlePaymentSubmit} selectedPlan={selectedPlan} userEmail={userDetails.email} />}
          {step === 'success' && <SuccessScreen onClose={resetModal} subscriptionDetails={{
          plan: selectedPlan,
          email: userDetails.email,
          subscriptionId: paymentDetails?.subscription?.subscriptionId
        }} />}
        </div>
      </div>
    </div>;
};