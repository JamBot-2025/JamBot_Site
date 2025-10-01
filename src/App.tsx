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
import { BlogSection } from './components/BlogSection';
import ManageSubscription from './pages/ManageSubscription';
import { supabase } from './supabaseClient';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { initScrollReveal } from './utils/scrollReveal';

const SubscribePage = React.lazy(() => import('./pages/Subscribe'));
const AccountPage = React.lazy(() => import('./components/AccountPage'));

export function App() {
  const [user, setUser] = React.useState<any>(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    // Initialize scroll reveal for animations
    initScrollReveal();
    
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
        {/* First layer - large background blobs with gradient flow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full blur-3xl mix-blend-screen animate-gradient-flow" 
          style={{background: 'linear-gradient(225deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3), rgba(196, 181, 253, 0.2))', animationDuration: '28s'}}></div>
        
        <div className="pointer-events-none absolute top-28 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl mix-blend-screen animate-gradient-flow" 
          style={{animationDelay: '2s', background: 'linear-gradient(225deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3), rgba(147, 197, 253, 0.2))', animationDuration: '24s'}}></div>
        
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[32rem] w-[32rem] rounded-full blur-3xl mix-blend-screen animate-gradient-flow" 
          style={{animationDelay: '4s', background: 'linear-gradient(225deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3), rgba(110, 231, 183, 0.2))', animationDuration: '26s'}}></div>
        
        {/* Second layer - medium blobs with blob animation */}
        <div className="pointer-events-none absolute top-1/2 -left-20 h-80 w-80 rounded-full blur-3xl mix-blend-screen animate-blob" 
          style={{background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(244, 114, 182, 0.3), rgba(251, 207, 232, 0.2))', animationDuration: '13s'}}></div>
        
        <div className="pointer-events-none absolute -top-20 left-1/3 h-64 w-64 rounded-full blur-3xl mix-blend-screen animate-blob" 
          style={{animationDelay: '3s', background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(234, 88, 12, 0.3), rgba(253, 186, 116, 0.2))', animationDuration: '14s'}}></div>
        
        <div className="pointer-events-none absolute bottom-20 right-1/4 h-72 w-72 rounded-full blur-3xl mix-blend-screen animate-wobble" 
          style={{animationDelay: '5s', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.25), rgba(125, 211, 252, 0.15))', animationDuration: '15s'}}></div>
        
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-60 w-60 rounded-full blur-3xl mix-blend-screen animate-wobble" 
          style={{animationDelay: '1s', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(139, 92, 246, 0.25), rgba(196, 181, 253, 0.15))', animationDuration: '12s'}}></div>
          
        {/* Third layer - smaller faster moving blobs */}
        <div className="pointer-events-none absolute top-1/3 left-1/4 h-48 w-48 rounded-full blur-2xl mix-blend-screen animate-wobble" 
          style={{animationDelay: '0.5s', background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.25), rgba(245, 158, 11, 0.25), rgba(254, 240, 138, 0.15))', animationDuration: '10s'}}></div>
          
        <div className="pointer-events-none absolute top-3/4 right-1/3 h-40 w-40 rounded-full blur-2xl mix-blend-screen animate-wild" 
          style={{animationDelay: '1.5s', background: 'linear-gradient(135deg, rgba(190, 24, 93, 0.25), rgba(219, 39, 119, 0.25), rgba(249, 168, 212, 0.15))', animationDuration: '9s'}}></div>
          
        <div className="pointer-events-none absolute top-10 left-1/2 h-44 w-44 rounded-full blur-2xl mix-blend-screen animate-wobble" 
          style={{animationDelay: '3.5s', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(8, 145, 178, 0.25), rgba(103, 232, 249, 0.15))', animationDuration: '11s'}}></div>
          
        <div className="pointer-events-none absolute top-2/3 left-10 h-52 w-52 rounded-full blur-2xl mix-blend-screen animate-wild" 
          style={{animationDelay: '2.5s', background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.25), rgba(16, 185, 129, 0.25), rgba(110, 231, 183, 0.15))', animationDuration: '8s'}}></div>
          
        <div className="pointer-events-none absolute bottom-1/4 right-20 h-32 w-32 rounded-full blur-2xl mix-blend-screen animate-wobble" 
          style={{animationDelay: '4.5s', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(109, 40, 217, 0.25), rgba(196, 181, 253, 0.15))', animationDuration: '7.5s'}}></div>
          
        {/* Fourth layer - smallest and wildest elements */}
        <div className="pointer-events-none absolute top-1/5 right-1/5 h-28 w-28 rounded-full blur-xl mix-blend-screen animate-wild" 
          style={{animationDelay: '0.8s', background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.25), rgba(234, 88, 12, 0.25), rgba(254, 215, 170, 0.15))', animationDuration: '6.5s'}}></div>
          
        <div className="pointer-events-none absolute bottom-1/3 left-1/5 h-24 w-24 rounded-full blur-xl mix-blend-screen animate-wild" 
          style={{animationDelay: '1.2s', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.25), rgba(110, 231, 183, 0.15))', animationDuration: '5.5s'}}></div>
          
        <div className="pointer-events-none absolute top-2/5 right-1/3 h-20 w-20 rounded-full blur-xl mix-blend-screen animate-wild" 
          style={{animationDelay: '3.2s', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.25), rgba(254, 202, 202, 0.15))', animationDuration: '4.5s'}}></div>
          
        <div className="pointer-events-none absolute bottom-2/5 left-2/5 h-16 w-16 rounded-full blur-lg mix-blend-screen animate-wild" 
          style={{animationDelay: '2.2s', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.25), rgba(147, 197, 253, 0.15))', animationDuration: '5s'}}></div>
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
                        <BlogSection />
                        {/*<PricingSection />*/}
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
