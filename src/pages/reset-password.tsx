import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // Check if user is signed in (Supabase will auto sign in with reset token)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMsg('Invalid or expired reset link. Please request a new password reset.');
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
    setLoading(true);
    // User is signed in with a temporary session from the reset link
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setMsg('Error updating password: ' + error.message);
    } else {
      setMsg('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
      <form className="bg-white/10 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleReset}>
        <h2 className="text-2xl font-bold text-white mb-4">Reset Your Password</h2>
        <div className="mb-4">
          <label className="block text-white/80 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white/80 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        {msg && <div className="mb-2 text-sm text-pink-300">{msg}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          {loading ? 'Updating...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
