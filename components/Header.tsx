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
    const homeHeaderClasses = "flex items-center justify-between";
    const homeLogoClasses = "flex items-center gap-3";
    const homeTitleContainerClasses = "flex-grow sm:text-center";
    
    return (
        <header className="py-4 px-4 sticky top-0 bg-app z-10 border-b border-border-card backdrop-blur-sm bg-opacity-80">
            <div className="container mx-auto flex items-center justify-between">
                {isHome ? (
                    <div className="flex items-center justify-between w-full">
                       <div className="flex items-center gap-3">
                           <img src="https://appdesignmex.com/johanatatoo2.png" alt="Soul Patterns Logo" className="h-10 w-10 rounded-full" />
                            <h1 className="text-xl font-bold font-cinzel text-main">Soul Patterns</h1>
                       </div>
                        <button 
                            onClick={toggleTheme} 
                            className="text-main hover:text-primary p-2 rounded-full transition-colors"
                            aria-label="Cambiar tema"
                        >
                            {currentTheme === 'dark' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 flex justify-start">
                            <button 
                                onClick={() => setView && setView('home')} 
                                className="text-main hover:text-primary p-2 -ml-2 rounded-full transition-colors"
                                aria-label="Volver a inicio"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-main capitalize text-center">{title}</h2>
                        <div className="flex-1 flex justify-end">
                            <button 
                                onClick={toggleTheme} 
                                className="text-main hover:text-primary p-2 rounded-full transition-colors"
                                aria-label="Cambiar tema"
                            >
                                {currentTheme === 'dark' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;