import React from 'react';
import TipOfTheDay from './TipOfTheDay';
import { View } from '../App';

interface HomeProps {
  setView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {

  const toolButtons = [
    {
      view: 'trace' as View,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
      title: 'Crear Trazo',
      subtitle: 'Transforma un dibujo en una plantilla.'
    },
    {
      view: 'try-on' as View,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
      title: 'Probar Tatuaje',
      subtitle: 'Visualiza un diseño en la piel.'
    },
    {
      view: 'generate' as View,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      title: 'Generar Diseño',
      subtitle: 'Crea arte único a partir de ideas.'
    },
  ];

  return (
    <div className="py-8">
      <div className="mb-8">
        <TipOfTheDay />
      </div>

      <h2 className="text-xl font-bold text-main mb-4">Herramientas Creativas</h2>
      <div className="space-y-3">
        {toolButtons.map((tool) => (
          <button
            key={tool.view}
            onClick={() => setView(tool.view)}
            className="w-full bg-card border border-border-card rounded-lg p-4 flex items-center space-x-4 text-left hover:border-primary transition-colors duration-200"
          >
            <div className="flex-shrink-0">
                {tool.icon}
            </div>
            <div>
                <h3 className="font-bold text-main">{tool.title}</h3>
                <p className="text-sm text-secondary">{tool.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;