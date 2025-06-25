import React, { useState } from 'react';
import { MailIcon, LockIcon, UserIcon } from 'lucide-react';
import { TermsOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';
interface SignupFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
  }) => void;
}
export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
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
      password: ''
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
    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
  return <form onSubmit={handleSubmit} className="space-y-4">
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
      {/* Terms and Privacy Policy Modals */}
      <TermsOfService isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </form>;
};