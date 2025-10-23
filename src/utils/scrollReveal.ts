export function initScrollReveal() {
  const options = {
    threshold: 0.1 // Trigger when 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionally stop observing after animation is triggered
        // observer.unobserve(entry.target);
      }
    });
  }, options);

  // Observe all elements with reveal-on-scroll class
  setTimeout(() => {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }, 100); // Small delay to ensure DOM is ready

  return observer;
}
