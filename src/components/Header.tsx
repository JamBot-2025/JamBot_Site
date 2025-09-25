import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, UserIcon } from 'lucide-react';
// FUNCTIONALITY: Site header and navigation, including login/signup or account button when signed in.

interface HeaderProps {
  user: any;
  authChecked: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, authChecked }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <header className="w-full bg-transparent sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent">
            <img
              src="/jambot_icon.png"
              alt="jambot_icon"
              className="h-16 w-auto"
            />
          </span>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="/#features" className="text-white hover:text-blue-400 transition-colors">
            Features
          </a>
          <a href="/#pricing" className="text-white hover:text-blue-400 transition-colors">
            Pricing
          </a>
          <a href="/#contact" className="text-white hover:text-blue-400 transition-colors">
            Contact
          </a>
          {!authChecked ? (
            // Skeleton to avoid flicker and prevent clicks before auth status is known
            <div className="w-32 h-9 rounded-lg bg-white/10 animate-pulse" aria-hidden />
          ) : user ? (
            <button
              className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors hover:opacity-90"
              onClick={() => navigate('/account')}
            >
              <UserIcon size={18} className="mr-2" />
              My Account
            </button>
          ) : (
            <button
              className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors hover:opacity-90"
              onClick={() => navigate('/login')}
            >
              Sign Up / Login
            </button>
          )}
        </nav>
        {/* Mobile menu button */}
        <button
          className="md:hidden text-white hover:text-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-transparent border-t border-gray-800">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
            <a href="#features" className="py-2 text-white hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#pricing" className="py-2 text-white hover:text-blue-400 transition-colors">
              Pricing
            </a>
            <a href="#contact" className="py-2 text-white hover:text-blue-400 transition-colors">
              Contact
            </a>
            {!authChecked ? (
              // Mobile skeleton placeholder while auth is resolving
              <div className="w-full h-10 rounded-lg bg-white/10 animate-pulse" aria-hidden />
            ) : user ? (
              <button
                className="flex items-center justify-center w-full px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors text-center hover:opacity-90"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/account');
                }}
              >
                <UserIcon size={18} className="mr-2" />
                My Account
              </button>
            ) : (
              <button
                className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors text-center hover:opacity-90"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
              >
                Sign Up / Login
              </button>
            )}
          </div>
        </div>
      )}
      {/* Subscription Modal */}

    </header>
  );
};