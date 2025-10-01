export const FooterSection = () => {
  return <footer className="w-full bg-transparent text-white py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              JamBot
            </span>
          </div>
          <nav className="mb-6 md:mb-0">
            <ul className="flex space-x-8">
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-blue-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-blue-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
          <div className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} Tunalea, Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>;
};