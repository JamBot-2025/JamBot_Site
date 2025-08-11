import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// FUNCTIONALITY: One-time setup page that ensures a profile row exists, then routes to the account page.

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createProfileIfNeeded = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }
      // Try to insert the profile row (id is unique, so this is safe)
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        }
      ]);
      // Ignore duplicate key errors (row already exists)
      if (insertError && insertError.code !== '23505') {
        setError('Failed to create profile row.');
        setLoading(false);
        return;
      }
      // Success or row already exists
      navigate('/account');
    };
    createProfileIfNeeded();
  }, [navigate]);

  if (loading) return <div className="text-center text-white py-10">Setting up your account...</div>;
  if (error) return <div className="text-center text-red-400 py-10">{error}</div>;
  return null;
};

export default Welcome;
