import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
export const CTASection = () => {
  return <section id="contact" className="w-full bg-black py-20 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/20 via-purple-600/15 to-green-600/20 animate-gradient-flow blur-3xl opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/15 via-transparent to-orange-600/15 animate-gradient-shift blur-2xl opacity-70" style={{
        animationDelay: '-15s'
      }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/10 to-transparent animate-gradient-pulse blur-xl" style={{
        animationDelay: '-5s'
      }}></div>
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of teams already using our platform to increase
            productivity and streamline operations.
          </p>
          <div className="bg-black p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <form className="flex flex-col md:flex-row gap-4">
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white/40 transition-all duration-300" />
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center justify-center transition-all duration-300 hover:opacity-90">
                Get Started
                <ArrowRightIcon size={20} className="ml-2" />
              </button>
            </form>
            <p className="mt-4 text-sm text-white/60">
              Free 14-day trial. No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>;
};