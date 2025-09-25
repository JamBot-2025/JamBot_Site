import { useEffect, useRef } from 'react';

import { ZapIcon, UsersIcon, ShieldIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [{
    icon: <ZapIcon size={24} className="text-green-500" />,
    title: 'Jam Along',
    description: 'Our app is optimized for speed, ensuring you never wait for data to load or actions to complete.',
    color: 'from-green-500 to-blue-500'
  }, {
    icon: <ZapIcon size={24} className="text-purple-500" />,
    title: 'Cowriter',
    description: 'Powerful analytics tools to help you understand your performance and make data-driven decisions.',
    color: 'from-purple-500 to-pink-500'
  }, {
    icon: <UsersIcon size={24} className="text-blue-500" />,
    title: 'Show your friends',
    description: 'Work together seamlessly with your team members in real-time, no matter where they are.',
    color: 'from-blue-500 to-indigo-500'
  }, {
    icon: <ShieldIcon size={24} className="text-pink-500" />,
    title: 'Edit your creation',
    description: 'Best-in-class security measures to keep your data protected and your mind at ease.',
    color: 'from-pink-500 to-red-500'
  }];

  return <section ref={sectionRef} id="features" className="w-full bg-transparent py-20 relative">
    <div className="container mx-auto px-4 relative">
      <div className="text-center mb-16 reveal-on-scroll">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Powerful Features
        </h2>
        <p className="text-xl text-white max-w-2xl mx-auto">
          Discover how our app can transform your workflow with these amazing
          features
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => <div key={index} className="hover-card bg-transparent p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 reveal-on-scroll" style={{
          animationDelay: `${index * 100}ms`
        }}>
          <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} bg-opacity-10 rounded-lg flex items-center justify-center mb-4 animate-float`}>
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">
            {feature.title}
          </h3>
          <p className="text-white/80">{feature.description}</p>
        </div>)}
      </div>
      <div className="mt-20">
        <div className="bg-transparent rounded-2xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-transparent"></div>
          <div className="relative">
            <div className="bg-transparent rounded-2xl p-8 md:p-12 border border-white/10">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                    Seamless Integration
                  </h3>
                  <p className="text-white/80 mb-6">
                    Our platform integrates with all your favorite tools,
                    creating a unified workspace that adapts to your needs.
                  </p>
                  <ul className="space-y-3 text-white">
                    {['Easy setup with existing tools', 'Automatic data synchronization', 'Customizable workflow automation'].map((item, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <button
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-colors hover:opacity-90"
                      onClick={() => navigate('/subscribe')}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl transform rotate-2 scale-105 bg-transparent"></div>
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                      alt="Integration visualization"
                      className="relative rounded-xl shadow-lg w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
};