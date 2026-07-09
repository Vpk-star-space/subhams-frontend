import React, { useState, useEffect } from 'react';


// 🎛️ MASTER TOGGLE: Set to true to enable the recurring premium popup
const ENABLE_INSTALL_POPUP = true; 

const InstallPopup = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [showPopup, setShowPopup] = useState(false); 

  // Check if the user has already installed the app
  const isInstalled = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

// 1. Capture the Chrome Install Event
  useEffect(() => {
    // 🚀 THIS IS THE MISSING CHECK! It looks for the HTML script above.
    if (window.deferredInstallPrompt) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredInstallPrompt = e; 
      setIsInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);
  
  // 2. RECURRING TIMING LOGIC (Wait 10s -> Show 16s -> Loop)
  useEffect(() => {
    if (!ENABLE_INSTALL_POPUP || isInstalled) return;

    let timeoutId;
    const startLoop = () => {
      timeoutId = setTimeout(() => {
        setShowPopup(true); 

        setTimeout(() => {
          setShowPopup(false); 
          if (!isInstalled && ENABLE_INSTALL_POPUP) {
            startLoop();
          }
        }, 16000); 

      }, 10000);
    };

    startLoop();
    return () => clearTimeout(timeoutId);
  }, [isInstalled]);

  // 3. The Install Button Logic
  const handleInstallClick = async () => {
    const promptEvent = window.deferredInstallPrompt; 
    
    if (!promptEvent) {
      alert("Browser Security: To install securely, tap your browser menu (three dots) and select 'Add to Home screen' or 'Install App'.");
      return;
    }
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setShowPopup(false); 
    }
    window.deferredInstallPrompt = null; 
  };

  // 4. The Native Share Logic
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
      {/* 🟢 PREMIUM INJECTED CSS ANIMATIONS */}
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
          @keyframes premiumPopIn {
            0% { opacity: 0; transform: translate(-50%, -40%) scale(0.92); filter: blur(4px); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0px); }
          }
          @keyframes radarScan {
            0% { top: -10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 110%; opacity: 0; }
          }
          @keyframes shimmerBtn {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}
      </style>

      {/* ↗️ 1. LIQUID GLASS SHARE BUTTON */}
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

      {/* ⚡ 2. THE PREMIUM SECURE INSTALL POPUP */}
      {showPopup && !isInstalled && ENABLE_INSTALL_POPUP && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 9999, background: '#ffffff', borderRadius: '24px', 
          boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 0 0 100vw rgba(15, 23, 42, 0.85)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', padding: '40px 30px', width: '90%', maxWidth: '420px', 
          textAlign: 'center', 
          animation: 'premiumPopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}>
          
          {/* Animated Shield Container */}
          <div style={{ 
            position: 'relative', overflow: 'hidden', background: '#ecfdf5', width: '85px', height: '85px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            margin: '0 auto 20px auto', boxShadow: 'inset 0 2px 10px rgba(16, 185, 129, 0.2), 0 4px 15px rgba(16, 185, 129, 0.1)'
          }}>
            <span style={{ fontSize: '42px', zIndex: 2 }}>🛡️</span>
            {/* The Radar Scan Line */}
            <div style={{ 
              position: 'absolute', width: '100%', height: '3px', background: '#10b981', 
              boxShadow: '0 0 12px #10b981', left: 0, zIndex: 3, animation: 'radarScan 2.5s infinite linear' 
            }} />
          </div>
          
          <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Secure PMMS Connection
          </h4>
          
          <p style={{ margin: '0 0 25px 0', fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>
            Add PMMS to your Home Screen.<br/>
            <strong>Zero URL typing. App Can Use Anytime, Anywhere.</strong><br/>
            
            <span style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', 
              padding: '12px', background: 'linear-gradient(90deg, #f0fdf4, #ecfdf5)', color: '#065f46', 
              borderRadius: '12px', fontWeight: '700', fontSize: '13.5px', borderLeft: '4px solid #10b981' 
            }}>
              ✅ Install to hide this message forever!
            </span>
          </p>
          
          <button 
            onClick={handleInstallClick}
            style={{ 
              borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)', 
              backgroundSize: '200% auto', width: '100%', padding: '16px', fontSize: '16px', 
              opacity: isInstallable ? 1 : 0.9, boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)',
              animation: 'shimmerBtn 3s infinite linear' 
            }}
          >
            {isInstallable ? '📱 Install Secure App' : '📱 View Install Steps'}
          </button>
        </div>
      )}
    </>
  );
};

export default InstallPopup;