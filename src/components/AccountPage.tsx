import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, UserIcon, LogOutIcon, BellIcon, InfoIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
interface AccountPageProps {
  userDetails: {
    name: string;
    email: string;
  };
  setUser: (user: any) => void;
}


export const AccountPage: React.FC<AccountPageProps> = ({
  userDetails,
  setUser
}) => {
  const [subscribed, setSubscribed] = React.useState<boolean>(false);
  const [plan, setPlan] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = React.useState<string | null>(null);
  const [noProfile, setNoProfile] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'account' | 'subscription'>('account');

  React.useEffect(() => {
    async function fetchSubscriptionStatus(userId: string): Promise<{ subscribed: boolean; plan?: string | null; status?: string | null; nextBillingDate?: string | null; noProfile?: boolean }> {
      console.log('[fetchSubscriptionStatus] Called with userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_plan, next_billing_date')
        .eq('id', userId)
        .single();
      console.log('[fetchSubscriptionStatus] Supabase response:', { data, error });
      if (error || !data) {
        console.log('[fetchSubscriptionStatus] No profile found or error. Returning noProfile: true');
        return { subscribed: false, noProfile: true };
      }
      const result = {
        subscribed: data.subscription_status === 'active',
        plan: data.subscription_plan,
        status: data.subscription_status,
        nextBillingDate: data.next_billing_date,
        noProfile: false
      };
      console.log('[fetchSubscriptionStatus] Returning:', result);
      return result;
    }

    const fetchAndSetSubscription = async () => {
      console.log('[fetchAndSetSubscription] Running');
      setLoading(true);
      setError(null);
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        const user = data?.user;
        const userId = user?.id;
        console.log('[fetchAndSetSubscription] user:', user);
        if (!userId) {
          setError('No user ID found.');
          setLoading(false);
          return;
        }
        const subInfo = await fetchSubscriptionStatus(userId);
        setSubscribed(subInfo.subscribed);
        setPlan(subInfo.plan ?? null);
        setStatus(subInfo.status ?? null);
        setNextBillingDate(subInfo.nextBillingDate ?? null);
        setNoProfile(!!subInfo.noProfile);
        console.log('[fetchAndSetSubscription] State updated:', {
          subscribed: subInfo.subscribed,
          plan: subInfo.plan ?? null,
          status: subInfo.status ?? null,
          nextBillingDate: subInfo.nextBillingDate ?? null,
          noProfile: !!subInfo.noProfile
        });
      } catch (err: any) {
        setSubscribed(false);
        setPlan(null);
        setStatus(null);
        setNextBillingDate(null);
        setError('Unexpected error fetching subscription info.');
      }
      setLoading(false);
    };
    fetchAndSetSubscription();
  }, []);

  // Get plan name based on selected plan
  const getPlanName = () => {
    if (plan === 'preorder') {
      return 'Standard Plan (Preorder Special)';
    }
    switch (plan) {
      case 'basic':
        return 'Standard Plan';
      case 'pro':
        return 'Pro Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      default:
        return !subscribed ? 'Never Subscribed' : 'No subscription';
    }
  };
  const getPlanPrice = () => {
    if (plan === 'preorder') {
      return '$14.99/3 months';
    }
    switch (plan) {
      case 'basic':
        return '$7.99/month';
      case 'pro':
        return '$29.99/month';
      case 'enterprise':
        return '$99.99/month';
      default:
        return !subscribed ? '$0' : '$0';
    }
  };
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Active</span>;
      case 'trial':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">Trial</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">Inactive</span>;
      default:
        return !subscribed ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Never Subscribed</span> : <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">No subscription</span>;
    }
  };
  return <div className="w-full bg-black">
      {/* Header */}
      <div className="border-b border-white/10 py-4 px-4 sm:px-6 flex justify-between items-center">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setUser(null);
            navigate('/login');
          }}
          className="flex items-center text-white/70 hover:text-white transition-colors"
        >
          <LogOutIcon size={18} className="mr-2" />
          <span>Log out</span>
        </button>
      </div>
      {/* User info */}
      <div className="py-6 px-4 sm:px-6">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {userDetails.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-white">{userDetails.name}</h1>
            <p className="text-white/70">{userDetails.email}</p>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-black border-b border-white/10">
        <div className="flex px-4 sm:px-6">
          <button className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'account' ? 'border-purple-500 text-white' : 'border-transparent text-white/60 hover:text-white/80'}`} onClick={() => setActiveTab('account')}>
            <div className="flex items-center">
              <UserIcon size={16} className="mr-2" />
              Account Details
            </div>
          </button>
          <button className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'subscription' ? 'border-purple-500 text-white' : 'border-transparent text-white/60 hover:text-white/80'}`} onClick={() => setActiveTab('subscription')}>
            <div className="flex items-center">
              <CreditCardIcon size={16} className="mr-2" />
              Subscription
            </div>
          </button>
        </div>
      </div>
      {/* Tab content */}
      <div className="py-6 px-4 sm:px-6">
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-white/10">
                <h3 className="text-lg font-medium text-white">
                  Account Information
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  Manage your personal details
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80">
                    Full Name
                  </label>
                  <input type="text" name="name" id="name" defaultValue={userDetails.name} className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 py-2 px-3 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80">
                    Email Address
                  </label>
                  <input type="email" name="email" id="email" defaultValue={userDetails.email} className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 py-2 px-3 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/80">
                    Password
                  </label>
                  <input type="password" name="password" id="password" defaultValue="••••••••" className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 py-2 px-3 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
                <div className="flex justify-end">
                  <button type="button" className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-white/10">
                <h3 className="text-lg font-medium text-white">
                  Notification Preferences
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  Manage how we contact you
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="email_updates" name="email_updates" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="email_updates" className="text-sm font-medium text-white">
                        Email Updates
                      </label>
                      <p className="text-sm text-white/60">
                        Receive product updates and news
                      </p>
                    </div>
                  </div>
                  <BellIcon size={18} className="text-white/60" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="billing_alerts" name="billing_alerts" type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="billing_alerts" className="text-sm font-medium text-white">
                        Billing Alerts
                      </label>
                      <p className="text-sm text-white/60">
                        Receive billing and payment notifications
                      </p>
                    </div>
                  </div>
                  <BellIcon size={18} className="text-white/60" />
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-white text-center py-10">Loading subscription info...</div>
            ) : error ? (
              <div className="text-red-400 text-center py-10">{error}</div>
            ) : (
              <>
                <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Current Plan</h3>
                        <p className="mt-1 text-sm text-white/70">
                          {!subscribed ? 'You have never subscribed.' : 'Manage your subscription'}
                        </p>
                      </div>
                      {getStatusBadge()}
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="mb-6">
                      <h4 className="text-xl font-bold text-white">{getPlanName()}</h4>
                      <p className="text-white/70">{getPlanPrice()}</p>
                    </div>
                    {(noProfile || !subscribed || status !== 'active') ? (
                      <div className="mb-6 flex justify-center">
                        <a
                          href="/subscribe"
                          className="px-6 py-2 rounded-lg font-semibold transition-colors shadow-md bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Subscribe
                        </a>
                      </div>
                    ) : (
                      <div className="mb-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => navigate('/manageSubscription')}
                          className="px-6 py-2 rounded-lg font-semibold transition-colors shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Manage Subscription
                        </button>
                      </div>
                    )}
                    {(status === 'active' || status === 'trial') && (
                      <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/20">
                        <div className="flex items-start">
                          <InfoIcon size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="ml-3">
                            <h5 className="text-white font-medium mb-1">Billing Information</h5>
                            <p className="text-white/80 text-sm">
                              {plan === 'preorder' ? (
                                <>
                                  Your special preorder price of{' '}
                                  <span className="font-medium text-white">$14.99</span>{' '}
                                  covers your first 3 months. After this period, your
                                  subscription will automatically convert to the regular
                                  price of
                                  <span className="font-medium text-white"> $7.99/month</span>, billed monthly.
                                </>
                              ) : (
                                <>You are currently subscribed to the <span className="font-medium text-white">{getPlanName()}</span> at <span className="font-medium text-white">{getPlanPrice()}</span>.{' '}
                                  {nextBillingDate && (
                                    <>Next billing date: <span className="font-medium text-white">{new Date(nextBillingDate).toLocaleDateString()}</span>.</>
                                  )}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="bg-white/5 rounded-lg p-4 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/70">Next billing date</span>
                        <span className="text-white font-medium">
                          {nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/70">Plan</span>
                        <span className="text-white font-medium">{getPlanName()}</span>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
                      <button className="text-white/70 hover:text-white text-sm flex items-center">
                        <CreditCardIcon size={16} className="mr-2" />
                        Update payment method
                      </button>
                      <button className="text-red-400 hover:text-red-300 text-sm">Cancel subscription</button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-white/10">
                    <h3 className="text-lg font-medium text-white">Billing History</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/10">
                        <thead>
                          <tr>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white/70">Date</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white/70">Amount</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white/70">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-white/70">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          <tr>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">Apr 12, 2023</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">{getPlanPrice()}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Paid</span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                              <a href="#" className="text-purple-400 hover:text-purple-300">Download</a>
                            </td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">Mar 12, 2023</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">{getPlanPrice()}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Paid</span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                              <a href="#" className="text-purple-400 hover:text-purple-300">Download</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>;
};
export default AccountPage;