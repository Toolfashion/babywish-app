import { useState, useEffect } from 'react';

/**
 * PWA Platform Detection Hook
 * Single source of truth for platform-specific logic
 */
export const usePlatform = () => {
  const [platform, setPlatform] = useState({
    isIOS: false,
    isAndroid: false,
    isPWA: false,
    isMobile: false,
    isDesktop: true,
    isSafari: false,
    isChrome: false,
    canInstall: false
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid || /webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone === true;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
    
    // Check if app can be installed (not already PWA and on supported browser)
    const canInstall = !isPWA && (
      (isIOS && isSafari) || 
      (isAndroid && isChrome) ||
      ('BeforeInstallPromptEvent' in window)
    );

    setPlatform({
      isIOS,
      isAndroid,
      isPWA,
      isMobile,
      isDesktop: !isMobile,
      isSafari,
      isChrome,
      canInstall
    });

    // Also set on window for non-React access
    window.BABYWISH_PLATFORM = {
      isIOS,
      isAndroid,
      isPWA,
      isMobile,
      isDesktop: !isMobile,
      isSafari,
      isChrome,
      canInstall
    };
  }, []);

  return platform;
};

/**
 * PWA Install Prompt Hook
 */
export const useInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const platform = usePlatform();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt (Chrome/Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for successful install
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  return {
    canPrompt: !!installPrompt,
    isInstalled,
    promptInstall,
    platform
  };
};

/**
 * Responsive styles helper
 * Returns platform-specific CSS classes
 */
export const getPlatformStyles = (platform) => {
  const styles = {
    // Safe area padding for notched devices
    safeArea: platform.isIOS ? 'pb-safe pt-safe' : '',
    
    // Touch feedback
    touchFeedback: platform.isMobile ? 'active:scale-95 transition-transform' : 'hover:scale-105 transition-transform',
    
    // Scrolling behavior
    scrolling: platform.isIOS ? '-webkit-overflow-scrolling-touch' : '',
    
    // Fixed positioning (iOS Safari quirks)
    fixedPosition: platform.isIOS ? 'fixed-ios' : 'fixed',
    
    // Button sizing
    buttonSize: platform.isMobile ? 'min-h-[44px] min-w-[44px]' : '',
    
    // Text sizing
    textBase: platform.isMobile ? 'text-base' : 'text-sm',
  };
  
  return styles;
};

export default usePlatform;
