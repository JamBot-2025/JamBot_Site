import React, { useState } from 'react';
import { ArrowLeftIcon, CreditCardIcon, UserIcon, LogOutIcon, BellIcon, InfoIcon } from 'lucide-react';
interface AccountPageProps {
  userDetails: {
    name: string;
    email: string;
  };
  subscriptionDetails?: {
    plan: string | null;
    subscriptionId?: string;
    status: 'active' | 'inactive' | 'trial';
    nextBillingDate: string;
  };
  onBack: () => void;
  onLogout?: () => void;
}
export const AccountPage: React.FC<AccountPageProps> = ({
  userDetails,
  subscriptionDetails,
  onBack,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'subscription'>('account');
  // Get plan name based on selected plan
  const getPlanName = () => {
    if (subscriptionDetails?.plan === 'preorder') {
      return 'Standard Plan (Preorder Special)';
    }
    switch (subscriptionDetails?.plan) {
      case 'basic':
        return 'Standard Plan';
      case 'pro':
        return 'Pro Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      default:
        return 'Standard Plan';
    }
  };
  const getPlanPrice = () => {
    if (subscriptionDetails?.plan === 'preorder') {
      return '$14.99/3 months';
    }
    switch (subscriptionDetails?.plan) {
      case 'basic':
        return '$7.99/month';
      case 'pro':
        return '$29.99/month';
      case 'enterprise':
        return '$99.99/month';
      default:
        return '$7.99/month';
    }
  };
  const getStatusBadge = () => {
    switch (subscriptionDetails?.status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
            Active
          </span>;
      case 'trial':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
            Trial
          </span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
            Inactive
          </span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
            Active
          </span>;
    }
  };
  return <div className="w-full bg-black">
      {/* Header */}
      <div className="border-b border-white/10 py-4 px-4 sm:px-6 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-white/70 hover:text-white transition-colors">
          <ArrowLeftIcon size={18} className="mr-2" />
          <span>Back</span>
        </button>
        <button onClick={onLogout} className="flex items-center text-white/70 hover:text-white transition-colors">
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
        {activeTab === 'account' && <div className="space-y-6">
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
          </div>}
        {activeTab === 'subscription' && <div className="space-y-6">
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      Current Plan
                    </h3>
                    <p className="mt-1 text-sm text-white/70">
                      Manage your subscription
                    </p>
                  </div>
                  {getStatusBadge()}
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-white">
                    {getPlanName()}
                  </h4>
                  <p className="text-white/70">{getPlanPrice()}</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/20">
                  <div className="flex items-start">
                    <InfoIcon size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <h5 className="text-white font-medium mb-1">
                        Billing Information
                      </h5>
                      <p className="text-white/80 text-sm">
                        Your special preorder price of{' '}
                        <span className="font-medium text-white">$14.99</span>{' '}
                        covers your first 3 months. After this period, your
                        subscription will automatically convert to the regular
                        price of
                        <span className="font-medium text-white">
                          {' '}
                          $7.99/month
                        </span>
                        , billed monthly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Next billing date</span>
                    <span className="text-white font-medium">
                      {subscriptionDetails?.nextBillingDate || 'May 12, 2023'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Initial period</span>
                    <span className="text-white font-medium">
                      3 months ($14.99 total)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Subsequent billing</span>
                    <span className="text-white font-medium">
                      Monthly ($7.99/month)
                    </span>
                  </div>
                  {subscriptionDetails?.subscriptionId && <div className="flex justify-between text-sm">
                      <span className="text-white/70">Subscription ID</span>
                      <span className="text-white font-medium">
                        {subscriptionDetails.subscriptionId}
                      </span>
                    </div>}
                </div>
                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
                  <button className="text-white/70 hover:text-white text-sm flex items-center">
                    <CreditCardIcon size={16} className="mr-2" />
                    Update payment method
                  </button>
                  <button className="text-red-400 hover:text-red-300 text-sm">
                    Cancel subscription
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-white/10">
                <h3 className="text-lg font-medium text-white">
                  Billing History
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead>
                      <tr>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white/70">
                          Date
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white/70">
                          Amount
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white/70">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-white/70">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">
                          Apr 12, 2023
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">
                          {getPlanPrice()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                            Paid
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                          <a href="#" className="text-purple-400 hover:text-purple-300">
                            Download
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">
                          Mar 12, 2023
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-white/80">
                          {getPlanPrice()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                            Paid
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                          <a href="#" className="text-purple-400 hover:text-purple-300">
                            Download
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};