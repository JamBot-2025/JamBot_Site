import React from 'react';
import Welcome from './pages/Welcome';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PricingSection } from './components/PricingSection';
import { CTASection } from './components/CTASection';
import { FooterSection } from './components/FooterSection';
import { SignupForm } from './components/SignupForm';
import { LoginForm } from './components/LoginForm';
import ManageSubscription from './pages/ManageSubscription';
import { supabase } from './supabaseClient';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

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
      if (user) ensureProfileRow(user);
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (session?.user) ensureProfileRow(session.user);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  ///////////////////////////////////////////
  // Ensure profile row exists for authenticated user
  async function ensureProfileRow(user: any) {
    // Check if profile row exists
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    if (!data) {
      // Create profile row if missing
      await supabase.functions.invoke('signup-hook', {
        body: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email
        },
      });
    }
  }

  ///////////////////////////////////////////
  

  return (
    <BrowserRouter>
      <div className="relative min-h-[320px] bg-black overflow-hidden rounded-xl">
        {/* moving color blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl mix-blend-screen animate-blob"></div>
        <div className="pointer-events-none absolute top-28 -right-32 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl mix-blend-screen animate-blob [animation-delay:2s]"></div>
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-emerald-500/30 blur-3xl mix-blend-screen animate-blob [animation-delay:4s]"></div>
        <div className="relative p-8 text-white">
                  {/* Background removed to let yellow show through */}
                <Header user={user} authChecked={authChecked} />
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                <Route path="/welcome" element={<Welcome />} />
                    <Route path="/" element={
                      <>
                        <HeroSection />
                        <FeaturesSection />
                        <PricingSection />
                        <CTASection />
                      </>
                    } />
                    <Route path="/subscribe" element={
                      <SubscribePage user={user} authChecked={authChecked} />
                    } />
                    <Route path="/account" element={
                      !authChecked ? (
                        <div className="text-white p-10">Loading account...</div>
                      ) : user ? (
                        <AccountPage
                          userDetails={{
                            name: user?.user_metadata?.full_name || user?.email || '',
                            email: user?.email || ''
                          }}
                          setUser={setUser}
                        />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    } />
                    <Route path="/manageSubscription" element={<ManageSubscription />} />
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/success" element={<div className="text-white p-10">Subscription Successful!</div>} />
                    <Route path="/cancel" element={<div className="text-white p-10">Subscription Cancelled.</div>} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/change-password" element={<ChangePasswordPage />} />
                  </Routes>
                </React.Suspense>
                <FooterSection />
            </div>
          </div>
    </BrowserRouter>
  );
}
