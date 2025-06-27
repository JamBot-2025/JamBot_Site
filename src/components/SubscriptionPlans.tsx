import React from 'react';
import { CheckIcon, ZapIcon, RocketIcon, StarIcon } from 'lucide-react';
interface SubscriptionPlansProps {
  onSelect: (planId: string) => void;
}
export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelect
}) => {
  const plans = [{
    id: 'basic',
    name: 'Basic',
    price: '$7.99',
    period: 'monthly',
    description: 'Perfect for individuals and small projects',
    icon: <ZapIcon size={24} className="text-blue-400" />,
    features: ['5 projects', '10GB storage', 'Basic analytics', 'Email support'],
    color: 'from-blue-500 to-blue-600',
    popular: true
  }, {
    id: 'pro',
    name: 'Pro',
    price: '$29.99',
    period: 'monthly',
    description: 'Ideal for professionals and growing teams',
    icon: <RocketIcon size={24} className="text-purple-400" />,
    features: ['Unlimited projects', '100GB storage', 'Advanced analytics', 'Priority support', 'Team collaboration', 'Custom integrations'],
    color: 'from-purple-500 to-pink-500',
    popular: false
  }, {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99.99',
    period: 'monthly',
    description: 'For organizations requiring advanced features',
    icon: <StarIcon size={24} className="text-orange-400" />,
    features: ['Unlimited everything', 'Dedicated support', 'Custom development', 'SLA guarantees', 'On-premise option', 'Advanced security'],
    color: 'from-orange-500 to-red-500',
    popular: false
  }];
  return <div>
      <h2 className="text-2xl font-bold text-white mb-2">Choose your plan</h2>
      <p className="text-white/70 mb-6">
        Select the plan that best fits your needs
      </p>
      <div className="space-y-4">
        {plans.map(plan => <div key={plan.id} className={`relative p-5 rounded-xl border transition-all cursor-pointer hover:shadow-lg ${plan.popular ? 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-transparent' : 'border-white/10 hover:border-white/30'}`} onClick={() => onSelect(plan.id)}>
            {plan.popular && <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1 px-3 rounded-full">
                Most Popular
              </div>}
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                {plan.icon}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xl font-semibold text-white">
                    {plan.name}
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-white/60">/{plan.period}</span>
                  </div>
                </div>
                <p className="text-white/70 mt-1">{plan.description}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, index) => <li key={index} className="flex items-start">
                      <CheckIcon size={18} className="text-green-400 flex-shrink-0 mt-0.5 mr-2" />
                      <span className="text-white/80">{feature}</span>
                    </li>)}
                </ul>
                <button className={`mt-5 w-full py-2 rounded-lg text-white font-medium transition-all ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`} onClick={() => onSelect(plan.id)}>
                  Select Plan
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
};