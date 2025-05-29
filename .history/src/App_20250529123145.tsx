import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
export function App() {
  return <div className="min-h-screen w-full animated-gradient">
      <Header />
      <Hero />
      <Footer />
    </div>;
}