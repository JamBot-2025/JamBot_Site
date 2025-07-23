import React from 'react';
import { CheckIcon, ZapIcon, TagIcon, ArrowRightIcon } from 'lucide-react';

export const PricingSection = () => {
  const features = ['5 projects', '10GB storage', 'Basic analytics', 'Email support', 'Access to all core features', 'Regular updates'];
  return <section id="pricing" className="w-full bg-black py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-blue-600/15 animate-gradient-shift blur-3xl opacity-60" style={{
        animationDelay: '-10s'
      }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-green-600/10 animate-gradient-flow blur-2xl opacity-70" style={{
        animationDelay: '-2s'
      }}></div>
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold py-2 px-4 rounded-full mb-6">
            <div className="flex items-center">
              <TagIcon size={16} className="mr-2" />
              Limited Time Preorder Offer
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Preorder Now & Save Big
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Early adopters get exclusive pricing. Lock in our best deal before
            launch.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <div className="relative bg-black rounded-xl border border-purple-500 shadow-lg shadow-purple-500/10 transition-all hover-card reveal-on-scroll">
            <div className="absolute -top-3 left-0 right-0 mx-auto w-max bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold py-1 px-3 rounded-full">
              PREORDER SPECIAL
            </div>
            <div className="p-8">
              <div className="w-16 h-16 mb-6 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <ZapIcon size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Standard Plan
              </h3>
              <div className="flex flex-col mb-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">$14.99</span>
                  <span className="text-white/60 ml-1">/ 3 months</span>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-sm line-through text-white/50 mr-2">
                    $23.97
                  </span>
                  <span className="text-sm font-medium text-green-400">
                    Save 37%
                  </span>
                </div>
              </div>
              <p className="text-white/70 mb-8">
                Get early access and lock in our best price before launch
              </p>
              <div className="border-t border-white/10 pt-6 mb-8">
                <p className="text-sm font-medium text-white mb-4">
                  What's included:
                </p>
                <ul className="space-y-4">
                  {features.map((feature, idx) => <li key={idx} className="flex items-start">
                      <CheckIcon size={18} className="text-green-400 flex-shrink-0 mt-0.5 mr-3" />
                      <span className="text-white/80">{feature}</span>
                    </li>)}
                </ul>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white/50 text-sm">
                  Limited spots available. Offer ends soon.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <TagIcon size={20} className="text-white" />
              </div>
              <div className="ml-4">
                <h4 className="text-white font-medium">
                  After Preorder Period
                </h4>
                <p className="text-white/70 text-sm mt-1">
                  Regular pricing will be $7.99/month. Preorder now to get 3
                  months for only $14.99.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-2"></div>
                <span>Early access</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                <span>24/7 support</span>
              </div>
            </div>
            <p className="text-white/70 mt-6">
              Need help?{' '}
              <a href="#contact" className="text-purple-400 hover:text-purple-300">
                Contact our team
              </a>{' '}
              for assistance.
            </p>
          </div>
        </div>
      </div>
    </section>;
};