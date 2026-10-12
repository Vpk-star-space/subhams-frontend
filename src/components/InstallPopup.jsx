import React, { useState, useEffect } from 'react';

const InstallPopup = () => {
  // 🌟 Start as true if the early event in index.js already caught it
  const [isInstallable, setIsInstallable] = useState(
    () => typeof window !== 'undefined' && !!window.deferredInstallPrompt
  );

  // 🌟 FIXED: No more localStorage flag. Only real "installed app" mode counts.
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)').matches;
    const isIOS = window.navigator.standalone === true;
    return isStandalone || isIOS;
  });

  useEffect(() => {
    // Event may have arrived before this component mounted
    if (window.deferredInstallPrompt) setIsInstallable(true);

    const handleReady = () => setIsInstallable(true);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      window.deferredInstallPrompt = null;
    };

    window.addEventListener('pwa-installable', handleReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // THE INSTALL BUTTON CLICK
  const handleInstallClick = async () => {
    const promptEvent = window.deferredInstallPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    // The prompt can only be used once, so always clear it
    window.deferredInstallPrompt = null;
    setIsInstallable(false);
    if (outcome === 'accepted') setIsInstalled(true);
  };

  // THE NATIVE SHARE LOGIC
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Subhams PMMS',
          text: 'Check out the Subhams Personal Money Management System (PMMS). Secure architecture engineered for financial tracking.',
          url: window.location.origin,
        });
      } catch (err) { console.log('Share failed', err); }
    } else {
      alert("Copy this link to share: " + window.location.origin);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes liquidGlow {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          @keyframes iconFloat {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-3px) scale(1.1); }
          }
          @keyframes bannerSlideDown {
            0% { transform: translateY(-100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      {/* ↗️ LIQUID GLASS SHARE BUTTON */}
      <div style={{ position: 'fixed', bottom: '95px', right: '25px', zIndex: 9997 }}>
        <button
          onClick={handleShare}
          title="Share Subhams PMMS"
          style={{
            padding: '12px 20px',
            borderRadius: '30px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#0f172a',
            fontWeight: '700',
            fontSize: '14px',
            animation: 'liquidGlow 2.5s infinite',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
          }}
        >
          <span style={{ fontSize: '18px', animation: 'iconFloat 2s infinite ease-in-out', display: 'inline-block' }}>
            ↗️
          </span>
        </button>
      </div>

      {/* 📲 TOP-BANNER INSTALL */}
      {isInstallable && !isInstalled && (
        <div style={{
          background: 'linear-gradient(90deg, #0f172a, #065f46)',
          color: 'white',
          padding: '12px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          boxSizing: 'border-box',
          zIndex: 99999,
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          animation: 'bannerSlideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>💰</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '0.5px' }}>Install PMMS Vault</span>
              <span style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: '600' }}>Secure • Fast • App Access</span>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            style={{
              background: 'linear-gradient(135deg, #facc15, #f59e0b)',
              color: '#713f12',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '20px',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            INSTALL APP
          </button>
        </div>
      )}
    </>
  );
};

export default InstallPopup;