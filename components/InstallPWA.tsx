import React, { useState, useEffect } from 'react';

// This interface is a minimal representation of the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = setTimeout(() => {
      // Only show the banner if the app is not already installed
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      if (!isInStandaloneMode) {
        setIsVisible(true);
      }
    }, 3000); // 3-second delay

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setIsVisible(false);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismissClick = () => {
    setIsVisible(false);
  };
  
  const handleIosDismissClick = () => {
    localStorage.setItem('iosInstallDismissed', 'true');
    setIsVisible(false);
  };
  
  if (!isVisible) {
    return null;
  }

  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const hasDismissedIosPrompt = localStorage.getItem('iosInstallDismissed') === 'true';

  // Show Android/Desktop banner if the prompt event has been captured
  if (deferredPrompt && !isIos) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 right-4 z-50 animate-fade-in-up">
        <div className="bg-card border border-border-card rounded-lg shadow-2xl p-4 max-w-sm flex items-center gap-4">
          <img src="/icon.svg" alt="Soul Patterns Icon" className="h-12 w-12" />
          <div>
            <h3 className="font-bold text-main">Instalar Soul Patterns</h3>
            <p className="text-sm text-secondary">Acceso rápido a tus diseños y agenda desde tu pantalla de inicio.</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="w-full bg-primary text-primary-contrast font-bold py-1.5 px-3 rounded-md text-sm hover:opacity-90 transition-opacity"
              >
                Instalar
              </button>
              <button
                onClick={handleDismissClick}
                className="w-full bg-border-card text-main font-bold py-1.5 px-3 rounded-md text-sm hover:opacity-80 transition-opacity"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show iOS banner if it's an iOS device and the user hasn't dismissed it before
  if (isIos && !hasDismissedIosPrompt) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto z-50 animate-fade-in-up">
        <div className="bg-card border border-border-card rounded-lg shadow-2xl p-4 max-w-sm mx-auto flex items-start gap-4">
          <img src="/icon.svg" alt="Soul Patterns Icon" className="h-10 w-10 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-main">Instala la App en tu iPhone</h3>
            <p className="text-sm text-secondary">
              Pulsa el icono de Compartir 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mx-1 align-text-bottom text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              y luego selecciona "Añadir a pantalla de inicio".
            </p>
            <div className="text-right mt-2">
              <button
                onClick={handleIosDismissClick}
                className="bg-primary text-primary-contrast font-bold py-1.5 px-4 rounded-md text-sm hover:opacity-90 transition-opacity"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPWA;