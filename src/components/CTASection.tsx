import { NewsletterSignup } from './NewsletterSignup';

export const CTASection = () => {

  return (
    <section id="contact" className="w-full bg-transparent py-20 text-white relative overflow-hidden">
      {/* Background removed to let purple show through */}
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your future AI bandmates are waiting. 
          </h2>
          <p className="text-xl text-white/90 mb-8">
          Join a new wave of musicians using JamBot to spark creativity, unlock fresh
          ideas, and bring real-time AI collaboration into their practice and performance.
          </p>
          <div className="bg-transparent p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <NewsletterSignup inline={true} />
          </div>
        </div>
      </div>
    </section>
  );
};