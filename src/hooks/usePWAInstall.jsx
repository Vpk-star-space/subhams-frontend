import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Listen for the browser's install prompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome from showing its default mini-infobar
      e.preventDefault();
      // Save the event so we can trigger it later
      setDeferredPrompt(e);
      // Tell our React app that it's ready to be installed
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    
    // Show the actual browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('PMMS Installed successfully');
    }
    
    // Clear the prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, installPWA };
};