import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Gallery from './components/Gallery';
import GenerateDesign from './components/GenerateDesign';
import CreateTrace from './components/CreateTrace';
import TryOnTattoo from './components/TryOnTattoo';
import Agenda from './components/Agenda';
import Clients from './components/Clients';
import Sales from './components/Sales';
import BottomNav from './components/BottomNav';
import Assistant from './components/Assistant';
import InstallPWA from './components/InstallPWA';

export type View = 'home' | 'gallery' | 'agenda' | 'clients' | 'assistant' | 'generate' | 'trace' | 'try-on' | 'sales';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Request persistent storage to protect app data from being auto-cleared.
  useEffect(() => {
    const requestPersistence = async () => {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persisted();
                if (!isPersisted) {
                    await navigator.storage.persist();
                }
            } catch (error) {
                console.error('Failed to request persistent storage:', error);
            }
        }
    };
    requestPersistence();
  }, []);

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
       case 'sales':
        return <Sales />;
      case 'assistant':
        return <Assistant />;
      default:
        return <Home setView={setView} />;
    }
  };

  const isFullScreenView = ['generate', 'trace', 'try-on'].includes(view);

  const getTitleForView = (view: View) => {
    switch(view) {
      case 'gallery': return 'Galería';
      case 'agenda': return 'Agenda';
      case 'clients': return 'Clientes';
      case 'sales': return 'Ventas';
      case 'assistant': return 'Asistente';
      case 'generate': return 'Generar Diseño';
      case 'trace': return 'Crear Trazo';
      case 'try-on': return 'Prueba Virtual';
      default: return '';
    }
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