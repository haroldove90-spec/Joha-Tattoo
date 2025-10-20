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
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosInstallBanner, setShowIosInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
       // Only show banner if it's not an iOS device, as we have a separate banner for that.
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (!isIos) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Logic for iOS install prompt
    const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    // navigator.standalone is a non-standard property supported by Safari on iOS
    const isInStandaloneMode = () => ('standalone' in window.navigator) && ((window.navigator as any).standalone);

    const dismissedIosPrompt = localStorage.getItem('iosInstallDismissed') === 'true';

    if (isIos() && !isInStandaloneMode() && !dismissedIosPrompt) {
        setShowIosInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    setShowInstallBanner(false);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismissClick = () => {
    setShowInstallBanner(false);
  };
  
  const handleIosDismissClick = () => {
    localStorage.setItem('iosInstallDismissed', 'true');
    setShowIosInstallBanner(false);
  };

  if (showInstallBanner) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 right-4 z-50 animate-fade-in-up">
        <div className="bg-card border border-border-card rounded-lg shadow-2xl p-4 max-w-sm flex items-center gap-4">
          <img src="/icon.svg" alt="Joha Tattoo Icon" className="h-12 w-12" />
          <div>
            <h3 className="font-bold text-main">Instalar Joha Tattoo</h3>
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

  if (showIosInstallBanner) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto z-50 animate-fade-in-up">
        <div className="bg-card border border-border-card rounded-lg shadow-2xl p-4 max-w-sm mx-auto flex items-start gap-4">
          <img src="/icon.svg" alt="Joha Tattoo Icon" className="h-10 w-10 shrink-0 mt-1" />
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
