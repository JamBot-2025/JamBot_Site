import React from 'react';

const ManageSubscription: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="bg-white/10 rounded-lg p-8 shadow-lg border border-white/10 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Manage Subscription</h1>
        <p className="text-white/80 mb-6">
          Here you will be able to view, update, or cancel your subscription, change your plan, and see your billing history.
        </p>
        <div className="text-white/60 text-sm">(This page is a placeholder. Integrate Stripe customer portal or custom management here.)</div>
      </div>
    </div>
  );
};

export default ManageSubscription;
