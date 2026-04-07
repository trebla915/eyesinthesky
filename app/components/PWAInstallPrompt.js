'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';

const DISMISSED_KEY = 'pwa-install-dismissed';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY)) {
      return;
    }

    const handler = (e) => {
      // Prevent the browser's default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // Whether accepted or dismissed by the native dialog, hide our banner
    setVisible(false);
    setDeferredPrompt(null);
    if (outcome === 'dismissed') {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-install-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 p-4 flex items-center gap-4"
          role="dialog"
          aria-label="Install Eyes In The Sky"
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-400" aria-hidden="true" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">
              Install Eyes In The Sky
            </p>
            <p className="text-xs text-white/60 mt-0.5 leading-tight">
              Get live El Paso alerts on your home screen
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
