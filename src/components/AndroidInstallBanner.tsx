import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallBannerProps {
  onOpenAndroidHub: () => void;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  onOpenAndroidHub,
}) => {
  const { isInstallable, isStandalone, isAndroid, triggerInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('airsense_android_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('airsense_android_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await triggerInstall();
      if (!outcome) {
        onOpenAndroidHub();
      }
    } else {
      onOpenAndroidHub();
    }
  };

  return (
    <div
      id="android-install-banner"
      className="border-b border-emerald-900/10 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-4 py-2.5 text-white"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
            <Smartphone className="h-4 w-4" />
          </div>
          <p className="truncate text-slate-200">
            <strong className="text-white">Install AirSense NCR Android App:</strong>{' '}
            <span className="hidden sm:inline text-slate-300">
              Offline radar, live CAAQMS telemetry & zero browser frame.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isInstallable ? 'Install App' : 'Get Android App'}</span>
          </button>
          <button
            onClick={handleDismiss}
            title="Dismiss"
            className="rounded-md p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
