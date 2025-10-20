import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Gallery from './components/Gallery';
import GenerateDesign from './components/GenerateDesign';
import CreateTrace from './components/CreateTrace';
import TryOnTattoo from './components/TryOnTattoo';
import Agenda from './components/Agenda';
import Clients from './components/Clients';
import BottomNav from './components/BottomNav';
import Assistant from './components/Assistant';
import InstallPWA from './components/InstallPWA';
import Loader from './components/Loader';

export type View = 'home' | 'gallery' | 'agenda' | 'clients' | 'assistant' | 'generate' | 'trace' | 'try-on';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [keySelectionError, setKeySelectionError] = useState<string | null>(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
  
  useEffect(() => {
    const checkApiKey = async () => {
      // It might take a moment for the aistudio object to be available.
      // This simple retry logic helps ensure we can check for the key.
      let attempts = 0;
      const interval = setInterval(async () => {
        if (window.aistudio || attempts > 5) {
          clearInterval(interval);
          try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
          } catch (e) {
            console.error("Error checking for API key, assuming none is selected.", e);
            setIsKeySelected(false);
          } finally {
            setIsCheckingKey(false);
          }
        }
        attempts++;
      }, 200);
    };

    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    setKeySelectionError(null); // Clear previous errors
    try {
        if (!window.aistudio || typeof window.aistudio.openSelectKey !== 'function') {
            throw new Error("aistudio.openSelectKey is not available.");
        }
        await window.aistudio.openSelectKey();
        // Per guidelines, assume success after calling to handle potential race conditions.
        setIsKeySelected(true);
    } catch (e) {
        console.error("Could not open API key selection dialog.", e);
        setKeySelectionError("No se pudo abrir el diálogo de selección de clave. Por favor, recarga la página e inténtalo de nuevo.");
    }
  };

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home setView={setView} />;
      case 'gallery':
        return <Gallery />;
      case 'generate':
        return <GenerateDesign />;
      case 'trace':
        return <CreateTrace />;
      case 'try-on':
        return <TryOnTattoo />;
      case 'agenda':
        return <Agenda />;
      case 'clients':
        return <Clients />;
      case 'assistant':
        return <Assistant />;
      default:
        return <Home setView={setView} />;
    }
  };

  const isFullScreenView = ['generate', 'trace', 'try-on'].includes(view);
  const showHeader = view !== 'home' && !isFullScreenView;

  const getTitleForView = (view: View) => {
    switch(view) {
      case 'gallery': return 'Galería';
      case 'agenda': return 'Agenda';
      case 'clients': return 'Clientes';
      case 'assistant': return 'Asistente';
      case 'generate': return 'Generar Diseño';
      case 'trace': return 'Crear Trazo';
      case 'try-on': return 'Prueba Virtual';
      default: return '';
    }
  }
  
  if (isCheckingKey) {
    return (
      <div className="bg-app text-main min-h-screen flex items-center justify-center">
        <div className="text-center">
             <h1 className="text-xl font-bold font-cinzel text-main mb-4">Verificando configuración...</h1>
            <Loader />
        </div>
      </div>
    );
  }

  if (!isKeySelected) {
    return (
       <div className="bg-app text-main min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border-card rounded-lg p-8 text-center max-w-md animate-fade-in-up">
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
            <path d="M26.968 13.032C26.968 12.336 27.536 11.768 28.232 11.768C28.928 11.768 29.536 12.336 29.536 13.032C29.536 13.728 28.928 14.336 28.232 14.336C27.536 14.336 26.968 13.728 26.968 13.032ZM11.768 28.232C11.768 27.536 12.336 26.968 13.032 26.968C13.728 26.968 14.336 27.536 14.336 28.232C14.336 28.928 13.728 29.536 13.032 29.536C12.336 29.536 11.768 28.928 11.768 28.232ZM13.032 11.768C12.336 11.768 11.768 12.336 11.768 13.032C11.768 13.728 12.336 14.336 13.032 14.336C13.728 14.336 14.336 13.728 14.336 13.032C14.336 12.336 13.728 11.768 13.032 11.768ZM28.232 26.968C27.536 26.968 26.968 27.536 26.968 28.232C26.968 28.928 27.536 29.536 28.232 29.536C28.928 29.536 29.536 28.928 29.536 28.232C29.536 27.536 28.928 26.968 28.232 26.968ZM20 2.5C10.335 2.5 2.5 10.335 2.5 20C2.5 29.665 10.335 37.5 20 37.5C29.665 37.5 37.5 29.665 37.5 20C37.5 10.335 29.665 2.5 20 2.5ZM20 34.375C12.063 34.375 5.625 27.938 5.625 20C5.625 12.062 12.063 5.625 20 5.625C27.938 5.625 34.375 12.062 34.375 20C34.375 27.938 27.938 34.375 20 34.375ZM20 16.875C18.406 16.875 17.188 18.133 17.188 19.688V22.812C17.188 23.508 17.756 24.075 18.453 24.075H21.547C22.244 24.075 22.812 23.508 22.812 22.812V19.688C22.812 18.133 21.594 16.875 20 16.875ZM20 8.125C18.406 8.125 17.188 9.383 17.188 10.938V12.188C17.188 12.883 17.756 13.45 18.453 13.45H21.547C22.244 13.45 22.812 12.883 22.812 12.188V10.938C22.812 9.383 21.594 8.125 20 8.125ZM10.938 17.188C9.383 17.188 8.125 18.406 8.125 20C8.125 21.594 9.383 22.812 10.938 22.812H12.188C12.883 22.812 13.45 22.244 13.45 21.547V18.453C13.45 17.756 12.883 17.188 12.188 17.188H10.938ZM27.812 17.188H26.562C25.867 17.188 25.3 17.756 25.3 18.453V21.547C25.3 22.244 25.867 22.812 26.562 22.812H27.812C29.367 22.812 30.625 21.594 30.625 20C30.625 18.406 29.367 17.188 27.812 17.188Z" fill="currentColor" className="text-primary"/>
          </svg>
          <h1 className="text-2xl font-bold font-cinzel text-main mb-4">API Key Requerida</h1>
          <p className="text-secondary mb-6">Esta aplicación utiliza modelos de IA generativa que pueden requerir una API key con la facturación habilitada. Por favor, selecciona tu clave para continuar.</p>
          
          {keySelectionError && (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-md mb-4 text-sm" role="alert">
                  {keySelectionError}
              </div>
          )}

          <button onClick={handleSelectKey} className="w-full bg-primary text-primary-contrast font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
            Seleccionar API Key
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:text-primary mt-4 block underline">
            Más información sobre la facturación
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app text-main min-h-screen font-sans flex flex-col">
      {view === 'home' ? (
         <Header isHome={true} currentTheme={theme} toggleTheme={toggleTheme} />
      ) : (
         <Header isHome={false} currentTheme={theme} toggleTheme={toggleTheme} setView={setView} title={getTitleForView(view)} />
      )}
      <main className="flex-grow container mx-auto px-4 pb-24">
        {renderView()}
      </main>
      <BottomNav activeView={view} setView={setView} />
      <InstallPWA />
    </div>
  );
};

export default App;