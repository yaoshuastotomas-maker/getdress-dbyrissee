import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed in standalone mode or explicitly dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  // If browser supports beforeinstallprompt (Android, Desktop Chrome, Edge)
  if (isInstallable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-stone-900/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-100 p-4 rounded-2xl border border-amber-500/30 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide">Get Dress'd by Rissée</p>
              <p className="text-[11px] text-stone-400">Install for faster fittings & instant alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {/* Discrete bottom banner trigger */}
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-stone-900/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-100 p-3.5 rounded-2xl border border-amber-500/30 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide">Install on your iPhone</p>
                <p className="text-[11px] text-stone-400">Add to Home Screen as a native app</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIOSModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                Guide
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Walkthrough for iOS */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl text-stone-900 dark:text-stone-100 relative">
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/apple-touch-icon.png"
                  alt="Rissée Boutique"
                  className="w-12 h-12 rounded-2xl shadow-md border border-amber-500/30"
                />
                <div>
                  <h3 className="font-serif text-lg font-semibold">Get Dress'd by Rissée</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">iOS App Store & Home Screen Setup</p>
                </div>
              </div>

              <div className="space-y-3.5 my-5 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      Tap the <Share2 className="w-3.5 h-3.5 text-blue-500" /> Share button
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Located in the bottom Safari toolbar on iPhone or top right on iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      Select <PlusSquare className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" /> Add to Home Screen
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Scroll down through the share sheet options until you see this icon.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      Tap <span className="font-bold text-amber-600 dark:text-amber-400">Add</span> in the top right
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Enjoy instant fullscreen access without browser bars or URL inputs!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 mb-4 justify-center">
                <CheckCircle2 className="w-4 h-4" />
                <span>Syncs live with new dresses & availability automatically</span>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 font-medium text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
