import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, UserIcon, LogOutIcon, InfoIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
// FUNCTIONALITY: Account page to view/update profile details and manage subscription status/CTAs.

// Shows Account details + Subscription tab information,
// Account details lets the user update name, and trigger a password reset,
// Subscription tab shows the user's subscription status, and allows the user to either subscribe or manage their subscription.
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
  // Subscription view-model (derived from profiles table)
  const [subscribed, setSubscribed] = React.useState<boolean>(false);
  const [plan, setPlan] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = React.useState<string | null>(null);
  const [noProfile, setNoProfile] = React.useState<boolean>(false);

  // UI state
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'account' | 'subscription'>('account');

  // On mount: resolve current user, fetch subscription fields from profiles,
  // and map them into local state. Surfaces backend errors to the UI.
  React.useEffect(() => {
    // fetchSubscriptionStatus: fetches subscription status from profiles table
    async function fetchSubscriptionStatus(userId: string): Promise<{ 
      subscribed: boolean; 
      plan?: string | null; 
      status?: string | null; 
      nextBillingDate?: string | null; 
      noProfile?: boolean;
      error?: string | null;
    }> {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan, next_billing_date')
          .eq('id', userId)
          .single();

        if (error || !data) {
          console.error('Error fetching subscription status:', error);
          return { 
            subscribed: false, 
            noProfile: true,
            error: error?.message || 'Profile not found'
          };
        }

        return {
          subscribed: data.subscription_status === 'active',
          plan: data.subscription_plan,
          status: data.subscription_status,
          nextBillingDate: data.next_billing_date,
          noProfile: false
        };
      } catch (err) {
        console.error('Unexpected error in fetchSubscriptionStatus:', err);
        return { 
          subscribed: false, 
          noProfile: true, 
          error: 'Failed to fetch subscription status' 
        };
      }
    }

    //  User lookup + subscription fetch; centralized error handling.
    const fetchAndSetSubscription = async () => {
      setIsLoading(true);
      setError(null);
      // 1) Resolve current session user.
      // 2) Pull subscription fields from 'profiles'.
      // 3) Mirror backend error text onto UI.
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        const user = data?.user;
        const userId = user?.id;
        // Log user presence for debugging
        console.log('[AccountPage][fetchAndSetSubscription] user_present:', !!user);
        if (!userId) {
          setError('No user ID found.');
          setIsLoading(false);
          return;
        }
        
        const subInfo = await fetchSubscriptionStatus(userId);
        // Reflect backend error messages to UI if present
        if (subInfo.error) {
          setError(subInfo.error);
        } else {
          setError(null);
        }
        setSubscribed(subInfo.subscribed);
        setPlan(subInfo.plan ?? null);
        setStatus(subInfo.status ?? null);
        setNextBillingDate(subInfo.nextBillingDate ?? null);
        setNoProfile(!!subInfo.noProfile);
        console.log('[AccountPage][fetchAndSetSubscription] state_updated', {
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
        setError('Error loading subscription information.');
      }
      setIsLoading(false);
    };
    
    fetchAndSetSubscription();
  }, []);

  // Get plan name based on selected plan
  const getPlanName = () => {
    return subscribed ? 'Jambot' : 'No subscription';
  };

  // Get plan price based on selected plan
  const getPlanPrice = () => {
    return subscribed ? '$7.99/month' : '$0';
  };

  // Get status badge based on subscription status
  const getStatusBadge = () => {
    if (!status) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Not Subscribed</span>;
    }
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'active') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Active</span>;
    }
    if (statusLower === 'inactive') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">Inactive</span>;
    }
    if (statusLower === 'canceled') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">Canceled</span>;
    }
    if (statusLower === 'expired') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400">Expired</span>;
    }
    if (statusLower === 'past_due') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">Past Due</span>;
    }
    
    // Default case for unknown status
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
      Not Subscribed
    </span>;
  };

  // Account update state
  const [newName, setNewName] = React.useState(userDetails.name);
  const [accountMsg, setAccountMsg] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Updates profile name in Supabase.
  // TODO: add basic validation (min length, disallow all-whitespace).
  const handleNameChange = async () => {
    if (!newName || newName === userDetails.name) return;
    
    setIsUpdating(true);
    setAccountMsg('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName }
      });
      
      if (error) {
        throw error;
      }
      
      // Refresh the session and fetch a fresh user to avoid stale metadata flicker
      await supabase.auth.refreshSession();
      const { data: fresh } = await supabase.auth.getUser();
      const freshUser = fresh?.user;

      if (freshUser) {
        // Update global user state with the proper Supabase user shape
        setUser(freshUser);
      }

      setAccountMsg('Name updated successfully');
    } catch (err: any) {
      console.error('Error updating name:', err);
      setAccountMsg(`Error updating name: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  //Account page UI
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
        <div className="flex px-4 sm:px-6" role="tablist" aria-label="Account tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'account'}
            id="account-tab"
            aria-controls="account-panel"
            className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'account' ? 'border-purple-500 text-white' : 'border-transparent text-white/60 hover:text-white/80'}`}
            onClick={() => setActiveTab('account')}
          >
            <div className="flex items-center">
              <UserIcon size={16} className="mr-2" />
              Account Details
            </div>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'subscription'}
            id="subscription-tab"
            aria-controls="subscription-panel"
            className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'subscription' ? 'border-purple-500 text-white' : 'border-transparent text-white/60 hover:text-white/80'}`}
            onClick={() => setActiveTab('subscription')}
          >
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
          <div role="tabpanel" id="account-panel" aria-labelledby="account-tab" className="space-y-6">
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
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setAccountMsg("");
                  setIsUpdating(true);
                  
                  try {
                    const nameChanged = newName && newName !== userDetails.name;
                    const msgArr = [];
                    
                    if (nameChanged) {
                      await handleNameChange();
                      msgArr.push('Name updated');
                    }
                    
                    if (msgArr.length > 0) {
                      setAccountMsg(msgArr.join(' | '));
                    } else {
                      setAccountMsg('No changes to update');
                    }
                  } catch (err: any) {
                    setAccountMsg('Error updating account: ' + err.message);
                  } finally {
                    setIsUpdating(false);
                  }
                }} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/80">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder={userDetails.name}
                      className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 py-2 px-3 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex flex-col items-start space-y-2 mb-4">
                    <label className="block text-sm font-medium text-white/80">
                      Password
                    </label>
                    <a
                      href="/change-password"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 text-center"
                    >
                      Change Password
                    </a>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isUpdating || !newName || newName === userDetails.name}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleNameChange}
                    >
                      {isUpdating ? 'Saving...' : 'Save Name'}
                    </button>
                  </div>
                  {accountMsg && (
                    <div className="mt-2 text-white font-semibold">{accountMsg}</div>
                  )}
                </form>
              </div>
            </div>

          </div>
        )}
        {activeTab === 'subscription' && (
          <div role="tabpanel" id="subscription-panel" aria-labelledby="subscription-tab" className="space-y-6">
            {isLoading ? (
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
                    {/* CTA: show Subscribe unless active; otherwise route to portal. */}
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
                              <>
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
                                  !subscribed ? (
                                    <span>You do not have an active subscription.</span>
                                  ) : (
                                    <>
                                      You are currently subscribed to the <span className="font-medium text-white">{getPlanName()}</span> at <span className="font-medium text-white">{getPlanPrice()}</span>.{' '}
                                      {nextBillingDate && (
                                        <>Next billing date: <span className="font-medium text-white">{new Date(nextBillingDate).toLocaleDateString()}</span>.</>
                                      )}
                                    </>
                                  )
                                )}
                              </>
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