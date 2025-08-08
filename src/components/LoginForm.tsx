import React, { useState } from 'react';
import { MailIcon, LockIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setAuthError(null);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: ''
    };
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!validateForm()) return;
    setLoading(true);
    const { email, password } = formData;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError(null);
      navigate('/account');
      if (onLoginSuccess) onLoginSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
      <div className="relative bg-gradient-to-br from-black/70 to-gray-900/80 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 mx-4">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Log In</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <MailIcon size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Email address"
                disabled={loading}
                data-testid="email-input"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <LockIcon size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Password"
                disabled={loading}
                data-testid="password-input"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>
          {authError && <div className="text-red-500 text-sm text-center">{authError}</div>}
          {resetStatus && <div className={`text-sm text-center ${resetStatus.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{resetStatus}</div>}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 disabled:opacity-60"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={async () => {
                  setResetStatus(null);
                  if (!formData.email) {
                    setResetStatus('Please enter your email above first.');
                    return;
                  }
                  setResetLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                    redirectTo: 'http://localhost:5173/reset-password'
                  });
                  setResetLoading(false);
                  if (error) {
                    setResetStatus('Error: ' + error.message);
                  } else {
                    setResetStatus('Password reset email sent! Check your inbox.');
                  }
                }}
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
          <div className="mt-4 text-center text-sm text-white/50">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-purple-400 hover:text-purple-300 underline bg-transparent border-none cursor-pointer"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};