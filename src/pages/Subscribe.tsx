import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


import { supabase } from '../supabaseClient';

async function fetchSubscriptionStatus(userId: string): Promise<{ subscribed: boolean; plan?: string | null; status?: string | null; nextBillingDate?: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_plan, next_billing_date')
    .eq('id', userId)
    .single();
  // Handle Supabase 406 (no row found) and treat as not subscribed
  if ((error && error.code === 'PGRST116') || !data) {
    return { subscribed: false };
  }
  if (error) {
    // Optionally log or handle other errors
    return { subscribed: false };
  }
  return {
    subscribed: data.subscription_status === 'active',
    plan: data.subscription_plan,
    status: data.subscription_status,
    nextBillingDate: data.next_billing_date
  };
}

const STRIPE_PRICE_ID = 'price_1RkWlkB4eW6h7F0TzqtG61CI'; // Replace with actual price id

interface SubscribePageProps {
  user: any;
  authChecked: boolean;
}

export const SubscribePage: React.FC<SubscribePageProps> = ({ user, authChecked }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authChecked && !user) {
      navigate('/login');
      return;
    }
    if (!user) return;
    fetchSubscriptionStatus(user.id)
      .then((res) => {
        setSubscribed(res.subscribed);
        setPlan(res.plan || null);
        setStatus(res.status || null);
        setNextBillingDate(res.nextBillingDate || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch subscription status.');
        setLoading(false);
      });
  }, [user, navigate]);

  const handleSubscribe = async () => {
    console.log('Subscription info:', { subscribed, plan, status, nextBillingDate });
    if (!user) {
      setError("You must be logged in to subscribe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Call your backend to create Stripe customer and checkout session
      const customerRes = await fetch('https://mcsqxmsvyckabbgefixy.functions.supabase.co/create-stripe-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          user_id: user.id,
        })
      });
      const customerData = await customerRes.json();
      if (!customerRes.ok || !customerData.customer_id) {
        setError(customerData.error || 'Failed to create Stripe customer.');
        setLoading(false);
        return;
      }
      const checkoutRes = await fetch('https://mcsqxmsvyckabbgefixy.functions.supabase.co/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerData.customer_id,
          price_id: STRIPE_PRICE_ID,
          success_url: window.location.origin + '/account',
          cancel_url: window.location.origin + '/subscribe',
        })
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        setError('Failed to create Stripe Checkout session.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during subscription.');
      setLoading(false);
    }
  };

  if (loading)  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      Loading...
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-lg p-6">{error}</div>
      </div>
    );
  }

  if (subscribed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-8 shadow-lg text-white text-center">
          <h2 className="text-2xl font-bold mb-4">You are already subscribed!</h2>
          <p className="mb-2">Thank you for supporting us 🎉</p>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-green-600/80 text-white text-xs font-semibold mr-2">{plan || 'Standard Plan'}</span>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-600/80 text-white text-xs font-semibold">{status || 'active'}</span>
          </div>
          {nextBillingDate && <p className="mb-2">Next Billing Date: {nextBillingDate}</p>}
          <button className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/10" onClick={() => navigate('/account')}>Go to Account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 shadow-lg text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Subscribe to a Plan</h2>
        <p className="mb-6 text-white/80">Unlock all features with a subscription!</p>
        <button
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg text-lg font-semibold hover:opacity-90 transition-colors"
          onClick={handleSubscribe}
          disabled={loading || !user}
        >
          Subscribe with Stripe
        </button>
        <button className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/10" onClick={() => navigate('/account')}>Go to Account</button>
      </div>
    </div>
  );
};
export default SubscribePage;
