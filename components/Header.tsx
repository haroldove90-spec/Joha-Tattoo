import React from 'react';
import { View } from '../App';

interface HeaderProps {
    isHome: boolean;
    currentTheme: 'light' | 'dark';
    toggleTheme: () => void;
    setView?: (view: View) => void;
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ isHome, currentTheme, toggleTheme, setView, title }) => {
    
    const Logo = () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z" fill="currentColor"/>
            <path d="M12 6L14.5 9.5L12 13L9.5 9.5L12 6Z" fill="currentColor"/>
            <path d="M6 12L9.5 14.5L12 12L9.5 9.5L6 12Z" fill="currentColor"/>
            <path d="M18 12L14.5 14.5L12 12L14.5 9.5L18 12Z" fill="currentColor"/>
            <path d="M12 18L9.5 14.5L12 11L14.5 14.5L12 18Z" fill="currentColor"/>
        </svg>
    );

    const ThemeToggle = () => (
        <button onClick={toggleTheme} className="text-main focus:outline-none" aria-label="Toggle Theme">
            {currentTheme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
        </button>
    );

    const BackButton = () => (
        <button onClick={() => setView && setView('home')} className="text-main" aria-label="Go Back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
    );

    return (
        <header className="py-4 container mx-auto px-4">
            <div className="flex justify-between items-center h-12">
                <div className="w-1/3 flex justify-start">
                  {!isHome && <BackButton />}
                </div>

                <div className="w-1/3 flex justify-center items-center gap-2">
                    <Logo />
                    <span className="font-bold text-lg text-main">
                        {isHome ? 'Johana Tatuajes' : title}
                    </span>
                </div>

                <div className="w-1/3 flex justify-end">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default Header;