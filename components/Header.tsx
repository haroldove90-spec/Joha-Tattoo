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
                           <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M26.968 13.032C26.968 12.336 27.536 11.768 28.232 11.768C28.928 11.768 29.536 12.336 29.536 13.032C29.536 13.728 28.928 14.336 28.232 14.336C27.536 14.336 26.968 13.728 26.968 13.032ZM11.768 28.232C11.768 27.536 12.336 26.968 13.032 26.968C13.728 26.968 14.336 27.536 14.336 28.232C14.336 28.928 13.728 29.536 13.032 29.536C12.336 29.536 11.768 28.928 11.768 28.232ZM13.032 11.768C12.336 11.768 11.768 12.336 11.768 13.032C11.768 13.728 12.336 14.336 13.032 14.336C13.728 14.336 14.336 13.728 14.336 13.032C14.336 12.336 13.728 11.768 13.032 11.768ZM28.232 26.968C27.536 26.968 26.968 27.536 26.968 28.232C26.968 28.928 27.536 29.536 28.232 29.536C28.928 29.536 29.536 28.928 29.536 28.232C29.536 27.536 28.928 26.968 28.232 26.968ZM20 2.5C10.335 2.5 2.5 10.335 2.5 20C2.5 29.665 10.335 37.5 20 37.5C29.665 37.5 37.5 29.665 37.5 20C37.5 10.335 29.665 2.5 20 2.5ZM20 34.375C12.063 34.375 5.625 27.938 5.625 20C5.625 12.062 12.063 5.625 20 5.625C27.938 5.625 34.375 12.062 34.375 20C34.375 27.938 27.938 34.375 20 34.375ZM20 16.875C18.406 16.875 17.188 18.133 17.188 19.688V22.812C17.188 23.508 17.756 24.075 18.453 24.075H21.547C22.244 24.075 22.812 23.508 22.812 22.812V19.688C22.812 18.133 21.594 16.875 20 16.875ZM20 8.125C18.406 8.125 17.188 9.383 17.188 10.938V12.188C17.188 12.883 17.756 13.45 18.453 13.45H21.547C22.244 13.45 22.812 12.883 22.812 12.188V10.938C22.812 9.383 21.594 8.125 20 8.125ZM10.938 17.188C9.383 17.188 8.125 18.406 8.125 20C8.125 21.594 9.383 22.812 10.938 22.812H12.188C12.883 22.812 13.45 22.244 13.45 21.547V18.453C13.45 17.756 12.883 17.188 12.188 17.188H10.938ZM27.812 17.188H26.562C25.867 17.188 25.3 17.756 25.3 18.453V21.547C25.3 22.244 25.867 22.812 26.562 22.812H27.812C29.367 22.812 30.625 21.594 30.625 20C30.625 18.406 29.367 17.188 27.812 17.188Z" fill="currentColor" className="text-primary"/>
                            </svg>
                            <h1 className="text-xl font-bold font-cinzel text-main">Johana Tatuajes</h1>
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