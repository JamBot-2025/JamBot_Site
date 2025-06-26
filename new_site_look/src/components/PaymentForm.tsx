import React, { useState } from 'react';
import { LockIcon, ArrowLeftIcon, CreditCardIcon, CalendarIcon, KeyIcon, TagIcon, ZapIcon, CheckIcon } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createSubscription } from '../utils/stripe';
interface PaymentFormProps {
  onSubmit: (paymentDetails: any) => void;
  userEmail: string;
}
export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  userEmail
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // For development, we'll use our own form fields instead of Stripe Elements
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const preorderFeatures = ['5 projects', '10GB storage', 'Basic analytics', 'Email support', 'Access to all core features', 'Regular updates'];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for development
    if (!cardName) {
      setErrorMessage('Please enter the cardholder name');
      return;
    }
    if (cardNumber.length < 16) {
      setErrorMessage('Please enter a valid card number');
      return;
    }
    if (expiry.length < 5) {
      setErrorMessage('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cvc.length < 3) {
      setErrorMessage('Please enter a valid CVC');
      return;
    }
    if (zip.length < 5) {
      setErrorMessage('Please enter a valid postal code');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // For development, we'll create a mock payment method
      const mockPaymentMethodId = 'pm_' + Math.random().toString(36).substring(2, 15);
      // Create subscription (mock)
      const subscription = await createSubscription(userEmail, mockPaymentMethodId);
      // Pass the result to parent component
      onSubmit({
        paymentMethodId: mockPaymentMethodId,
        subscription: subscription,
        card: {
          last4: cardNumber.slice(-4),
          brand: 'visa',
          exp_month: parseInt(expiry.split('/')[0]),
          exp_year: parseInt('20' + expiry.split('/')[1])
        }
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };
  // Helper for formatting card expiry
  const formatExpiry = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 2) return cleanValue;
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
  };
  return <div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Complete Your Preorder
      </h2>
      <p className="text-white/70 mb-6">
        Enter your payment details to secure your preorder special offer
      </p>
      <div className="bg-gradient-to-br from-purple-900/30 to-black/30 border border-purple-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="w-12 h-12 mb-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <ZapIcon size={24} className="text-white" />
          </div>
          <div className="ml-4">
            <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold py-1 px-2 rounded-full mb-2">
              <div className="flex items-center">
                <TagIcon size={12} className="mr-1" />
                PREORDER SPECIAL
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <h3 className="text-lg font-semibold text-white">
                Standard Plan
              </h3>
            </div>
            <div className="flex items-baseline mt-1">
              <span className="text-xl font-bold text-white">$14.99</span>
              <span className="text-white/60 ml-1">/ 3 months</span>
              <span className="text-sm line-through text-white/50 ml-2">
                $23.97
              </span>
              <span className="text-sm font-medium text-green-400 ml-2">
                Save 37%
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {preorderFeatures.map((feature, idx) => <li key={idx} className="flex items-start">
                  <CheckIcon size={16} className="text-green-400 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </li>)}
            </ul>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-white/80 mb-1">
            Cardholder Name
          </label>
          <input id="cardName" type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Name on card" disabled={isProcessing} required />
        </div>
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-white/80 mb-1">
            Card Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
              <CreditCardIcon size={18} />
            </div>
            <input id="cardNumber" type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="1234 5678 9012 3456" disabled={isProcessing} required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label htmlFor="expiry" className="block text-sm font-medium text-white/80 mb-1">
              Expiry
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <CalendarIcon size={18} />
              </div>
              <input id="expiry" type="text" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="MM/YY" disabled={isProcessing} required />
            </div>
          </div>
          <div className="col-span-1">
            <label htmlFor="cvc" className="block text-sm font-medium text-white/80 mb-1">
              CVC
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <KeyIcon size={18} />
              </div>
              <input id="cvc" type="text" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="123" disabled={isProcessing} required />
            </div>
          </div>
          <div className="col-span-1">
            <label htmlFor="zip" className="block text-sm font-medium text-white/80 mb-1">
              Postal Code
            </label>
            <input id="zip" type="text" value={zip} onChange={e => setZip(e.target.value.replace(/[^\w\s-]/g, '').slice(0, 10))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="12345" disabled={isProcessing} required />
          </div>
        </div>
        {errorMessage && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            {errorMessage}
          </div>}
        <div className="pt-4">
          <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Complete Preorder - $14.99'}
          </button>
        </div>
        <div className="flex items-center justify-center pt-2">
          <LockIcon size={14} className="text-green-400 mr-2" />
          <span className="text-white/60 text-sm">
            Development Mode - No actual charges will be made
          </span>
        </div>
      </form>
    </div>;
};