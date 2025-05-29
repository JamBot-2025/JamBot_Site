import React from 'react';
import { TwitterIcon, InstagramIcon, YoutubeIcon, GithubIcon } from 'lucide-react';
export function Footer() {
  return <footer className="w-full border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="flex items-center mb-4 md:mb-0">
            <img src="/Transparent_Logo.png" alt="JamBot Logo" className="h-10 w-auto" />
            <span className="ml-4 text-gray-400 text-sm">
              © 2025 JamBot. All rights reserved.
            </span>
          </div>
          {/* Social Media Links */}
          <div className="flex items-center space-x-6">
            <a href="https://twitter.com/jambot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <TwitterIcon className="h-6 w-6" />
            </a>
            <a href="https://instagram.com/jambot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <InstagramIcon className="h-6 w-6" />
            </a>
            <a href="https://youtube.com/jambot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <YoutubeIcon className="h-6 w-6" />
            </a>
            <a href="https://github.com/jambot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <GithubIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>;
}