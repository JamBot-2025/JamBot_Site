import React, { useState } from 'react';
import { MailIcon, LockIcon } from 'lucide-react';
interface LoginFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
  }) => void;
}
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
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
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Password" />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="text-purple-400 hover:text-purple-300">
            Forgot password?
          </a>
        </div>
      </div>
      <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900">
        Sign In
      </button>
      <div className="mt-4 text-center text-sm text-white/50">
        Don't have an account?{' '}
        <a href="#" className="text-purple-400 hover:text-purple-300">
          Sign up
        </a>
      </div>
    </form>;
};