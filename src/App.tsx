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
import { LoginForm } from './components/LoginForm';
import ManageSubscription from './pages/ManageSubscription';
import { supabase } from './supabaseClient';

const SubscribePage = React.lazy(() => import('./pages/Subscribe'));
const AccountPage = React.lazy(() => import('./components/AccountPage'));

export function App() {
  const [user, setUser] = React.useState<any>(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthChecked(true);
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
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
      <Header user={user} onLogout={handleLogout} />
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <FeaturesSection />
              <PricingSection />
              <CTASection />
            </>
          } />
          <Route path="/subscribe" element={
            <Elements stripe={stripePromise}>
              <SubscribePage user={user} authChecked={authChecked} />
            </Elements>
          } />
          <Route path="/account" element={
            <AccountPage
              userDetails={{
                name: user?.user_metadata?.full_name || user?.email || '',
                email: user?.email || ''
              }}
              setUser={setUser}
            />
          } />
          <Route path="/manageSubscription" element={<ManageSubscription />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/success" element={<div className="text-white p-10">Subscription Successful!</div>} />
          <Route path="/cancel" element={<div className="text-white p-10">Subscription Cancelled.</div>} />
        </Routes>
      </React.Suspense>
      <FooterSection />
    </BrowserRouter>
  );
}
