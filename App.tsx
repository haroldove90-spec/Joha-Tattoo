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

export type View = 'home' | 'gallery' | 'agenda' | 'clients' | 'assistant' | 'generate' | 'trace' | 'try-on';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

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
    </div>
  );
};

export default App;