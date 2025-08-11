import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// FUNCTIONALITY: Reset password page (redirect target) that sets a new password using a temporary session.

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [canShowForm, setCanShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  // Debug: log when form becomes visible
  if (canShowForm) {
    setTimeout(() => {
      const form = document.querySelector('form');
      console.log('Form HTML:', form?.innerHTML);
    }, 0);
  }
    const checkSession = async () => {
      const { data: { user, session } } = await supabase.auth.getSession();
      const sessionUser = user ?? session?.user;
      console.log('[ResetPasswordPage] user:', user);
      console.log('[ResetPasswordPage] session:', session);
      if (!sessionUser || !session || !session.access_token) {
        setMsg('Invalid or expired reset link. Please request a new password reset.');
        setCanShowForm(false);
      } else {
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
    setLoading(true);
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
      <div className="w-full max-w-md">
        {msg && <div className="mb-2 text-sm text-pink-300">{msg}</div>}
        {canShowForm && (
          <form className="bg-white/10 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleReset}>
            <h2 className="text-2xl font-bold text-white mb-4">Reset Your Password</h2>
            <div className="mb-4">
              <label id="new-password-label" htmlFor="new-password" className="block text-white/80 mb-1">New password</label>
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
              <label id="confirm-password-label" htmlFor="confirm-password" className="block text-white/80 mb-1">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                aria-label="Confirm password"
                
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
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
