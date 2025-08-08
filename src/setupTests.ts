/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';


// Mock IntersectionObserver for jsdom
declare global {
  interface Window {
    IntersectionObserver?: any;
    IntersectionObserverEntry?: any;
  }
}

if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  window.IntersectionObserver = IntersectionObserver;
  window.IntersectionObserverEntry = function() {};
}