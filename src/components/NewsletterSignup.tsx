import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface NewsletterSignupProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export function NewsletterSignup({
  isOpen = true,
  onClose = () => {},
  inline = false
}: NewsletterSignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset states
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Insert data into the users table
      const { error } = await supabase
        .from('users')
        .insert([
          { 
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        ]);
      
      if (error) throw error;
      
      // Handle successful submission
      console.log('Newsletter signup successful');
      setSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: ''
        });
        if (!inline) onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('Newsletter signup error:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;
  
  // Inline version (for embedding in CTASection)
  if (inline) {
    return (
      <div className="w-full">
        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-800/50 border border-green-700 rounded-md text-green-100">
            Thank you for signing up! We'll keep you updated.
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-800/50 border border-red-700 rounded-md text-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              className="px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white/40 transition-all duration-300"
              disabled={loading}
            />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your email"
              className="px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white/40 transition-all duration-300"
              disabled={loading}
            />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your phone (optional)"
              className="px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white/40 transition-all duration-300"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto md:self-center px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? 'Signing up...' : 'Sign-up for our Newsletter'}
          </button>
        </form>
        
        <p className="mt-4 text-sm text-white/60">
          We'll only email you if we have something exciting to show.
        </p>
      </div>
    );
  }
  
  // Modal version (for use as a popup)
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative border border-gray-700">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <XIcon className="h-6 w-6" />
        </button>
        
        {/* Form title */}
        <h2 className="text-2xl font-bold text-white mb-6">Sign Up for JamBot Updates</h2>
        
        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-800/50 border border-green-700 rounded-md text-green-100">
            Thank you for signing up! We'll keep you updated.
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-800/50 border border-red-700 rounded-md text-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                loading 
                  ? 'bg-blue-700/50 text-blue-100 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              } transition-colors`}
            >
              {loading ? 'Signing up...' : 'Sign Up for Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
