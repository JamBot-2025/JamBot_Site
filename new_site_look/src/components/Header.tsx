import React, { useState } from 'react';
import { MenuIcon, XIcon, UserIcon } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [showAccountPage, setShowAccountPage] = useState(false);
  const openModal = (initialPage?: 'account') => {
    if (initialPage === 'account' && isLoggedIn) {
      setShowAccountPage(true);
    }
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setShowAccountPage(false);
  };
  return <header className="w-full bg-black sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent">
            AppName
          </span>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white hover:text-blue-400 transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-white hover:text-blue-400 transition-colors">
            Pricing
          </a>
          <a href="#contact" className="text-white hover:text-blue-400 transition-colors">
            Contact
          </a>
          {isLoggedIn ? <button className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors hover:opacity-90" onClick={() => openModal('account')}>
              <UserIcon size={18} className="mr-2" />
              My Account
            </button> : <button className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors hover:opacity-90" onClick={() => openModal()}>
              Sign Up / Login
            </button>}
        </nav>
        {/* Mobile menu button */}
        <button className="md:hidden text-white hover:text-gray-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && <div className="md:hidden bg-black border-t border-gray-800">
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
            {isLoggedIn ? <button className="flex items-center justify-center w-full px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors text-center hover:opacity-90" onClick={() => openModal('account')}>
                <UserIcon size={18} className="mr-2" />
                My Account
              </button> : <button className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors text-center hover:opacity-90" onClick={() => openModal()}>
                Sign Up / Login
              </button>}
          </div>
        </div>}
      {/* Subscription Modal */}
      <SubscriptionModal isOpen={isModalOpen} onClose={closeModal} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userDetails={userDetails} setUserDetails={setUserDetails} showAccountPage={showAccountPage} />
    </header>;
};