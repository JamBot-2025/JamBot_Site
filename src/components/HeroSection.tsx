// Imports commented out since buttons are disabled
// import { ArrowRightIcon } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  // const navigate = useNavigate(); // Commented out since not used
  return <section className="w-full bg-transparent py-20 relative">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between relative">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <img
            src="/jambot_logo.png"
            alt="jambot_logo"
            className="h-80 w-auto mx-auto"
          />
          <p className="text-xl text-white mb-8 max-w-lg mx-auto text-center">
            The AI-powered DAW, built for the browser. 
          </p>
          <h3 className="text-2xl text-white mx-auto text-center font-bold">
            Launching 11/1/25
          </h3>
          {/* Buttons commented out
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors text-lg font-medium flex items-center justify-center hover:opacity-90"
              onClick={() => navigate('/subscribe')}
            >
              Get Started
              <ArrowRightIcon size={20} className="ml-2" />
            </button>
            <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-lg font-medium border border-white/10">
              Watch Demosign
            </button>
          </div>
          */}
        </div>
        <div className="lg:w-1/2 flex justify-center">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-0 rounded-xl rotate-3 scale-105 bg-black/30"></div>

          <div className="relative rounded-xl shadow-xl border border-white/10">
            <div className="overflow-hidden rounded-xl">
              <div className="transform scale-[1] origin-center">
                <img
                  src="/signal_screenshot.png"
                  alt="App screenshot"
                  className="block w-auto h-auto"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>;
};