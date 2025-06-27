import React from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { CTASection } from './components/CTASection';
import { FooterSection } from './components/FooterSection';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './utils/stripe';
export function App() {
  return <Elements stripe={stripePromise}>
      <div className="w-full min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-green-600/15 animate-gradient-flow blur-3xl opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-blue-600/10 animate-gradient-shift blur-2xl opacity-60" style={{
        animationDelay: '-5s'
      }}></div>
        <div className="relative">
          <Header />
          <main>
            <HeroSection />
            <FeaturesSection />
            <PricingSection />
            <CTASection />
          </main>
          <FooterSection />
        </div>
      </div>
    </Elements>;
}