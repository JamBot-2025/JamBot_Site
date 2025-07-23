import React, { useState } from 'react';
import { ArrowRightIcon, TagIcon, ZapIcon } from 'lucide-react';
import { AccountPage } from './AccountPage';
interface SuccessScreenProps {
  onClose: () => void;
  subscriptionDetails?: {
    email: string;
    subscriptionId?: string;
  };
  userDetails: {
    name: string;
    email: string;
  };
}
export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  onClose,
  subscriptionDetails,
  userDetails
}) => {
  const [showAccountPage, setShowAccountPage] = useState(false);
  if (showAccountPage) {
    return <AccountPage userDetails={userDetails} setUser={setUser} />;
  }
  return <div className="text-center py-6">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
          <ZapIcon size={40} className="text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        Preorder Confirmed!
      </h2>
      <p className="text-white/70 mb-8">
        Thank you for your preorder. Your account has been successfully set up
        and you'll be among the first to access our platform when we launch.
      </p>
      <div className="bg-gradient-to-br from-purple-900/30 to-black/30 border border-white/10 rounded-lg p-4 mb-8 text-left">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <ZapIcon size={24} className="text-white" />
          </div>
          <div className="ml-4">
            <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold py-1 px-2 rounded-full mb-2">
              <div className="flex items-center">
                <TagIcon size={12} className="mr-1" />
                PREORDER SPECIAL
              </div>
            </div>
            <h3 className="text-white font-medium mb-1">
              Subscription Details
            </h3>
            <div className="space-y-2 text-white/80 text-sm">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium text-white">
                  Standard Plan ($14.99/3 months)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium text-white">
                  {subscriptionDetails?.email}
                </span>
              </div>
              {subscriptionDetails?.subscriptionId && <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium text-white">
                    {subscriptionDetails.subscriptionId}
                  </span>
                </div>}
              <div className="flex justify-between">
                <span>Next Billing Date:</span>
                <span className="font-medium text-white">
                  {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Savings:</span>
                <span className="font-medium text-green-400">
                  37% off regular price
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-900/30 to-black/30 border border-white/10 rounded-lg p-4 mb-8">
        <h3 className="text-white font-medium mb-2">What's Next?</h3>
        <ul className="text-left space-y-2 text-white/80">
          <li className="flex items-start">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>Check your email for confirmation details</span>
          </li>
          <li className="flex items-start">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>You'll receive early access when we launch</span>
          </li>
          <li className="flex items-start">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>Complete your profile to personalize your experience</span>
          </li>
        </ul>
      </div>
      <button onClick={() => setShowAccountPage(true)} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 flex items-center justify-center">
        Go to Account
        <ArrowRightIcon size={20} className="ml-2" />
      </button>
    </div>;
};