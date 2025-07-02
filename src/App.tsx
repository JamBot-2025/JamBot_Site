import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { CTASection } from './components/CTASection';
import { FooterSection } from './components/FooterSection';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './utils/stripe';
import { SignupForm } from './components/SignupForm';
import { supabase } from './supabaseClient';

export function App() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <div className="w-full min-h-screen bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-green-600/15 animate-gradient-flow blur-3xl opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-blue-600/10 animate-gradient-shift blur-2xl opacity-60" style={{ animationDelay: '-5s' }}></div>
          <div className="relative">
            <Header user={user} onLogout={handleLogout} />
            <main>
              <Routes>
                <Route path="/" element={<><HeroSection /><FeaturesSection /><PricingSection /><CTASection /></>} />
                <Route path="/signup" element={<SignupForm />} />
              </Routes>
            </main>
            <FooterSection />
          </div>
        </div>
      </Elements>
    </BrowserRouter>
  );
}
