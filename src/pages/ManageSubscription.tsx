import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
// FUNCTIONALITY: Manage billing by creating a Stripe Customer Portal session for the signed-in user.

const ManageSubscription: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not logged in');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();
      if (profileError || !profile?.stripe_customer_id) throw new Error('No Stripe customer ID found.');
      const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
        body: { customerId: profile.stripe_customer_id }
      });
      if (error) {
        setError(error.message || 'Failed to create Stripe Customer Portal session.');
        setLoading(false);
        return;
      }
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        setError('No portal URL returned.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="bg-white/10 rounded-lg p-8 shadow-lg border border-white/10 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Manage Subscription</h1>
        <p className="text-white/80 mb-6">
          Here you will be able to view, update, or cancel your subscription, change your plan, and see your billing history.
        </p>
        <button
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
          onClick={handleManageBilling}
          disabled={loading}
        >
          {loading ? 'Redirecting...' : 'Manage Billing in Stripe Portal'}
        </button>
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default ManageSubscription;
