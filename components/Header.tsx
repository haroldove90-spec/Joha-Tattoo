
import React, { useState, useEffect } from 'react';

const TattooIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.263a4.5 4.5 0 01-8.318-1.545 4.502 4.502 0 01-1.364 8.581 4.5 4.5 0 01-8.318-1.545m18 0a4.502 4.502 0 00-1.364-8.581 4.5 4.5 0 00-8.318 1.545m9.682 7.036a4.502 4.502 0 01-1.364-8.581 4.5 4.5 0 018.318-1.545m-9.682 7.036V15.263m0 0a4.5 4.5 0 00-8.318 1.545m8.318-1.545a4.502 4.502 0 011.364-8.581 4.5 4.5 0 018.318 1.545" />
    </svg>
);


const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);
    
    const navLinks = [
        { href: '#designer', text: 'Designer' },
        { href: '#portfolio', text: 'Portfolio' },
        { href: '#about', text: 'About' },
        { href: '#contact', text: 'Contact' }
    ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-sm shadow-lg shadow-rose-500/10' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="flex items-center space-x-2">
            <TattooIcon />
            <span className="text-2xl font-bold font-cinzel tracking-wider text-white">Joha Tattoo</span>
        </a>
        <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
                 <a key={link.href} href={link.href} className="text-gray-300 hover:text-rose-500 transition duration-300 font-medium tracking-wide">{link.text}</a>
            ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
