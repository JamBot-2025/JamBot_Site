import { ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  return <section className="w-full bg-black py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-green-600/20 animate-gradient-flow blur-3xl opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/15 via-transparent to-orange-600/15 animate-gradient-shift blur-2xl opacity-70" style={{
        animationDelay: '-8s'
      }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-600/10 to-transparent animate-gradient-pulse blur-xl" style={{
        animationDelay: '-3s'
      }}></div>
      </div>
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between relative">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Simplify Your Workflow with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              AppName
            </span>
          </h1>
          <p className="text-xl text-white mb-8 max-w-lg">
            The all-in-one solution designed to boost productivity and
            streamline your daily tasks. Experience the future of work today.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors text-lg font-medium flex items-center justify-center hover:opacity-90"
              onClick={() => navigate('/subscribe')}
            >
              Get Started
              <ArrowRightIcon size={20} className="ml-2" />
            </button>
            <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-lg font-medium border border-white/10">
              Watch Demo
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-green-600/40 rounded-xl transform rotate-3 scale-105 blur-2xl animate-gradient-flow opacity-60"></div>
            <div className="relative bg-black rounded-xl shadow-xl overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="App screenshot" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};