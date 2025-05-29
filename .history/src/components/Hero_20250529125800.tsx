import React, { useState } from 'react';
import { PlayIcon, MusicIcon, SparklesIcon } from 'lucide-react';
import { SignupModal } from './SignupModal';
export function Hero() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  return <>
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="max-w-4xl mx-auto text-center transform -translate-y-[10%]">
          {/* Hero Content */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 flex justify-center">
              <img src="../../public/Transparent_Logo.png" alt="JamBot Logo" className="h-96 md:h-128 w-auto" />
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              AI-Powered Music Creation
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Transform your musical ideas into reality with cutting-edge AI
              technology. Create, collaborate, and compose like never before.
            </p>
          </div>
          {/* Feature Icons */}
          <div className="flex justify-center items-center space-x-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-2">
                <MusicIcon className="h-8 w-8 text-white" />
              </div>
              <span className="text-sm text-gray-400">Compose</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mb-2">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <span className="text-sm text-gray-400">AI-Enhanced</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-2">
                <PlayIcon className="h-8 w-8 text-white" />
              </div>
              <span className="text-sm text-gray-400">Perform</span>
            </div>
          </div>
          {/* Call to Action */}
          <div className="flex justify-center">
            <button onClick={() => setIsSignupModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
              Sign up for early access
            </button>
          </div>
        </div>
      </main>
      <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />
    </>;
}