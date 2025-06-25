import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
interface SuccessScreenProps {
  onClose: () => void;
  subscriptionDetails?: {
    plan: string | null;
    email: string;
    subscriptionId?: string;
  };
}
export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  onClose,
  subscriptionDetails
}) => {
  // Get plan name based on selected plan
  const getPlanName = () => {
    switch (subscriptionDetails?.plan) {
      case 'basic':
        return 'Basic Plan ($7.99/month)';
      case 'pro':
        return 'Pro Plan ($29.99/month)';
      case 'enterprise':
        return 'Enterprise Plan ($99.99/month)';
      default:
        return 'Subscription Plan';
    }
  };
  return <div className="text-center py-6">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
          <div size={40} className="text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        Subscription Activated!
      </h2>
      <p className="text-white/70 mb-8">
        Thank you for subscribing. Your account has been successfully set up and
        your subscription is now active.
      </p>
      {subscriptionDetails && <div className="bg-gradient-to-br from-purple-900/30 to-black/30 border border-white/10 rounded-lg p-4 mb-8 text-left">
          <h3 className="text-white font-medium mb-3">Subscription Details</h3>
          <div className="space-y-2 text-white/80 text-sm">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium text-white">{getPlanName()}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium text-white">
                {subscriptionDetails.email}
              </span>
            </div>
            {subscriptionDetails.subscriptionId && <div className="flex justify-between">
                <span>Subscription ID:</span>
                <span className="font-medium text-white">
                  {subscriptionDetails.subscriptionId}
                </span>
              </div>}
            <div className="flex justify-between">
              <span>Billing Cycle:</span>
              <span className="font-medium text-white">Monthly</span>
            </div>
            <div className="flex justify-between">
              <span>Next Billing Date:</span>
              <span className="font-medium text-white">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>}
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
            <span>Complete your profile to personalize your experience</span>
          </li>
          <li className="flex items-start">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>
              Explore the dashboard and get started with your first project
            </span>
          </li>
        </ul>
      </div>
      <button onClick={onClose} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 flex items-center justify-center">
        Get Started
        <ArrowRightIcon size={20} className="ml-2" />
      </button>
    </div>;
};