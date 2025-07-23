import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon } from 'lucide-react';
import { TermsOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';
import { supabase } from '../supabaseClient';



interface SignupFormProps {
}

export const SignupForm: React.FC<SignupFormProps> = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      phoneNumber: ''
    };
    if (!formData.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone Number is required';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    if (validateForm()) {
      try {
        // Use Supabase Auth signUp (handles email verification automatically)
        const {error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone_number: formData.phoneNumber
            }
          }
        });

        if (signUpError) {
          setSubmitError('Sign up failed. Please try again.');
          return;
        }

        setSubmitSuccess('Check your email to verify your account.');
        setFormData({ name: '', email: '', password: '', phoneNumber: '' });
        // Call signup-hook to create Stripe customer and update profiles
        try {
          const { data } = await supabase.auth.getUser();
          const userId = data.user?.id;
          await supabase.functions.invoke('signup-hook', {
            body: {
              id: userId,
              email: formData.email,
              name: formData.name
            },
          });
        } catch (err) {
          setSubmitError("Account created, but failed to create Stripe customer. Please contact support if you have issues subscribing.");
        }
        // Redirect to login page after successful signup
        setTimeout(() => navigate('/login'), 1500);
      } catch (err: any) {
        setSubmitError(err.message || 'An unexpected error occurred.');
      }
    }
  };
  const openTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTermsOpen(true);
  };
  const openPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPrivacyOpen(true);
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
      <div className="relative bg-gradient-to-br from-black/70 to-gray-900/80 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 mx-4">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <UserIcon size={18} />
              </div>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Full name" />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <MailIcon size={18} />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Email address" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <LockIcon size={18} />
              </div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Password (min. 8 characters)" />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                <span role="img" aria-label="Phone">📞</span>
              </div>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Phone Number"
              />
            </div>
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>}
          </div>
          <div className="flex items-center">
            <input id="terms" name="terms" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" required />
            <label htmlFor="terms" className="ml-2 block text-sm text-white/70">
              I agree to the{' '}
              <a href="#" onClick={openTerms} className="text-purple-400 hover:text-purple-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" onClick={openPrivacy} className="text-purple-400 hover:text-purple-300">
                Privacy Policy
              </a>
            </label>
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            Create Account
          </button>
          {submitError && <p className="mt-2 text-sm text-red-400">{submitError}</p>}
          {submitSuccess && <p className="mt-2 text-sm text-green-400">{submitSuccess}</p>}
          <div className="mt-4 text-center text-sm text-white/50">
            Already have an account?{' '}
            <button
              type="button"
              className="text-purple-400 hover:text-purple-300 underline bg-transparent border-none cursor-pointer"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
          </div>
          {/* Terms and Privacy Policy Modals */}
          <TermsOfService isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
          <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        </form>
      </div>
    </div>
  );
};