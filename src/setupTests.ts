import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

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