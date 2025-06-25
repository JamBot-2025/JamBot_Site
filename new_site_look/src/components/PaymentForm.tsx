import React, { useState } from 'react';
import { LockIcon, ArrowLeftIcon } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createSubscription } from '../utils/stripe';
interface PaymentFormProps {
  onSubmit: (paymentDetails: any) => void;
  selectedPlan: string | null;
  userEmail: string;
}
export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  selectedPlan,
  userEmail
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  // Get plan information
  const getPlanInfo = () => {
    switch (selectedPlan) {
      case 'basic':
        return {
          name: 'Basic Plan',
          price: '$7.99/month'
        };
      case 'pro':
        return {
          name: 'Pro Plan',
          price: '$29.99/month'
        };
      case 'enterprise':
        return {
          name: 'Enterprise Plan',
          price: '$99.99/month'
        };
      default:
        return {
          name: 'Selected Plan',
          price: 'Custom pricing'
        };
    }
  };
  const planInfo = getPlanInfo();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    if (!cardComplete) {
      setErrorMessage('Please complete your card details');
      return;
    }
    if (!cardName) {
      setErrorMessage('Please enter the cardholder name');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      // Create payment method
      const {
        error,
        paymentMethod
      } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardName,
          email: userEmail
        }
      });
      if (error) {
        throw new Error(error.message);
      }
      if (!paymentMethod) {
        throw new Error('Payment method creation failed');
      }
      // Create subscription (mock)
      const subscription = await createSubscription(userEmail, paymentMethod.id);
      // Pass the result to parent component
      onSubmit({
        paymentMethodId: paymentMethod.id,
        subscription: subscription
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };
  const cardElementOptions = {
    style: {
      base: {
        color: '#fff',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };
  return <div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Payment Information
      </h2>
      <p className="text-white/70 mb-6">
        Enter your payment details to complete your subscription
      </p>
      <div className="bg-gradient-to-br from-purple-900/30 to-black/30 border border-white/10 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-medium">{planInfo.name}</h3>
            <p className="text-white/70 text-sm">Billed monthly</p>
          </div>
          <div className="text-white font-bold">{planInfo.price}</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Cardholder name" disabled={isProcessing} required />
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <CardElement options={cardElementOptions} onChange={e => setCardComplete(e.complete)} disabled={isProcessing} />
        </div>
        {errorMessage && <div className="text-red-400 text-sm">{errorMessage}</div>}
        <div className="pt-4">
          <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50" disabled={isProcessing || !stripe || !elements}>
            {isProcessing ? 'Processing...' : 'Complete Subscription'}
          </button>
        </div>
        <div className="flex items-center justify-center pt-2">
          <LockIcon size={14} className="text-green-400 mr-2" />
          <span className="text-white/60 text-sm">
            Secure payment processing by Stripe
          </span>
        </div>
      </form>
    </div>;
};