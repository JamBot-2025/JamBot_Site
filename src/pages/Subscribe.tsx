import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { Spinner } from '../components/Spinner';

// You may want to refactor this to a real API call
async function fetchSubscriptionStatus(userId: string): Promise<{ subscribed: boolean }> {
  // TODO: Replace this mock with a real API call to your backend or Supabase
  return { subscribed: false };
}

const STRIPE_PRICE_ID = 'price_1RkWlkB4eW6h7F0TzqtG61CI'; // Replace with actual price id

export const SubscribePage: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscriptionStatus(user.id)
      .then((res) => {
        setSubscribed(res.subscribed);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch subscription status.');
        setLoading(false);
      });
  }, [user, navigate]);

  const handleSubscribe = async () => {
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

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (subscribed) return (
    <div className="max-w-lg mx-auto mt-16 bg-black border border-white/10 rounded-xl shadow-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">You're already subscribed!</h2>
      <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg" onClick={() => navigate('/account')}>Go to Account</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto mt-16 bg-black border border-white/10 rounded-xl shadow-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Subscribe to a Plan</h2>
      <p className="mb-6 text-white/80">Unlock all features with a subscription!</p>
      <button
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg text-lg font-semibold hover:opacity-90 transition-colors"
        onClick={handleSubscribe}
        disabled={loading}
      >
        Subscribe with Stripe
      </button>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default SubscribePage;
