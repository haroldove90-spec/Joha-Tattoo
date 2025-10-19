import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TipOfTheDay from './components/TipOfTheDay';
import CreateTrace from './components/CreateTrace';
import TryOnTattoo from './components/TryOnTattoo';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-gray-200">
      <Header />
      <main>
        <Hero />
        <TipOfTheDay />
        <CreateTrace />
        <TryOnTattoo />
        <Gallery />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;