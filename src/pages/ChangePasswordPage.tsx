import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ChangePasswordPage: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  // Check if user is signed in (Supabase will auto sign in with reset token)
  const [canShowForm, setCanShowForm] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMsg('You must be logged in to change your password.');
        setCanShowForm(false);
      } else {
        setUserEmail(user.email || '');
        setCanShowForm(true);
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (newPassword !== confirmPassword) {
      setMsg('Passwords do not match.');
      return;
    }
    if (!oldPassword) {
      setMsg('Please enter your old password.');
      return;
    }
    setLoading(true);
    // Verify old password by attempting sign in
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      setMsg('Session expired or invalid. Please use the reset link again.');
      setLoading(false);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword
    });
    if (signInError) {
      setMsg('Old password is incorrect.');
      setLoading(false);
      return;
    }
    // Old password is correct, proceed to update
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) {
      setMsg('Error updating password: ' + updateError.message);
    } else {
      setMsg('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="w-full max-w-md">
        {msg && <div className="mb-2 text-sm text-pink-300">{msg}</div>}
        {canShowForm && (
          <form className="bg-white/10 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleReset}>
            <h2 className="text-2xl font-bold text-white mb-4">Change Your Password</h2>
            <div className="mb-4">
              <label id="old-password-label" htmlFor="old-password" className="block text-white/80 mb-1">Old Password</label>
              <input
                id="old-password"
                type="password"
                
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
            <div className="mb-4">
              <label id="new-password-label" htmlFor="new-password" className="block text-white/80 mb-1">New Password</label>
              <input
                id="new-password"
                type="password"
                
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div className="mb-4">
              <label id="confirm-password-label" htmlFor="confirm-password" className="block text-white/80 mb-1">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
